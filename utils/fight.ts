import { Arena, type ArenaOptions } from './arenas';
import { arenasCollection } from './arenas';
import { EventEmitter } from 'eventemitter3';
import { Clock } from './clock';
import { FightCollection } from './fight-collection';
import { decodeFight, getBasicValues } from './decode-fight';
import { FightSection } from './sections';

import {
    type ScheduleMode,
    type Scheduled,
    getScheduledDuration,
    executeScheduled,
} from './scheduled';

import Debug from 'debug';
const debug = Debug('game:utils:fight');

export const DefaultFightSchedulingMode = 'sequential';

export type FightOptions = {
    title?: string
    description?: string

    name?: string
    scheduling?: ScheduleMode
    sections: Scheduled<FightSection>[]
    collection: FightCollection
    clock?: Clock
    arenaType?: string
    arena: ArenaOptions & any
}

export class Fight extends EventEmitter {
    name: string;
    description?: string;

    scheduling: ScheduleMode;
    sections: Scheduled<FightSection>[];
    collection: FightCollection;
    clock: Clock;
    isActive: boolean = false;
    options: FightOptions;
    arena: Arena;

    getDuration() {
        let duration = 0;
        if (this.scheduling === 'sequential') {
            const len = this.sections.length;
            for (let i = 0; i < len; i++) {
                const section = this.sections[i];
                duration += getScheduledDuration(section, ((i) => i?.getDuration() || 0));
            }
        } else {
            duration += Math.max(
                ...this.sections.map(
                    (section) => getScheduledDuration(section, ((i) => i?.getDuration() || -0))
                )
            );
        }

        return duration;
    }

    constructor(options: FightOptions) {
        super();
        this.options = options;
        this.sections = options.sections || [];
        this.scheduling = options.scheduling || DefaultFightSchedulingMode;
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        const len = this.sections.length;
        for (let i = 0; i < len; i++) {
            const section = this.sections[i];
            section.item.on('effect-hit', (data) => {
                this.emit('effect-hit', {
                    ...data,
                });
            });
        }

        this.name = options.name || options.title || 'fight';
        this.description = options.description;

        const ArenaClass = (options.arenaType && (arenasCollection as any)[options.arenaType]) || arenasCollection.default;
        this.arena = new ArenaClass(
            options.arena.name || `${this.name || 'fight'}Arena`,
            { ...options.arena },
            this.collection.scene
        );
        this.collection.setArena(this.arena);
    }

    toJSON() {
        const results = getBasicValues(this.options);
        return {
            name: this.name,
            ...results,
            arena: this.arena?.toJSON(),
            sections: this.sections,
        };
    }

    async execute() {
        this.isActive = true;
        this.emit('start-execute');

        if (this.scheduling === 'sequential') {
            const len = this.sections.length;
            for (let i = 0; i < len; i++) {
                if (!this.isActive) break;
                await this.executeSection(this.sections[i])
            }
        } else if (this.isActive) {
            await Promise.all(this.sections.map(s => this.executeSection(s)));
        }

        this.isActive = false;
        this.emit('end-execute');
    }

    async executeSection(section: Scheduled<FightSection>) {
        this.emit('start-section', { section });
        if (section?.preStartDelay) { await this.clock.wait(section.preStartDelay); }
        await executeScheduled(section, (item) => Promise.resolve(this.isActive && item.execute()), this.clock)
        this.emit('end-section', { section });
    }

    async dispose() {
        this.isActive = false;
        const len = this.sections.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push(this.sections[i]?.item?.dispose());
        }
        await Promise.all(promises);
        this.arena?.dispose();
    }

    clone() {
        return decodeFight(JSON.parse(JSON.stringify(this)), {
            collection: this.collection,
            clock: this.clock,
        });
    }
}

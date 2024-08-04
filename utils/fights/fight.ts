import * as Bab from '@babylonjs/core';
import { Arena, type ArenaOptions } from '../arenas';
import { arenasCollection } from '../arenas';
import { EventEmitter } from 'eventemitter3';
import { Clock } from '../clock';
import { FightCollection } from '../fight-collection';
import { decodeFight, getBasicValues } from '../decode-fight';
import { FightSection } from '../sections';
import type { PositionType, PositionOption } from '../positioning';
import { getPosition } from '../positioning';
import { type WaymarkName, Waymark } from '../waymark';

import {
    type ScheduleMode,
    type Scheduled,
    getScheduledDuration,
    executeScheduled,
} from '../scheduled';

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

    waymarks?: Partial<Record<WaymarkName, PositionOption>>
    waymarksPositionType?: PositionType

    startPosition?: PositionOption
    startPositionType?: PositionType
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

    startPosition?: PositionOption
    startPositionType?: PositionType
    waymarks?: Waymark[]

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

    getStartPosition(): Bab.Vector3 {
        return getPosition(
            this.startPosition,
            this.startPositionType,
            this.collection
        )
    }

    createWaymarks() {
        const waymarks = this.options.waymarks;
        console.log('Create Waymarks: ', waymarks);
        if (waymarks) {
            const keys = Object.keys(waymarks) as any as WaymarkName[];
            keys.forEach((name) => {
                const position = waymarks[name];
                if (position) {
                    this.waymarks = this.waymarks || [];
                    this.waymarks?.push(
                        new Waymark(this, {
                            name,
                            position,
                            positionType: this.options.waymarksPositionType || (this.options as any).waymarkPositionType,
                        })
                    );
                }
            })
        }
    }

    findWaymark(name: string) {
        return this.waymarks?.find(w => w.name === name);
    }

    constructor(options: FightOptions) {
        super();
        this.options = options;
        this.sections = options.sections || [];
        this.scheduling = options.scheduling || DefaultFightSchedulingMode;
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        this.startPosition = options.startPosition;
        this.startPositionType = options.startPositionType;

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
            waymarks: this.options.waymarks,
        };
    }

    async execute() {
        this.isActive = true;
        this.createWaymarks();
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
        await executeScheduled(section, (item, n, p) => Promise.resolve(this.isActive && item.execute(n, p)), this.clock)
        this.emit('end-section', { section });
    }

    async dispose() {
        this.isActive = false;
        this.emit('dispose');
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

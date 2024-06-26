import * as Bab from '@babylonjs/core';
import { Arena, type ArenaOptions } from '../arenas';
import { arenasCollection } from '../arenas';
import { EventEmitter } from 'eventemitter3';
import { Clock } from '../clock';
import { FightCollection } from '../fight-collection';
import { decodeFight, getBasicValues } from '../decode-fight';
import { FightSection } from '../sections';
import type { PositionType, PositionOption } from '../positioning';

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

    getStartPositionVector(): Bab.Vector3 {
        let positionValue = typeof (this.startPosition) === 'function' ? this.startPosition() : this.startPosition;

        if (typeof positionValue === 'string') {
            if (this.startPositionType === 'mesh') {
                const mesh = this.collection.scene.getMeshByName(positionValue);
                if (mesh) { return mesh.position.clone(); }

                const character = this.collection.characters[positionValue as any];
                if (character?.position) { return character.position.clone(); }
            } else if (this.startPositionType === 'character') {
                const character = this.collection.characters[positionValue as any];
                if (character?.position) { return character.position.clone(); }

                const mesh = this.collection.scene.getMeshByName(positionValue);
                if (mesh) { return mesh.position.clone(); }
            }

            // Convert to number value
            positionValue = positionValue.split(',').map((value) => +value);
        }

        if (Array.isArray(positionValue)) {
            const split = positionValue.map(v => parseNumber(v));
            if (
                split.length >= 2 &&
                split.length <= 3 &&
                split.every(val => !isNaN(val))
            ) {
                if (split.length === 2) {
                    // Assume that we want the x,y on the arena plane: z is what we would think as the y plane kinda...
                    return new Bab.Vector3(split[0], 0, split[1]);
                } else {
                    // A regular Vector3
                    return new Bab.Vector3(split[0], split[1], split[2]);
                }
            }

            return Bab.Vector3.Zero();
        }

        return positionValue?.clone() || Bab.Vector3.Zero();
    }

    getStartPosition(): Bab.Vector3 {
        console.log('GET START POSITION: ', this.startPositionType, this.startPosition);
        let vec = this.getStartPositionVector();

        if (!this.startPositionType || this.startPositionType === 'global') {
            return vec;

        } else if (this.startPositionType === 'arena') {
            if (this.collection.arena) {
                vec = this.collection.arena.getPosition(vec);
            }

        } else if (this.startPositionType === 'character') {
            return vec;

        } else if (this.startPositionType === 'mesh') {
            return vec;
        }

        return vec;
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

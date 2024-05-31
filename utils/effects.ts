import * as Bab from '@babylonjs/core';
import { wait } from './wait';
import { EventEmitter } from 'eventemitter3';
import { Clock } from './clock';
import { FightCollection } from './fight-collection';

import {
    type ScheduleMode,
    type Scheduled,
    getScheduledDuration,
    executeScheduled,
} from './scheduled';

import Debug from 'debug';
const debug = Debug('game:utils:steering');


export interface iEffect {
    start(): Promise<void>
    execute(): Promise<void>
    getDuration(): number
}

export type EffectTargetType =
    | 'boss' | 'adds'
    | 'all' // All players
    | 'player' | 'party' | 'maintank'
    | 'tank' | 'healer' | 'dps';

export type EffectTarget =
    | EffectTargetType | Bab.Mesh;

export type EffectPositionType = 'arena' | 'global' | 'mesh' | 'character';

export type EffectOptions = {
    duration: number
    collection: FightCollection
    clock?: Clock

    target?: EffectTarget | (EffectTarget[])
    position?: Bab.Vector3 | string | (() => Bab.Vector3 | string)
    positionType?: EffectPositionType

    // Whether or not the same random target can be selected more than once,
    // when randomly selecting from a group of targets
    repeatTarget?: boolean
}

export class Effect extends EventEmitter {
    name: string = 'default';
    clock: Clock
    collection: FightCollection;
    isActive: boolean = false;

    duration: number;
    target: EffectTarget[] = [];
    position: Bab.Vector3 | string | (() => Bab.Vector3 | string)
    positionType: EffectPositionType;
    repeatTarget: boolean;

    // The mesh for the effect itself
    mesh?: Bab.Mesh;
    options: EffectOptions;

    get scene() { return this.collection.scene; }

    getTargets() {
    }

    getTarget(targetType: EffectTargetType) {
        if (targetType === 'player') {
            return this.collection.player;
        }
    }

    constructor(options: EffectOptions) {
        super();
        this.options = options;
        this.duration = options.duration ?? 0;
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;
        this.repeatTarget = options.repeatTarget ?? false;

        if (Array.isArray(options.target)) {
            this.target = options.target;
        } else if (options.target) {
            this.target = [options.target];
        }

        this.position = options.position || Bab.Vector3.Zero();
        this.positionType = options.positionType || 'arena';
    }

    getDuration() {
        return this.duration || 0;
    }

    getPosition(): Bab.Vector3 {
        const positionValue = typeof (this.position) === 'function' ? this.position() : this.position;

        if (typeof positionValue === 'string') {
            if (this.positionType === 'mesh') {
                const mesh = this.scene.getMeshByName(positionValue);
                if (mesh) { return mesh.position; }

                const character = this.collection.characters[positionValue as any];
                if (character?.position) { return character.position; }
            } else if (this.positionType === 'character') {
                const character = this.collection.characters[positionValue as any];
                if (character?.position) { return character.position; }

                const mesh = this.scene.getMeshByName(positionValue);
                if (mesh) { return mesh.position; }
            }

            // Convert to number value
            const split = positionValue.split(',').map((value) => +value);
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
                    return new Bab.Vector3(split[0], split[1], split[3]);
                }
            }

            return Bab.Vector3.Zero();
        }

        return positionValue;
    }

    async start() {
        this.emit('start');
        await this.startup();
        this.emit('post-startup');
        await this.execute();
        this.emit('pre-cleanup');
        await this.cleanup();
        this.emit('end');
    }

    async execute() {
        if (this.duration) {
            await this.clock.wait(this.duration);
        }
        this.emit('snapshot', { mesh: this.mesh });
    }

    async startup() {
        this.isActive = true;
    }

    async cleanup() {
        this.isActive = false;
    }

    toJSON() {
        let positionValue = typeof (this.position) === 'function' ? this.position() : this.position;
        if (typeof (positionValue) !== 'string') {
            positionValue = [
                positionValue.x,
                positionValue.y,
                positionValue.z,
            ].join(',');
        }

        return {
            name: this.name,
            duration: this.duration,

            position: positionValue,
            positionType: this.positionType,

            repeatTarget: this.repeatTarget,
        }
    }
}

export type MechanicOptions = {
    name?: string
    scheduling?: ScheduleMode
    effects: Scheduled<iEffect>[]
    collection: FightCollection
    clock?: Clock
}

export class Mechanic extends EventEmitter {
    name: string = 'default';
    scheduling: ScheduleMode;
    effects: Scheduled<iEffect>[];
    collection: FightCollection;
    clock: Clock;
    isActive: boolean = false;
    options: MechanicOptions;

    toJSON() {
        return {
            name: this.name,
            scheduling: this.scheduling,
            effects: this.effects,
        };
    }

    getDuration() {
        let duration = 0;
        if (this.scheduling === 'sequential') {
            const len = this.effects.length;
            for (let i = 0; i < len; i++) {
                const effect = this.effects[i];
                duration += getScheduledDuration(effect, ((i) => i?.getDuration() || 0));
            }
        } else {
            duration += Math.max(
                ...this.effects.map(
                    (effect) => getScheduledDuration(effect, ((i) => i?.getDuration() || -0))
                )
            );
        }

        return duration;
    }

    constructor(options: MechanicOptions) {
        super();
        this.options = options;
        this.effects = options.effects || [];
        this.scheduling = options.scheduling || 'parallel';
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        if (options.name) {
            this.name = options.name;
        }
    }

    async execute() {
        this.isActive = true;
        this.emit('start-execute');

        if (this.scheduling === 'sequential') {
            const len = this.effects.length;
            for (let i = 0; i < len; i++) {
                await this.executeEffect(this.effects[i])
            }
        } else {
            await Promise.all(this.effects.map(effect => this.executeEffect(effect)));
        }

        this.isActive = false;
        this.emit('end-execute');
    }

    async executeEffect(effect: Scheduled<iEffect>) {
        this.emit('start-effect', { effect });
        await executeScheduled(effect, (item) => item.start(), this.clock)
        this.emit('end-effect', { effect });
    }
}

export type SectionOptions = {
    name?: string;
    scheduling?: ScheduleMode;
    mechanics: Scheduled<Mechanic>[]
    collection: FightCollection
    clock?: Clock
}

export class FightSection extends EventEmitter {
    name: string = 'default';
    scheduling: ScheduleMode;
    mechanics: Scheduled<Mechanic>[];
    collection: FightCollection;
    clock: Clock;
    isActive: boolean = false;
    options: SectionOptions;

    toJSON() {
        return {
            name: this.name,
            scheduling: this.scheduling,
            mechanics: this.mechanics,
        };
    }

    getDuration() {
        let duration = 0;
        if (this.scheduling === 'sequential') {
            const len = this.mechanics.length;
            for (let i = 0; i < len; i++) {
                const mechanic = this.mechanics[i];
                duration += getScheduledDuration(mechanic, ((i) => i?.getDuration() || 0));
            }
        } else {
            duration += Math.max(
                ...this.mechanics.map(
                    (mechanic) => getScheduledDuration(mechanic, ((i) => i?.getDuration() || -0))
                )
            );
        }

        return duration;
    }

    constructor(options: SectionOptions) {
        super();
        this.options = options;
        this.mechanics = options.mechanics || [];
        this.scheduling = options.scheduling || 'sequential';
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        if (options.name) {
            this.name = options.name;
        }
    }

    async execute() {
        this.isActive = true;
        this.emit('start-execute');

        if (this.scheduling === 'sequential') {
            const len = this.mechanics.length;
            for (let i = 0; i < len; i++) {
                await this.executeMechanic(this.mechanics[i])
            }
        } else {
            await Promise.all(this.mechanics.map(m => this.executeMechanic(m)));
        }

        this.isActive = false;
        this.emit('end-execute');
    }

    async executeMechanic(mechanic: Scheduled<Mechanic>) {
        this.emit('start-mechanic', { mechanic });
        await executeScheduled(mechanic, (item) => item.execute(), this.clock)
        this.emit('end-mechanic', { mechanic });
    }
}

export type FightOptions = {
    name?: string
    scheduling?: ScheduleMode;
    sections: Scheduled<FightSection>[]
    collection: FightCollection
    clock?: Clock
}

export class Fight extends EventEmitter {
    name?: string;
    scheduling: ScheduleMode;
    sections: Scheduled<FightSection>[];
    collection: FightCollection;
    clock: Clock;
    isActive: boolean = false;
    options: FightOptions;

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

    toJSON() {
        return {
            name: this.name,
            scheduling: this.scheduling,
            sections: this.sections,
        };
    }

    constructor(options: FightOptions) {
        super();
        this.options = options;
        this.sections = options.sections || [];
        this.scheduling = options.scheduling || 'sequential';
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        if (options.name) {
            this.name = options.name;
        }
    }

    async execute() {
        this.isActive = true;
        this.emit('start-execute');

        if (this.scheduling === 'sequential') {
            const len = this.sections.length;
            for (let i = 0; i < len; i++) {
                await this.executeSection(this.sections[i])
            }
        } else {
            await Promise.all(this.sections.map(s => this.executeSection(s)));
        }

        this.isActive = false;
        this.emit('end-execute');
    }

    async executeSection(section: Scheduled<FightSection>) {
        this.emit('start-section', { section });
        await executeScheduled(section, (item) => item.execute(), this.clock)
        this.emit('end-section', { section });
    }
}

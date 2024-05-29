import * as Bab from '@babylonjs/core';
import { wait } from './wait';
import { EventEmitter } from 'eventemitter3';
import { Clock } from './clock';

import Debug from 'debug';
const debug = Debug('game:utils:steering');

export type ScheduleMode = 'sequential' | 'parallel';
export type Scheduled<T> = {
    item: T
    repeat?: number
    startDelay?: number
    endDelay?: number
    after?: Scheduled<T> | T
    afterRepeats?: Scheduled<T> | T
}

function isScheduled<T>(v: unknown): v is Scheduled<T> {
    return typeof v === 'object' && v != null && 'item' in v;
}

function getScheduledDuration<T>(scheduled: Scheduled<T>, getItemDuration: (item: T) => number = (() => 0)) {
    let duration = 0;
    duration += scheduled?.startDelay || 0;
    duration += getItemDuration(scheduled.item);
    duration += scheduled?.endDelay || 0;

    if (scheduled.after) {
        if (isScheduled(scheduled.after)) {
            duration += getScheduledDuration(scheduled.after, getItemDuration)
        } else {
            duration += getItemDuration(scheduled.after);
        }
    }

    if (scheduled.repeat) {
        duration += duration * scheduled.repeat;
        if (scheduled.afterRepeats) {
            if (isScheduled(scheduled.afterRepeats)) {
                duration += getScheduledDuration(scheduled.afterRepeats, getItemDuration)
            } else {
                duration += getItemDuration(scheduled.afterRepeats);
            }
        }
    }

    return duration;
}

async function executeScheduled<T>(scheduled: Scheduled<T>, func: (item: T) => Promise<void>, clock: Clock, repeatNumber = 0) {
    if (scheduled.startDelay) {
        await clock.wait(scheduled.startDelay);
    }

    await func(scheduled.item);

    if (scheduled.endDelay) {
        await clock.wait(scheduled.endDelay);
    }

    if (scheduled.after) {
        if (isScheduled(scheduled.after)) {
            await executeScheduled(scheduled.after, func, clock)
        } else {
            await func(scheduled.after);
        }
    }

    if (scheduled.repeat) {
        if (scheduled.repeat > repeatNumber) {
            await executeScheduled(scheduled, func, clock, (repeatNumber || 0) + 1)
        } else if (scheduled.afterRepeats) {
            if (isScheduled(scheduled.afterRepeats)) {
                await executeScheduled(scheduled.afterRepeats, func, clock)
            } else {
                await func(scheduled.afterRepeats);
            }
        }
    }
}

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

export type EffectPositionType = 'arena' | 'global';

export type EffectOptions = {
    duration: number
    clock: Clock
    scene: Bab.Scene
    target?: EffectTarget | (EffectTarget[])
    position?: Bab.Vector3 | (() => Bab.Vector3)
    positionType?: EffectPositionType

    // Whether or not the same random target can be selected more than once,
    // when randomly selecting from a group of targets
    repeatTarget?: boolean
}

export class Effect extends EventEmitter {
    duration: number;
    clock: Clock
    scene: Bab.Scene;
    target: EffectTarget[] = [];
    position: Bab.Vector3 | (() => Bab.Vector3);
    positionType: EffectPositionType;
    repeatTarget: boolean;
    mesh?: Bab.Mesh;
    isActive: boolean = false;

    options: EffectOptions;

    toJSON() {
        const { x, y, z } = this.getPosition();
        return {
            duration: this.duration,

            position: { v3: [x, y, z] },
            positionType: this.positionType,

            repeatTarget: this.repeatTarget,
        }
    }

    getDuration() {
        return this.duration || 0;
    }

    getPosition() {
        return typeof (this.position) === 'function' ? this.position() : this.position;
    }

    constructor(options: EffectOptions) {
        super();
        this.options = options;
        this.duration = options.duration ?? 0;
        this.clock = options.clock;
        this.scene = options.scene;
        this.repeatTarget = options.repeatTarget ?? false;

        if (Array.isArray(options.target)) {
            this.target = options.target;
        } else if (options.target) {
            this.target = [options.target];
        }

        this.position = options.position || Bab.Vector3.Zero();
        this.positionType = options.positionType || 'arena';
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
}

export type MechanicOptions = {
    name?: string
    scheduling?: ScheduleMode
    effects: Scheduled<iEffect>[]
    clock: Clock
}

export class Mechanic extends EventEmitter {
    name?: string;
    scheduling: ScheduleMode;
    effects: Scheduled<iEffect>[];
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
        this.clock = options.clock;

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
    clock: Clock
}

export class FightSection extends EventEmitter {
    name?: string;
    scheduling: ScheduleMode;
    mechanics: Scheduled<Mechanic>[];
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
        this.clock = options.clock;

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
    clock: Clock
}

export class Fight extends EventEmitter {
    name?: string;
    scheduling: ScheduleMode;
    sections: Scheduled<FightSection>[];
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
            isActive: this.isActive,
            sections: this.sections,
        };
    }

    constructor(options: FightOptions) {
        super();
        this.options = options;
        this.sections = options.sections || [];
        this.scheduling = options.scheduling || 'sequential';
        this.clock = options.clock;

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

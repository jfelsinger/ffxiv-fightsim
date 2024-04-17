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
        if (scheduled.repeat < repeatNumber) {
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

    constructor(options: EffectOptions) {
        super();
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
    }

    async startup() {
    }

    async cleanup() {
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

    constructor(options: MechanicOptions) {
        super();
        this.effects = options.effects || [];
        this.scheduling = options.scheduling || 'parallel';
        this.clock = options.clock;

        if (options.name) {
            this.name = options.name;
        }
    }

    async execute() {
        this.emit('start-execute');
        if (this.scheduling === 'sequential') {
            const len = this.effects.length;
            for (let i = 0; i < len; i++) {
                await this.executeEffect(this.effects[i])
            }
        } else {
            await Promise.all(this.effects.map(effect => {
                this.executeEffect(effect)
            }));
        }
        this.emit('end-execute');
    }

    async executeEffect(effect: Scheduled<iEffect>) {
        this.emit('start-effect', { effect });
        await executeScheduled(effect, (item) => item.execute(), this.clock)
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

    constructor(options: SectionOptions) {
        super();
        this.mechanics = options.mechanics || [];
        this.scheduling = options.scheduling || 'sequential';
        this.clock = options.clock;

        if (options.name) {
            this.name = options.name;
        }
    }

    async execute() {
        this.emit('start-execute');
        if (this.scheduling === 'sequential') {
            const len = this.mechanics.length;
            for (let i = 0; i < len; i++) {
                await this.executeMechanic(this.mechanics[i])
            }
        } else {
            await Promise.all(this.mechanics.map(m => this.executeMechanic(m)));
        }
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

    constructor(options: FightOptions) {
        super();
        this.sections = options.sections || [];
        this.scheduling = options.scheduling || 'sequential';
        this.clock = options.clock;

        if (options.name) {
            this.name = options.name;
        }
    }

    async execute() {
        this.emit('start-execute');
        if (this.scheduling === 'sequential') {
            const len = this.sections.length;
            for (let i = 0; i < len; i++) {
                await this.executeSection(this.sections[i])
            }
        } else {
            await Promise.all(this.sections.map(s => this.executeSection(s)));
        }
        this.emit('end-execute');
    }

    async executeSection(section: Scheduled<FightSection>) {
        this.emit('start-section', { section });
        await executeScheduled(section, (item) => item.execute(), this.clock)
        this.emit('end-section', { section });
    }
}

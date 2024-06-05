import * as Bab from '@babylonjs/core';
import { EventEmitter } from 'eventemitter3';
import { Clock } from './clock';
import { FightCollection } from './fight-collection';
import { decodeFight } from './decode-fight';
import { Character } from './character';

import {
    type ScheduleMode,
    type Scheduled,
    getScheduledDuration,
    executeScheduled,
} from './scheduled';

import Debug from 'debug';
const debug = Debug('game:utils:steering');

const DefaultFightSchedulingMode = 'sequential';
const DefaultFightSectionSchedulingMode = 'sequential';
const DefaultMechanicSchedulingMode = 'parallel';


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
                if (mesh) { return mesh.position.clone(); }

                const character = this.collection.characters[positionValue as any];
                if (character?.position) { return character.position.clone(); }
            } else if (this.positionType === 'character') {
                const character = this.collection.characters[positionValue as any];
                if (character?.position) { return character.position.clone(); }

                const mesh = this.scene.getMeshByName(positionValue);
                if (mesh) { return mesh.position.clone(); }
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
                    return new Bab.Vector3(split[0], split[1], split[2]);
                }
            }

            return Bab.Vector3.Zero();
        }

        return positionValue.clone();
    }

    startTime: number = 0;
    endTime: number = 0;
    get elapsed() { return this.clock.time - this.startTime; }

    getDurationPercent() {
        const duration = this.getDuration();
        if (!duration || !this.isActive) {
            return 0;
        }

        if (this.endTime > this.startTime) {
            return 1.0;
        }

        const elapsed = Math.min(duration, this.elapsed);
        return Math.min(1.0, Math.max(0.0, elapsed / duration));
    }


    async start() {
        this.startTime = this.clock.time;
        this.emit('start');
        await this.startup();

        this.emit('post-startup');
        await this.execute();
        this.emit('pre-cleanup');

        await this.cleanup();
        this.endTime = this.clock.time;
        this.emit('end');
    }

    async execute() {
        if (this.duration) {
            await this.clock.wait(this.duration);
        }

        if (this.isActive) {
            this.snapshot();
        }
    }

    snapshot() {
        this.emit('snapshot', { mesh: this.mesh });
        this.checkCollisions();
    }

    checkCollisions() {
        // TODO: Add checks for different party members later

        const target = this.collection.player;
        if (target && this.checkCharacterCollision(target)) {
            this.emit('effect-hit', {
                effect: this,
                target: this.collection.player,
            });
        }
    }

    checkCharacterCollision(target: Character) {
        return this.checkMeshCollision(target.collider);
    }

    checkMeshCollision(target: Bab.Mesh) {
        const mesh = this.mesh;
        if (mesh && target?.intersectsMesh(mesh, false)) {
            return true;
        }

        return false;
    }

    async startup() {
        this.isActive = true;
    }

    async cleanup() {
        this.isActive = false;
    }

    async dispose() {
        this.isActive = false;
        await this.cleanup();
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

        const results: Record<string, any> = {};

        for (const property in this.options) {
            const val = (this.options as any)[property];
            if (val && (typeof (val) === 'number' || typeof (val) === 'string')) {
                results[property] = val;
            }
        }

        return {
            ...results,
            name: this.name,
            duration: this.options.duration || this.duration,
            position: positionValue,
            positionType: this.options.positionType || this.positionType,
        }
    }
}

export type MechanicOptions = {
    name?: string
    scheduling?: ScheduleMode
    effects: Scheduled<Effect>[]
    collection: FightCollection
    clock?: Clock
}

export class Mechanic extends EventEmitter {
    name: string = 'default';
    scheduling: ScheduleMode;
    effects: Scheduled<Effect>[];
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
        this.scheduling = options.scheduling || DefaultMechanicSchedulingMode;
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        const len = this.effects.length;
        for (let i = 0; i < len; i++) {
            const effect = this.effects[i];
            effect.item.on('effect-hit', (data) => {
                this.emit('effect-hit', {
                    ...data,
                    mechanic: this,
                });
            });
        }

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
                if (!this.isActive) break;
                await this.executeEffect(this.effects[i])
            }
        } else if (this.isActive) {
            await Promise.all(this.effects.map(effect => this.executeEffect(effect)));
        }

        this.isActive = false;
        this.emit('end-execute');
    }

    async executeEffect(effect: Scheduled<Effect>) {
        this.emit('start-effect', { effect });
        if (effect?.preStartDelay) { await this.clock.wait(effect.preStartDelay); }
        await executeScheduled(effect, (item) => Promise.resolve(this.isActive && item.start()), this.clock)
        this.emit('end-effect', { effect });
    }

    async dispose() {
        this.isActive = false;
        const len = this.effects.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push(this.effects[i]?.item?.dispose());
        }
        await Promise.all(promises);
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
        this.scheduling = options.scheduling || DefaultFightSectionSchedulingMode;
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        const len = this.mechanics.length;
        for (let i = 0; i < len; i++) {
            const mechanic = this.mechanics[i];
            mechanic.item.on('effect-hit', (data) => {
                this.emit('effect-hit', {
                    ...data,
                    section: this,
                });
            });
        }

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
                if (!this.isActive) break;
                await this.executeMechanic(this.mechanics[i])
            }
        } else if (this.isActive) {
            await Promise.all(this.mechanics.map(m => this.executeMechanic(m)));
        }

        this.isActive = false;
        this.emit('end-execute');
    }

    async executeMechanic(mechanic: Scheduled<Mechanic>) {
        this.emit('start-mechanic', { mechanic });
        if (mechanic?.preStartDelay) { await this.clock.wait(mechanic.preStartDelay); }
        await executeScheduled(mechanic, (item) => Promise.resolve(this.isActive && item.execute()), this.clock)
        this.emit('end-mechanic', { mechanic });
    }

    async dispose() {
        this.isActive = false;
        const len = this.mechanics.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push(this.mechanics[i]?.item?.dispose());
        }
        await Promise.all(promises);
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
    }

    clone() {
        return decodeFight(JSON.parse(JSON.stringify(this)), {
            collection: this.collection,
            clock: this.clock,
        });
    }
}

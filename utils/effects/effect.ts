import * as Bab from '@babylonjs/core';
import { EventEmitter } from 'eventemitter3';
import { Clock } from '../clock';
import { FightCollection } from '../fight-collection';
import { Character } from '../character';
import { parseNumber } from '../parse-number';
import { getBasicValues } from '../decode-fight';
import type { PositionType, PositionOption } from '../positioning';
import { getPosition, getInterpolatedPosition } from '../positioning';
import type { ScheduledParent } from '../scheduled';

import Debug from 'debug';
const debug = Debug('game:utils:effect');

export type EffectTargetType =
    | 'boss' | 'adds'
    | 'all' // All players
    | 'player' | 'party' | 'maintank'
    | 'tank' | 'healer' | 'dps';

export type EffectTarget =
    // | Bab.Mesh
    | EffectTargetType;

export type EffectPositionType = PositionType;

export type EffectOptions = {
    label?: string
    color?: string
    duration: number | string
    collection: FightCollection
    clock?: Clock
    usePlayerTick?: boolean
    telegraph?: number

    target?: EffectTarget | (EffectTarget[])
    position?: PositionOption
    positionType?: EffectPositionType
    followPosition?: boolean

    positions?: PositionOption[]
    easing?: string,
    positionTypes?: EffectPositionType[]
    positionSteps?: number[]

    // Whether or not the same random target can be selected more than once,
    // when randomly selecting from a group of targets
    repeatTarget?: boolean
}

export class Effect extends EventEmitter {
    n?: number;
    scheduledParent?: ScheduledParent<Effect>;

    name: string = 'default';
    label?: string;
    clock: Clock
    collection: FightCollection;
    color?: string;
    isActive: boolean = false;
    usePlayerTick: boolean = false;

    duration: number;
    target: EffectTarget[] = [];

    position: EffectOptions['position'];
    positionType: EffectOptions['positionType'];
    followPosition: EffectOptions['followPosition'];

    positions?: EffectOptions['positions'];
    positionTypes?: EffectOptions['positionTypes'];
    positionSteps?: EffectOptions['positionSteps'];
    easing?: string

    repeatTarget: boolean;
    telegraph: number;

    // The mesh for the effect itself
    mesh?: Bab.Mesh;
    options: EffectOptions;

    get scene() { return this.collection.scene; }

    constructor(options: EffectOptions) {
        super();
        this.options = options;
        this.telegraph = parseNumber(options.telegraph ?? 1.0);
        this.label = options.label;
        this.duration = parseNumber(options.duration ?? 0);
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;
        this.color = options.color;
        this.repeatTarget = options.repeatTarget ?? false;

        if (Array.isArray(options.target)) {
            this.target = options.target;
        } else if (options.target) {
            this.target = [options.target];
        }

        this.position = options.position || Bab.Vector3.Zero();
        this.positionType = options.positionType || 'arena';
        this.followPosition = options.followPosition || false;

        this.positions = options.positions;
        this.positionTypes = options.positionTypes;
        this.positionSteps = options.positionSteps;
        this.easing = options.easing;

        const onTickUpdate = (time: number) => {
            this.tickUpdate(time);
        };

        this.usePlayerTick = options.usePlayerTick || false;
        if (this.usePlayerTick) {
            this.collection.playerClock.on('tick', onTickUpdate);
            this.on('dispose', () => {
                this.collection.playerClock.off('tick', onTickUpdate);
            });
        } else {
            this.clock.on('tick', onTickUpdate);
            this.on('dispose', () => {
                this.clock.off('tick', onTickUpdate);
            });
        }
    }

    setColor(color: string) {
        this.color = color;
    }

    getColor() {
        if (this.color) {
            if (this.color.startsWith('#')) {
                return Bab.Color3.FromHexString(this.color);
            } else if (this.color.includes(',')) {
                const entries = this.color.split(',').map(_ => +_);
                if (entries.length === 3) {
                    if (entries.every((e) => e <= 1)) {
                        return new Bab.Color3(entries[0], entries[1], entries[2]);
                    } else {
                        return Bab.Color3.FromInts(entries[0], entries[1], entries[2]);
                    }
                }
            }
        }

        return Bab.Color3.FromInts(255, 150, 20);
    }

    getTargets() {
        const targets: Character[] = [];

        const len = this.target.length;
        for (let i = 0; i < len; i++) {
            const target = this.getTarget(this.target[i], targets);
            if (target) {
                targets.push(target);
            }
        }

        return targets;
    }

    getTarget(targetType: EffectTargetType, currentTargets?: Character[]) {
        let result: Character | undefined;

        if (targetType === 'player') {
            if (!currentTargets?.some(t => t.name === this.collection.player?.name)) {
                result = this.collection.player;
            }
        }

        return result;
    }

    setDuration(duration: number | string) {
        this.duration = parseNumber(duration);
    }

    getDuration() {
        return this.duration || 0;
    }

    setTelegraph(telegraph: number | string) {
        this.telegraph = parseNumber(telegraph);
    }

    getPosition(value?: number): Bab.Vector3 {
        const target = this.getTarget('player')
        if (this.scheduledParent?.scheduled?.item) {
            if (this.position === 'parent') {
                return this.scheduledParent.scheduled.item.getPosition();
            } else if (this.position === 'parent-end') {
                return this.scheduledParent.scheduled.item.getPosition(1.0);
            } else if (this.position === 'parent-start') {
                return this.scheduledParent.scheduled.item.getPosition(0.0);
            } else if (typeof (this.position) === 'string' && this.position.startsWith('parent-')) {
                const v = parseNumber(this.position.split('-').slice(1).join('-'));
                return this.scheduledParent.scheduled.item.getPosition(v);
            }
        }

        if (this.positions) {
            return getInterpolatedPosition({
                positions: this.positions,
                positionTypes: this.positionTypes,
                positionType: this.positionType,
                steps: this.positionSteps,
                value: value ?? this.getDurationPercent(),
                easing: this.easing,
                collection: this.collection,
                target
            });
        }

        return getPosition(
            this.position,
            this.positionType,
            this.collection,
            target
        )
    }

    updatePosition(value?: number) {
        if ((this.positions || this.followPosition) && this.mesh) {
            const { x, z } = this.getPosition(value);
            const y = this.mesh.position.y;
            this.mesh.position.set(x, y, z);
        }
    }

    tickUpdate(time: number) {
        if (this.isActive) {
            const durationPercent = this.getDurationPercent();
            this.updatePosition(durationPercent);
            this.emit('tick', {
                time,
                durationPercent,
            });
        }
    }

    startTime: number = 0;
    endTime: number = 0;
    get elapsed() { return this.clock.time - this.startTime; }

    getDurationPercent() {
        const duration = this.getDuration();
        if (!duration || (!this.isActive && !this.startTime)) {
            return 0;
        }

        if (this.endTime > this.startTime) {
            return 1.0;
        }

        const elapsed = Math.min(duration, this.elapsed);
        return Math.min(1.0, Math.max(0.0, elapsed / duration));
    }


    async start(n = 0, parent?: ScheduledParent<Effect>) {
        this.n = n;
        this.scheduledParent = parent;
        console.log('EFFECT: ', n, parent, parent?.scheduled?.item, parent?.scheduled?.item?.position, parent?.scheduled?.item?.getPosition());

        this.startTime = this.clock.time;
        console.log('EFFECT START: ', this.name, this.startTime, this);
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
        this.collection.addActiveEffect(this);
    }

    async cleanup() {
        this.isActive = false;
    }

    async dispose() {
        this.isActive = false;
        this.emit('dispose');
        await this.cleanup();
    }

    toJSON() {
        let positionValue = typeof (this.options.position) === 'function' ? this.options.position() : this.options.position;
        if (positionValue && typeof (positionValue) !== 'string' && !Array.isArray(positionValue)) {
            positionValue = [
                positionValue!.x,
                positionValue!.y,
                positionValue!.z,
            ].join(',');
        }

        const results = getBasicValues(this.options);
        return {
            label: this.options.label,
            name: this.name,
            ...results,
            duration: this.options.duration || this.duration,
            position: positionValue,
            positionType: this.options.positionType || this.positionType,

            positions: this.options.positions,
            positionSteps: this.options.positionSteps,
            positionTypes: this.options.positionTypes,
        }
    }
}

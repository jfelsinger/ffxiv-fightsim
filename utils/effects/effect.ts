import * as Bab from '@babylonjs/core';
import { EventEmitter } from 'eventemitter3';
import { Clock } from '../clock';
import { FightCollection } from '../fight-collection';
import { Character } from '../character';
import { parseNumber } from '../parse-number';
import { getBasicValues } from '../decode-fight';
import type { PositionType, PositionOption } from '../positioning';
import { getPosition } from '../positioning';

import Debug from 'debug';
const debug = Debug('game:utils:effect');

export type EffectTargetType =
    | 'boss' | 'adds'
    | 'all' // All players
    | 'player' | 'party' | 'maintank'
    | 'tank' | 'healer' | 'dps';

export type EffectTarget =
    | EffectTargetType | Bab.Mesh;

export type EffectPositionType = PositionType;

export type EffectOptions = {
    label?: string
    color?: string
    duration: number | string
    collection: FightCollection
    clock?: Clock
    telegraph?: number

    target?: EffectTarget | (EffectTarget[])
    position?: PositionOption
    positionType?: EffectPositionType

    // Whether or not the same random target can be selected more than once,
    // when randomly selecting from a group of targets
    repeatTarget?: boolean
}

export class Effect extends EventEmitter {
    name: string = 'default';
    label?: string;
    clock: Clock
    collection: FightCollection;
    color?: string;
    isActive: boolean = false;

    duration: number;
    target: EffectTarget[] = [];
    position: EffectOptions['position'];
    positionType: EffectOptions['positionType'];
    repeatTarget: boolean;
    telegraph: number;

    // The mesh for the effect itself
    mesh?: Bab.Mesh;
    options: EffectOptions;

    get scene() { return this.collection.scene; }

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
    }

    getTarget(targetType: EffectTargetType) {
        if (targetType === 'player') {
            return this.collection.player;
        }
    }

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

    getPosition(): Bab.Vector3 {
        return getPosition(
            this.position,
            this.positionType,
            this.collection
        )
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
        }
    }
}

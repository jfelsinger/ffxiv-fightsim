import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';
import { decodeEffect } from '../decode-fight';
import { addTag } from '../meta-helpers';
import type { Character } from '../character';
import { shuffleArray } from '../array-shuffle';
import { rotateArray } from '../array-rotate';

import {
    Effect,
    type EffectOptions,
} from './';

export type DistributionType =
    | 'ordered'
    | 'random'
    | 'random-rotation'
    | 'random-direction'
    | 'random-start'

export type DistributionItem = {
    tag?: string
    effect?: EffectOptions
}

export type DistributeEffectOptions = EffectOptions & {
    distributionType?: DistributionType
    limit?: number
    effect?: EffectOptions
    items?: DistributionItem[]
};

export class DistributeEffect extends Effect {
    options: DistributeEffectOptions;
    name = 'distribute';
    effects: Effect[] = [];
    items: DistributionItem[] = [];

    distributionType: DistributionType;
    limit?: number;

    constructor(options: DistributeEffectOptions) {
        super(options);
        this.options = options;
        (window as any).distribute = this;

        this.distributionType = options.distributionType || 'ordered';
        this.limit = options.limit;
        this.items = options.items?.map(i => ({
            ...i,
            effect: {
                ...options.effect,
                ...i?.effect,
            } as EffectOptions,
        })) || [];

        this.on('start', () => {
            let targets = this.getTargets();
            targets = [
                targets[0],
                targets[3],
                targets[2],
                targets[1],
            ];

            if (this.distributionType === 'random-start') {
                targets = rotateArray(targets, Math.floor(Math.random() * targets.length) + 1);
            } else if (this.distributionType === 'random-direction') {
                if (Math.random() < 0.5) {
                    targets = targets.reverse();
                }
            } else if (this.distributionType === 'random-rotation') {
                targets = rotateArray(targets, Math.floor(Math.random() * targets.length) + 1);
                if (Math.random() < 0.5) {
                    targets = targets.reverse();
                }
            } else if (this.distributionType === 'random') {
                targets = shuffleArray(targets);
            }

            (window as any).targets = targets;
            console.log('GOT TARGETS: ', targets);

            const len = this.items.length;
            for (let i = 0; i < len; i++) {
                const item = this.items[i];
                if (!item) { continue; }

                const target = targets[i];
                if (!target) { continue; }

                const effect = this.spawnEffect(i, target);
                if (!effect) { continue; }
                (window as any).effect = effect;

                if (item.tag) {
                    addTag(target, item.tag);
                }
            }
        })
    }

    spawnEffect(i: number, target?: Character | Bab.AbstractMesh) {
        const item = this.items[i];
        const options = {
            ...this.options,
            ...(item.effect),
        };

        if (item.tag && target) {
            addTag(target, item.tag);
        }

        // TODO: Find Target, and pass target + other data to spawned effect

        const effect = decodeEffect(options, {
            collection: options.collection,
            clock: options.clock,
        });

        if (effect) {
            this.effects.push(effect);
            effect.on('effect-hit', ({ effect: subEffect, target }) => {
                this.emit('effect-hit', {
                    effect: this,
                    subEffect,
                    target,
                });
            });

            if (target) {
                effect.positionType = 'mesh';
                effect.position = target.name;
            }
        }

        return effect;
    }

    async execute() {
        const len = this.effects.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            // TODO: make sure I don't need some startup logic
            promises.push(this.effects[i].execute());
        }
        await Promise.all(promises);

        if (this.isActive) {
            this.snapshot();
        }
    }

    async startup() {
        await super.startup();
        const len = this.effects.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push((async () => {
                this.effects[i].startTime = this.clock.time;
                // TODO: make sure I don't need some startup logic
                await this.effects[i].startup();
            })());
        }
        await Promise.all(promises);
    }

    setDuration(duration: number | string) {
        super.setDuration(duration);
        this.duration = parseNumber(duration);
        const len = this.effects.length;
        for (let i = 0; i < len; i++) {
            this.effects[i].setDuration(this.duration);
        }
    }

    setTelegraph(telegraph: number | string) {
        super.setTelegraph(telegraph);
        const len = this.effects.length;
        for (let i = 0; i < len; i++) {
            this.effects[i].setTelegraph(this.telegraph);
        }
    }

    async cleanup() {
        const len = this.effects.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push((async () => {
                await this.effects[i].cleanup();
                this.effects[i].endTime = this.clock.time;
            })());
        }
        await Promise.all(promises);

        this.mesh?.dispose()
        await super.cleanup();
    }

    toJSON() {
        return {
            ...super.toJSON(),
            effect: this.options.effect,
        };
    }
}

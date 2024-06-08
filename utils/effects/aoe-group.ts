import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';
import { decodeEffect } from '../decode-fight';

import {
    Effect,
    type EffectOptions,
} from './';

export type AoeGroupEffectOptions = EffectOptions & {
    aoes?: EffectOptions[],
};

export class AoeGroupEffect extends Effect {
    options: AoeGroupEffectOptions;
    name = 'aoe-group';
    aoes: Effect[] = [];

    constructor(options: AoeGroupEffectOptions) {
        super(options);
        this.options = options;

        if (Array.isArray(options.aoes) && options.aoes.length) {
            const len = options.aoes.length;
            for (let i = 0; i < len; i++) {
                const aoeOptions = {
                    ...options,
                    position: '0,0,0',
                    ...options.aoes[i],
                };

                const aoeEffect = decodeEffect(aoeOptions, {
                    collection: options.collection,
                    clock: options.clock,
                });

                if (aoeEffect) {
                    this.aoes.push(aoeEffect);
                    aoeEffect.on('effect-hit', ({ effect: subEffect, target }) => {
                        this.emit('effect-hit', {
                            effect: this,
                            subEffect,
                            target,
                        });
                    });
                }
            }

        }
    }

    async execute() {
        const len = this.aoes.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push(this.aoes[i].execute());
        }
        await Promise.all(promises);

        if (this.isActive) {
            this.snapshot();
        }
    }

    async startup() {
        await super.startup();
        this.mesh = this.makeAoe().mesh;
        const len = this.aoes.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push((async () => {
                this.aoes[i].startTime = this.clock.time;
                await this.aoes[i].startup();
                const mesh = this.aoes[i].mesh;
                if (mesh && this.mesh) {
                    mesh.parent = this.mesh;
                }
            })());
        }
        await Promise.all(promises);
    }

    setDuration(duration: number | string) {
        super.setDuration(duration);
        this.duration = parseNumber(duration);
        const len = this.aoes.length;
        for (let i = 0; i < len; i++) {
            this.aoes[i].setDuration(this.duration);
        }
    }

    setTelegraph(telegraph: number | string) {
        super.setTelegraph(telegraph);
        const len = this.aoes.length;
        for (let i = 0; i < len; i++) {
            this.aoes[i].setTelegraph(this.telegraph);
        }
    }

    async cleanup() {
        const len = this.aoes.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push((async () => {
                await this.aoes[i].cleanup();
                this.aoes[i].endTime = this.clock.time;
            })());
        }
        await Promise.all(promises);

        this.mesh?.dispose()
        await super.cleanup();
    }

    makeAoe() {
        const emptyMesh = new Bab.Mesh('aoe-group-empty', this.scene);
        emptyMesh.position = this.getPosition() || Bab.Vector3.Zero();

        return {
            mesh: emptyMesh,
        };
    }

    toJSON() {
        return {
            ...super.toJSON(),
            aoes: this.options.aoes,
        };
    }
}

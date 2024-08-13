import { useState } from '#imports';
import createAoeMat from '../../materials/roundAoe';
import { yalmsToM } from '../conversions';
import { isWithinRadius } from '../vector-helpers';
import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';

import {
    AoeDiscEffect,
    type AoeDiscEffectOptions,
} from './aoe-disc';

export type KBTowerEffectOptions = AoeDiscEffectOptions & {
    stacks: number
    power: number
};

export class KBTowerEffect extends AoeDiscEffect {
    override name = 'kb-tower';
    stacks: number
    power: number

    constructor(options: KBTowerEffectOptions) {
        super(options);
        this.stacks = options.stacks || 2;
        this.power = options.power || this.yalms || 10;
    }

    override makeAoe() {
        const radius = yalmsToM(this.yalms);

        const mat = new Bab.StandardMaterial(`kb-tower-${this.stacks}`, this.scene);
        mat.diffuseTexture = new Bab.Texture(`/images/kb-tower-${this.stacks}.png`);
        mat.diffuseTexture.hasAlpha = true;
        mat.useAlphaFromDiffuseTexture = true;
        mat.emissiveColor = new Bab.Color3(0.85, 0.55, 0.55);

        const disc = Bab.MeshBuilder.CreateDisc('area', { radius }, this.scene);
        disc.rotation.x = Math.PI / 2;
        disc.position.y = 0.01;
        disc.bakeCurrentTransformIntoVertices();
        disc.position = this.getPosition() || Bab.Vector3.Zero();
        disc.material = mat;
        disc.checkCollisions = true;

        return {
            disc
        };
    }

    // override async cleanup() {
    //     this.mesh?.dispose()
    //     await super.cleanup();
    // }

    // override async cleanup() {
    //     this.isActive = false;
    // }

    override snapshot() {
        if (!this.isActive) { return; }
        // else:

        this.emit('snapshot', { mesh: this.mesh });
        this.checkCollisions();
    }

    override checkCollisions(skipEmit?: boolean) {
        // TODO: Add checks for different party members later
        let result = false;

        // const target = this.collection.player;
        const targets = this.collection.getPartyCharacters();
        for (const target of targets) {
            if (target && !target.tags.has('kb') && this.checkCharacterCollision(target)) {
                target.tags.add('kb');
                if (!skipEmit) {
                    this.emit('effect-hit', {
                        effect: this,
                        target,
                    });
                }
                result = true;

                const kbPosition = this.mesh?.position?.clone() || Bab.Vector3.Zero();
                kbPosition.y = 0;

                const targetPosition = target.position.clone();
                targetPosition.y = 0;

                const power = yalmsToM(this.power);
                const kbVector = targetPosition.subtract(kbPosition).normalize().scale(power);
                // const newPosition = targetPosition.add(kbVector);

                let duration = 220;
                const perDuration = 1 / duration;
                // target.position.addInPlace(kbVector);
                const applyKnockback = (_time, delta) => {
                    if (duration > 0) {
                        duration -= delta;
                        target.position.addInPlace(kbVector.scale(perDuration * delta));
                    }
                };
                this.clock.on('tick', applyKnockback);
                this.clock.after(() => {
                    target.tags.delete('kb');
                    this.clock.off('tick', applyKnockback);
                }, duration)
            }
        }

        return result;
    }
}

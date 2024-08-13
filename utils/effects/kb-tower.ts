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
        mat.emissiveColor = new Bab.Color3(0.125, 0.098, 0.078);

        const disc = Bab.MeshBuilder.CreateDisc('area', { radius }, this.scene);
        disc.rotation.x = Math.PI / 2;
        disc.position.y = 0.01;
        disc.bakeCurrentTransformIntoVertices();
        disc.position = this.getPosition() || Bab.Vector3.Zero();
        disc.material = mat;
        disc.checkCollisions = true;
        this.collection.addGlow(disc);

        const poleMat = new Bab.StandardMaterial('kb-pole-mat', this.scene);
        poleMat.diffuseColor = Bab.Color3.Yellow();
        poleMat.specularColor = Bab.Color3.Yellow();
        poleMat.emissiveColor = new Bab.Color3(0.961, 0.835, 0.569);

        const height = 50;
        const pole = Bab.MeshBuilder.CreateCylinder('kb-tower-pole', {
            diameter: 0.175,
            tessellation: 6,
            height,
        });
        pole.position.y += height / 2;
        pole.parent = disc;
        pole.material = poleMat;
        this.collection.addGlow(pole);
        this.on('dispose', () => pole.dispose());

        const ring = Bab.MeshBuilder.CreateTorus('kb-tower-ring', {
            diameter: radius * 2,
            tessellation: 32,
            thickness: 0.045,
        });
        ring.position.y += 1;
        ring.parent = disc;
        ring.material = poleMat;
        this.collection.addGlow(ring);
        this.on('dispose', () => ring.dispose());

        const ballMat = new Bab.StandardMaterial(`kb-tower-${this.stacks}`, this.scene);
        ballMat.diffuseColor = Bab.Color3.FromHexString('#222222');
        ballMat.specularColor = new Bab.Color3(0.125, 0.098, 0.078);

        const positions = [
            [radius, 0],
            [-radius, 0],
            [0, radius],
            [0, -radius],
            [radius * 0.7071, radius * 0.7071],
            [radius * 0.7071, -radius * 0.7071],
            [-radius * 0.7071, radius * 0.7071],
            [-radius * 0.7071, -radius * 0.7071],
        ]

        for (let i = 0; i < this.stacks; i++) {
            const ball = Bab.MeshBuilder.CreateSphere(`ball-${i + 1}`, {
                segments: 16,
                diameter: 0.5,
            });
            ball.position.x += positions[i][0];
            ball.position.z += positions[i][1];
            ball.parent = ring;
            ball.material = ballMat;
            this.on('dispose', () => ball.dispose());
        }

        const ballHeight = 16;
        const triggerRadius = 1.25;
        const ball = Bab.MeshBuilder.CreateSphere(`ball-trigger`, {
            segments: 16,
            diameter: triggerRadius * 2,
        });
        ball.position.y = ballHeight + triggerRadius;
        ball.parent = disc;
        ball.material = poleMat;
        this.on('dispose', () => ball.dispose());

        this.on('tick', ({ durationPercent }) => {
            ring.rotation.y = (Math.PI * 4) * (durationPercent * 0.125);
            ball.position.y = (ballHeight - ballHeight * durationPercent) + triggerRadius;
        });

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

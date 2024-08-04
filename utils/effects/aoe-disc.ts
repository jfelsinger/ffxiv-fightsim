import { useState } from '#imports';
import createAoeMat from '../../materials/roundAoe';
import { yalmsToM } from '../conversions';
import { isWithinRadius } from '../vector-helpers';
import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';

import {
    Effect,
    type EffectOptions,
} from './';

export type AoeDiscEffectOptions = EffectOptions & {
    yalms?: number | string,
};

export class AoeDiscEffect extends Effect {
    name = 'aoe-disc';
    yalms: number;

    constructor(options: AoeDiscEffectOptions) {
        super(options);
        this.yalms = parseNumber(options.yalms || 15);
    }

    async startup() {
        await super.startup();
        this.mesh = this.makeAoe().disc;
    }

    checkMeshCollision(target: Bab.Mesh) {
        const mesh = this.mesh;
        if (!mesh || !target) {
            return false;
        }

        // subtract aoe pos from mesh pos to get local coords of target
        return isWithinRadius(
            target.absolutePosition.x - mesh.absolutePosition.x,
            target.absolutePosition.z - mesh.absolutePosition.z,
            yalmsToM(this.yalms) // radius
        );
    }

    async cleanup() {
        this.mesh?.dispose()
        await super.cleanup();
    }

    makeAoe() {
        const discMat = createAoeMat(this.scene, this.getColor(), 'discMat');
        discMat.alpha = 0.7;
        if (this.collection.arena) {
            discMat.setFloat('arenaRadius', this.collection.arena.size / 2);
        }

        discMat.setFloat('telegraph', this.adjustedTelegraph);
        discMat.setFloat('elapsed', this.getDurationPercent());
        this.on('tick', ({ time, durationPercent, telegraph }) => {
            discMat.setFloat('time', time);
            discMat.setFloat('telegraph', telegraph);
            discMat.setFloat('elapsed', durationPercent);
        });

        const disc = Bab.MeshBuilder.CreateDisc('area', { radius: yalmsToM(this.yalms) }, this.scene);
        disc.rotation.x = Math.PI / 2;
        disc.position.y = 0.01;
        disc.bakeCurrentTransformIntoVertices();
        disc.position = this.getPosition() || Bab.Vector3.Zero();
        disc.material = discMat;
        disc.checkCollisions = true;

        return {
            disc
        };
    }
}

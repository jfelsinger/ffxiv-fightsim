import createAoeMat from '../../materials/roundAoe';
import { yalmsToM } from '../conversions';
import * as Bab from '@babylonjs/core';

import {
    Effect,
    type EffectOptions,
} from '../effects';

export type AoeDiscEffectOptions = EffectOptions & {
    yalms?: number,
};

export class AoeDiscEffect extends Effect {
    name = 'aoe-disc';
    yalms: number;

    constructor(options: AoeDiscEffectOptions) {
        super(options);
        this.yalms = options.yalms || 15;
    }

    async startup() {
        await super.startup();
        this.mesh = this.makeAoe().disc;
    }

    async cleanup() {
        this.mesh?.dispose()
        await super.cleanup();
    }

    makeAoe() {
        const discMat = createAoeMat(this.scene, Bab.Color3.FromInts(255, 150, 20), 'discMat');
        discMat.alpha = 0.7;
        this.clock.on('tick', (time) => {
            discMat.setFloat('time', time);
            discMat.setFloat('elapsed', this.getDurationPercent());
        });

        const disc = Bab.MeshBuilder.CreateDisc('area', { radius: yalmsToM(this.yalms) }, this.scene);
        disc.position = this.getPosition() || Bab.Vector3.Zero();
        disc.position.y = 0.01;
        disc.material = discMat;
        disc.rotation.x = Math.PI / 2;
        disc.checkCollisions = true;

        return {
            disc
        };
    }

    toJSON() {
        return {
            ...super.toJSON(),
            yalms: this.yalms,
        };
    }
}

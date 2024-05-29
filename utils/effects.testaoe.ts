import createAoeMat from '../materials/standardAoe';
import { yalmsToM } from './conversions';
import * as Bab from '@babylonjs/core';

import {
    Effect,
    type EffectOptions,
} from './effects';

export type TestAoeEffectOptions = EffectOptions & {
    yalms?: number,
};

export class TestAoeEffect extends Effect {
    yalms: number;

    constructor(options: TestAoeEffectOptions) {
        super(options);
        this.yalms = options.yalms || 15;
    }

    async startup() {
        this.mesh = this.makeAoe().disc;
    }

    async cleanup() {
        this.mesh?.dispose()
    }

    makeAoe() {
        const discMat = createAoeMat(this.scene, Bab.Color3.FromInts(255, 150, 20), 'discMat');
        discMat.alpha = 0.7;

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
}

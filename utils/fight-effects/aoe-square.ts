import createAoeMat from '../../materials/squareAoe';
import { yalmsToM } from '../conversions';
import * as Bab from '@babylonjs/core';

import {
    Effect,
    type EffectOptions,
} from '../effects';

export type AoeSquareEffectOptions = EffectOptions & {
    yalms?: number,
};

export class AoeSquareEffect extends Effect {
    name = 'aoe-square';
    yalms: number;

    constructor(options: AoeSquareEffectOptions) {
        super(options);
        this.yalms = options.yalms || 15;
    }

    async startup() {
        await super.startup();
        this.mesh = this.makeAoe().square;
    }

    async cleanup() {
        this.mesh?.dispose()
        await super.cleanup();
    }

    toJSON() {
        return {
            ...super.toJSON(),
            yalms: this.yalms,
        };
    }

    makeAoe() {
        const squareMat = createAoeMat(this.scene, Bab.Color3.FromInts(255, 150, 20), 'squareMat');
        squareMat.alpha = 0.7;
        this.clock.on('tick', (time) => {
            squareMat.setFloat('time', time);
            squareMat.setFloat('elapsed', this.getDurationPercent());
        });

        const square = Bab.MeshBuilder.CreatePlane('area', { size: yalmsToM(this.yalms) }, this.scene);
        square.position = this.getPosition() || Bab.Vector3.Zero();
        square.position.y = 0.01;
        square.material = squareMat;
        square.rotation.x = Math.PI / 2;
        square.checkCollisions = true;

        return {
            square
        };
    }
}
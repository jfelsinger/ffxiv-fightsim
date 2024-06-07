import createAoeMat from '../../materials/squareAoe';
import { yalmsToM } from '../conversions';
import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';

import {
    Effect,
    type EffectOptions,
} from './';

export type AoeSquareEffectOptions = EffectOptions & {
    yalms?: number | string,
};

export class AoeSquareEffect extends Effect {
    name = 'aoe-square';
    yalms: number;

    constructor(options: AoeSquareEffectOptions) {
        super(options);
        this.yalms = parseNumber(options.yalms || 15);
    }

    async startup() {
        await super.startup();
        this.mesh = this.makeAoe().square;
    }

    async cleanup() {
        this.mesh?.dispose()
        await super.cleanup();
    }

    makeAoe() {
        const squareMat = createAoeMat(this.scene, Bab.Color3.FromInts(255, 150, 20), 'squareMat');
        squareMat.alpha = 0.7;
        this.clock.on('tick', (time) => {
            squareMat.setFloat('time', time);
            squareMat.setFloat('elapsed', this.getDurationPercent());
        });

        const square = Bab.MeshBuilder.CreatePlane('area', { size: yalmsToM(this.yalms) }, this.scene);
        square.rotation.x = Math.PI / 2;
        square.position.y = 0.01;
        square.bakeCurrentTransformIntoVertices();
        square.position = this.getPosition() || Bab.Vector3.Zero();
        square.material = squareMat;
        square.checkCollisions = true;

        return {
            square
        };
    }
}

import { useState } from '#imports';
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
    width?: number | string,
    height?: number | string,
};

export class AoeSquareEffect extends Effect {
    name = 'aoe-square';
    yalms: number;
    width: number;
    height: number;

    constructor(options: AoeSquareEffectOptions) {
        super(options);
        this.yalms = parseNumber(options.yalms || 15);
        this.width = parseNumber(options.width || options.yalms || 15);
        this.height = parseNumber(options.height || options.yalms || 15);
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
        const squareMat = createAoeMat(this.scene, this.getColor(), 'squareMat');
        squareMat.alpha = 0.7;

        const globalTelegraph = useState<number>('telegraph', () => 1.0);
        squareMat.setFloat('telegraph', this.telegraph * globalTelegraph.value);
        squareMat.setFloat('elapsed', this.getDurationPercent());
        this.on('tick', ({ time, durationPercent }) => {
            squareMat.setFloat('time', time);
            squareMat.setFloat('telegraph', this.telegraph * globalTelegraph.value);
            squareMat.setFloat('elapsed', durationPercent);
        });

        const square = Bab.MeshBuilder.CreatePlane('area', {
            size: yalmsToM(this.yalms),
            width: yalmsToM(this.width),
            height: yalmsToM(this.height),
        }, this.scene);
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

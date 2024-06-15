import { useState } from '#imports';
// import createAoeMat from '../../materials/dice';
import { yalmsToM } from '../conversions';
import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';

import {
    Effect,
    type EffectOptions,
} from './';

export type DiceEffectOptions = EffectOptions & {
    pips?: (number | string)[] | number | string,
};

export const PipPositions = [
    [
        [0, 0, 0],
    ],
    [
        [-0.2, 0, 0],
        [+0.2, 0, 0],
    ],
    [
        [-0.2, -0.2, 0],
        [0, 0.1732, 0],
        [+0.2, -0.2, 0],
    ],
    [
        [-0.2, -0.2, 0],
        [+0.2, -0.2, 0],
        [-0.2, +0.2, 0],
        [+0.2, +0.2, 0],
    ],
    [
        [-0.4 + 0, 0, 0],

        [+0.4 - 0.2, -0.2, 0],
        [+0.4 + 0.2, -0.2, 0],
        [+0.4 - 0.2, +0.2, 0],
        [+0.4 + 0.2, +0.2, 0],
    ],
    [
        [-0.4 - 0.2, -0.2, 0],
        [-0.4 + 0, 0.1732, 0],
        [-0.4 + 0.2, -0.2, 0],

        [0.4 - 0.2, 0.2, 0],
        [0.4 + 0, -0.1732, 0],
        [0.4 + 0.2, 0.2, 0],
    ],
    [
        [-0.4 - 0.2, -0.2, 0],
        [-0.4 + 0, 0.1732, 0],
        [-0.4 + 0.2, -0.2, 0],

        [+0.4 - 0.2, -0.2, 0],
        [+0.4 + 0.2, -0.2, 0],
        [+0.4 - 0.2, +0.2, 0],
        [+0.4 + 0.2, +0.2, 0],
    ],
    [
        [-0.4 + 0.2, -0.2, 0],
        [-0.4 - 0.2, -0.2, 0],
        [-0.4 - 0.2, +0.2, 0],
        [-0.4 + 0.2, +0.2, 0],

        [+0.4 - 0.2, -0.2, 0],
        [+0.4 + 0.2, -0.2, 0],
        [+0.4 - 0.2, +0.2, 0],
        [+0.4 + 0.2, +0.2, 0],
    ],
] as const;

export class DiceEffect extends Effect {
    name = 'aoe-dice';
    pips: DiceEffectOptions['pips'];
    pipCount: number = 1;

    constructor(options: DiceEffectOptions) {
        super(options);
        this.pips = options.pips || 1;
    }

    getPipCount() {
        let pips = this.pips;
        if (Array.isArray(pips)) {
            pips = pips[Math.floor(Math.random() * pips.length)];
        }

        if (pips && typeof (pips) === 'string') {
            pips = pips.split(',');
            pips = pips[Math.floor(Math.random() * pips.length)];
        }

        if (typeof (pips) === 'string') {
            if (pips.includes('-')) {
                pips = pips.split('-');
                const min = parseNumber((pips[0] as string)?.trim() || 1);
                const max = parseNumber((pips[1] as string)?.trim() || 1);
                return Math.floor(
                    Math.random() * (max - min)
                ) + min;
            }

            return parseNumber(pips?.trim() || 1);
        }

        return parseNumber(pips || 1);
    }

    async startup() {
        await super.startup();
        this.pipCount = this.getPipCount();
        this.mesh = this.makeAoe().dice;
    }

    async cleanup() {
        this.mesh?.dispose()
        await super.cleanup();
    }

    makeAoe() {
        const diceMat = new Bab.StandardMaterial('dice', this.scene);
        diceMat.diffuseColor = Bab.Color3.FromInts(150, 150, 255);
        diceMat.emissiveColor = Bab.Color3.FromInts(100, 100, 255);
        // const diceMat = createAoeMat(this.scene, this.getColor(), 'diceMat');
        // diceMat.alpha = 0.7;

        // const globalTelegraph = useState<number>('telegraph', () => 1.0);
        // diceMat.setFloat('telegraph', this.telegraph * globalTelegraph.value);
        // diceMat.setFloat('elapsed', this.getDurationPercent());
        // this.on('tick', ({ time, durationPercent }) => {
        //     diceMat.setFloat('time', time);
        //     diceMat.setFloat('telegraph', this.telegraph * globalTelegraph.value);
        //     diceMat.setFloat('elapsed', durationPercent);
        // });

        const pipCount = this.pipCount;
        const dice = new Bab.Mesh(`dice-${pipCount}`, this.scene);
        dice.position = this.getPosition() || Bab.Vector3.Zero();
        dice.position.y += 2;
        dice.billboardMode = Bab.Mesh.BILLBOARDMODE_ALL;

        for (let i = 0; i < pipCount; i++) {
            const pip = this.getPip(i, pipCount);
            pip.material = diceMat;
            pip.parent = dice;
        }

        return {
            dice
        };
    }

    getPip(index: number, total: number) {
        const positions = PipPositions[total - 1]
        const positionArr = positions && positions[index];
        const position = positionArr ? Bab.Vector3.FromArray(positionArr) : Bab.Vector3.Zero();

        const pip = Bab.MeshBuilder.CreateSphere(`pip-${index + 1}`, {
            diameter: 0.3,
            segments: 16,
        }, this.scene);
        pip.position = position;

        return pip;
    }
}

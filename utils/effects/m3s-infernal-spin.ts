import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';
import { decodeEffect } from '../decode-fight';

import {
    AoeGroupEffect,
    type AoeGroupEffectOptions,
} from './aoe-group';

export type M3SInfernalSpinOptions = AoeGroupEffectOptions & {
    startDirection?: 'north' | 'south'
    isCW?: boolean
};

export class M3SInfernalSpinEffect extends AoeGroupEffect {
    override options: M3SInfernalSpinOptions;
    override name = 'm3s-infernal-spin';
    startDirection: 'north' | 'south';
    isCW: boolean = false;

    constructor(options: M3SInfernalSpinOptions) {
        super(options);
        this.options = options;
        this.startDirection = options.startDirection || 'north';
        this.isCW = !!options.isCW;
    }
}

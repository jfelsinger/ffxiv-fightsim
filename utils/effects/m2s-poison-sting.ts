import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';
import { decodeEffect } from '../decode-fight';

import {
    AoeGroupEffect,
    type AoeGroupEffectOptions,
} from './aoe-group';

export type M2SPoisonStingOptions = AoeGroupEffectOptions & {
};

export class M2SPoisonStingEffect extends AoeGroupEffect {
    override options: M2SPoisonStingOptions;
    override name = 'm2s-poison-sting';

    constructor(options: M2SPoisonStingOptions) {
        super(options);
        this.options = options;
    }
}

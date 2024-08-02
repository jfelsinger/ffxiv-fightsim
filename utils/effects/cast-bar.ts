import { yalmsToM } from '../conversions';
import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';

import {
    Effect,
    type EffectOptions,
} from './';

export type CastBarEffectOptions = EffectOptions & {
};

export class CastBarEffect extends Effect {
    name = 'cast-bar';

    constructor(options: CastBarEffectOptions) {
        super(options);
    }

}

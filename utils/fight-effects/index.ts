import { Effect } from '../effects';

import { AoeDiscEffect } from './aoe-disc';
import { AoeSquareEffect } from './aoe-square';

export const effectsCollection = {
    'default': Effect,
    'aoe-square': AoeSquareEffect,
    'aoe-disc': AoeDiscEffect,
    'test-aoe': AoeDiscEffect,
} as const;

export default effectsCollection;

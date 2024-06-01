import { Effect } from '../effects';

import { TestAoeEffect } from './testaoe';
import { AoeDiscEffect } from './aoe-disc';
import { AoeSquareEffect } from './aoe-square';

export const effectsCollection: Record<string, typeof Effect> = {
    'default': Effect,
    'test-aoe': TestAoeEffect,
    'aoe-disc': AoeDiscEffect,
    'aoe-square': AoeSquareEffect,
} as const;

export default effectsCollection;

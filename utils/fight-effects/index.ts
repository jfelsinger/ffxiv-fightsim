import { Effect } from '../effects';

import { TestAoeEffect } from './testaoe';

export const effectsCollection: Partial<Record<string, typeof Effect>> = {
    'default': Effect,
    'test-aoe': TestAoeEffect,
} as const;

export default effectsCollection;

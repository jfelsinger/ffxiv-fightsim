import { Effect } from '../effects';

import { AoeDiscEffect } from './aoe-disc';
import { AoeRingEffect } from './aoe-ring';
import { AoeSquareEffect } from './aoe-square';
import { AoeSquareGridEffect } from './aoe-square-grid';

export const effectsCollection = {
    'default': Effect,
    'aoe-square': AoeSquareEffect,
    'aoe-square-grid': AoeSquareGridEffect,
    'aoe-ring': AoeRingEffect,
    'aoe-disc': AoeDiscEffect,
    'test-aoe': AoeDiscEffect,
} as const;

export default effectsCollection;

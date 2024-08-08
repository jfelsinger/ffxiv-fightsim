import { Effect } from './effect';
export * from './effect';

import { AoeDiscEffect } from './aoe-disc';
import { AoeRingEffect } from './aoe-ring';
import { AoeSquareEffect } from './aoe-square';
import { AoeGroupEffect } from './aoe-group';
import { AoeSquareGridEffect } from './aoe-square-grid';
import { DiceEffect } from './dice';
import { TetherEffect } from './tether';
import { DistributeEffect } from './distribute';
import { CastBarEffect } from './cast-bar';
import { StageComboCastEffect } from './stage-combo-cast';

export const effectsCollection = {
    'default': Effect,
    'aoe-square': AoeSquareEffect,
    'aoe-square-grid': AoeSquareGridEffect,
    'aoe-ring': AoeRingEffect,
    'aoe-disc': AoeDiscEffect,
    'aoe-group': AoeGroupEffect,
    'test-aoe': AoeDiscEffect,
    'tether': TetherEffect,
    'dice': DiceEffect,
    'distribute': DistributeEffect,
    'cast-bar': CastBarEffect,
    'cast': CastBarEffect,
    'stage-combo-cast-bar': StageComboCastEffect,
} as const;

export default effectsCollection;

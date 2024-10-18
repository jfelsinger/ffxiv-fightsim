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
import { M2SPoisonStingEffect } from './m2s-poison-sting';
import { M2SAlarmPheromones2Effect } from './m2s-alarm-pheromones-2';
import { PreyMarkerEffect } from './prey-marker';
import { KBTowerEffect } from './kb-tower';
import { M4SNearFarIndicatorEffect } from './m4s-near-far-indicator';

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

    'prey-marker': PreyMarkerEffect,
    'm2s-poison-sting': M2SPoisonStingEffect,
    'm2s-alarm-pheromones-2': M2SAlarmPheromones2Effect,
    'm2s-alarm-pheromones-2-bees': M2SAlarmPheromones2Effect,
    'kb-tower': KBTowerEffect,

    'm4s-near-far-indicator': M4SNearFarIndicatorEffect,
} as const;

export default effectsCollection;

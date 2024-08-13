import { Mechanic } from './mechanic';
export * from './mechanic';

import { E12SPrimalCombination } from './e12s-primal-combination';
import { M2SStageCombo } from './m2s-stage-combo';
import { M2SPoisonSting } from './m2s-poison-sting';
import { M2SBeeSting } from './m2s-bee-sting';
import { M2SAlarmPheromones2 } from './m2s-alarm-pheromones-2';
import { M2SXOfVenom } from './m2s-x-of-venom';
import { M3SBarbarousBarrage } from './m3s-barbarous-barrage';
export const mechanicsCollection: Partial<Record<string, typeof Mechanic>> = {
    'default': Mechanic,

    'primal-combination': E12SPrimalCombination,
    'primal-combinations': E12SPrimalCombination,

    'm2s-stage-combo': M2SStageCombo,
    'stage-combo': M2SStageCombo,
    'm2s-poison-sting': M2SPoisonSting,
    'm2s-bee-sting': M2SBeeSting,
    'm2s-alarm-pheromones-2': M2SAlarmPheromones2,
    'm2s-x-of-venom': M2SXOfVenom,
    'm3s-barbarous-barrage': M3SBarbarousBarrage,
} as const;

export default mechanicsCollection;

import { Mechanic } from './mechanic';
export * from './mechanic';

import { E12SPrimalCombination } from './e12s-primal-combination';
import { M2SStageCombo } from './m2s-stage-combo';
export const mechanicsCollection: Partial<Record<string, typeof Mechanic>> = {
    'default': Mechanic,

    'primal-combination': E12SPrimalCombination,
    'primal-combinations': E12SPrimalCombination,

    'm2s-stage-combo': M2SStageCombo,
    'stage-combo': M2SStageCombo,
} as const;

export default mechanicsCollection;

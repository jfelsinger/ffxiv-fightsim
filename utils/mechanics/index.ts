import { Mechanic } from './mechanic';
export * from './mechanic';

import { E12SPrimalCombination } from './e12s-primal-combination';
export const mechanicsCollection: Partial<Record<string, typeof Mechanic>> = {
    'default': Mechanic,

    'primal-combination': E12SPrimalCombination,
    'primal-combinations': E12SPrimalCombination,
} as const;

export default mechanicsCollection;

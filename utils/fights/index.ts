import { Fight } from './fight';
export * from './fight';

import { E12SFight } from './e12s';

export const fightsCollection = {
    'default': Fight,
    'e12s': E12SFight,
} as const;

export default fightsCollection;

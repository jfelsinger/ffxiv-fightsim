import { Fight } from './fight';
export * from './fight';

import { E12SFight } from './e12s';
import { ClockSpotsTutorial } from './tutorial-clock-spots';

export const fightsCollection = {
    'default': Fight,
    'e12s': E12SFight,

    // Tutorials
    'clock-spots-tutorial': ClockSpotsTutorial,
} as const;

export default fightsCollection;

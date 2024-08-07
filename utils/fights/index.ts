import { Fight } from './fight';
export * from './fight';

import { E12SFight } from './e12s';
import { M2SFight } from './m2s';
import { ClockSpotsTutorial } from './tutorial-clock-spots';
import { M2STutorial } from './tutorial-m2s';

export const fightsCollection = {
    'default': Fight,
    'e12s': E12SFight,
    'm2s': M2SFight,

    // Tutorials
    'clock-spots-tutorial': ClockSpotsTutorial,
    'tutorial-clock-spots': ClockSpotsTutorial,
    'tutorial-m2s': M2STutorial,
} as const;

export default fightsCollection;

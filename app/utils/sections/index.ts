import { FightSection } from './fight-section';
export * from './fight-section';

import { P9SSection } from './p9s-levinstrike';
import { FuseOrFoeSection } from './m3s-fuse-or-foe';

export const sectionsCollection = {
    'default': FightSection,
    'p9s-levinstrike': P9SSection,
    'm3s-fuse-or-foe': FuseOrFoeSection,
} as const;

export default sectionsCollection;

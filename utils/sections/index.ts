import { FightSection } from './fight-section';
export * from './fight-section';

import { P9SSection } from './p9s-levinstrike';

export const sectionsCollection = {
    'default': FightSection,
    'p9s-levinstrike': P9SSection,
} as const;

export default sectionsCollection;

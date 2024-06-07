import { FightSection } from './fight-section';
export * from './fight-section';

export const sectionsCollection = {
    'default': FightSection,
} as const;

export default sectionsCollection;

import { Mechanic } from './mechanic';
export * from './mechanic';

export const mechanicsCollection: Partial<Record<string, typeof Mechanic>> = {
    'default': Mechanic,
} as const;

export default mechanicsCollection;

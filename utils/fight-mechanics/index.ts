import { Mechanic } from '../effects';

export const mechanicsCollection: Partial<Record<string, typeof Mechanic>> = {
    'default': Mechanic,
} as const;

export default mechanicsCollection;

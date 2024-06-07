import { Arena } from './arena';
export * from './arena';
export * from './mats';

export const arenasCollection = {
    'default': Arena,
} as const;

export default arenasCollection;

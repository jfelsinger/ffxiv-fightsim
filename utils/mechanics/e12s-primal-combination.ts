import {
    type ScheduleMode,
    type Scheduled,
    getScheduledDuration,
    executeScheduled,
} from '../scheduled';
import { Effect } from '../effects';
import { FightCollection } from '../fight-collection';
import { getBasicValues } from '../decode-fight';

export const DefaultMechanicSchedulingMode = 'parallel';

import {
    Mechanic,
    type MechanicOptions,
} from './';

export type E12SPrimalCombinationOptions = MechanicOptions & {
};

type PrimalName =
    | 'ifrit'
    | 'ramuh'
    | 'garuda'
    | 'leviathan';
const primalPairs: Record<PrimalName, PrimalName[]> = {
    ifrit: ['ramuh', 'leviathan'],
    ramuh: ['leviathan', 'garuda', 'ifrit'],
    garuda: ['leviathan', 'ramuh'],
    leviathan: ['ifrit', 'ramuh', 'garuda'],
} as const;

export class E12SPrimalCombination extends Mechanic {
    name = 'primal-combination';
    options: E12SPrimalCombinationOptions;

    constructor(options: E12SPrimalCombinationOptions) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';
    }

    getEffects(): Scheduled<Effect>[] {
        const allEffects = this.effects;
        const primalEffects: Record<PrimalName, Scheduled<Effect> | undefined> = {
            ifrit: allEffects.find(e => e.label?.toLowerCase() === 'ifrit'),
            ramuh: allEffects.find(e => e.label?.toLowerCase() === 'ramuh'),
            garuda: allEffects.find(e => e.label?.toLowerCase() === 'garuda'),
            leviathan: allEffects.find(e => e.label?.toLowerCase() === 'leviathan'),
        };

        if (!primalEffects.ifrit && !primalEffects.ramuh && !primalEffects.garuda && !primalEffects.leviathan) {
            return allEffects;
        }

        const availableEntries = Object.entries(primalEffects).filter(([_, value]) => value);

        const [firstLabel, first] = availableEntries[Math.floor(Math.random() * availableEntries.length)] || [];

        if (first) {
            const availableEntries = primalPairs[firstLabel as PrimalName]
                .map((primalName) => primalEffects[primalName])
                .filter(_ => _) as Scheduled<Effect>[];
            const second = availableEntries[Math.floor(Math.random() * availableEntries.length)];
            return [first, second];
        }

        return [];
    }
}

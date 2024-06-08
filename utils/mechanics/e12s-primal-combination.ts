import { EventEmitter } from 'eventemitter3';
import { Clock } from '../clock';
import { shuffleArray } from '../array-shuffle';

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
        const ifrit = allEffects.find(e => e.label?.toLowerCase() === 'ifrit');
        const ramuh = allEffects.find(e => e.label?.toLowerCase() === 'ramuh');
        const garuda = allEffects.find(e => e.label?.toLowerCase() === 'garuda');
        const leviathan = allEffects.find(e => e.label?.toLowerCase() === 'leviathan');

        if (!ifrit && !ramuh && !garuda && !leviathan) {
            return allEffects;
        }

        const availableEntries: Scheduled<Effect>[] = [
            ifrit, ramuh, garuda, leviathan,
        ].filter(_ => _) as any;

        const first = availableEntries[Math.floor(Math.random() * availableEntries.length)];

        if (first) {
            const firstLabel = first.label?.toLowerCase();
            if (firstLabel === 'ifrit') {
                const availableEntries: Scheduled<Effect>[] = [
                    ramuh, leviathan,
                ].filter(_ => _) as any;
                const second = availableEntries[Math.floor(Math.random() * availableEntries.length)];
                return [first, second];
            } else if (firstLabel === 'ramuh') {
                const availableEntries: Scheduled<Effect>[] = [
                    leviathan, garuda, ifrit
                ].filter(_ => _) as any;
                const second = availableEntries[Math.floor(Math.random() * availableEntries.length)];
                return [first, second];
            } else if (firstLabel === 'garuda') {
                const availableEntries: Scheduled<Effect>[] = [
                    leviathan, ramuh,
                ].filter(_ => _) as any;
                const second = availableEntries[Math.floor(Math.random() * availableEntries.length)];
                return [first, second];
            } else if (firstLabel === 'leviathan') {
                const availableEntries: Scheduled<Effect>[] = [
                    ifrit, ramuh, garuda,
                ].filter(_ => _) as any;
                const second = availableEntries[Math.floor(Math.random() * availableEntries.length)];
                return [first, second];
            }
        }

        return shuffleArray([
            ifrit, ramuh, garuda, leviathan,
        ].filter(_ => _)).slice(0, 2) as any;
    }
}

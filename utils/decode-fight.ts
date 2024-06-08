import * as YAML from 'yaml';
import * as Bab from '@babylonjs/core';
import { Clock } from './clock';
import { FightCollection } from './fight-collection';

import {
    type Scheduled,
    isScheduled,
} from './scheduled';

import {
    Fight,
    fightsCollection
} from './fights';

import {
    FightSection,
    sectionsCollection,
} from './sections';

import {
    Mechanic,
    mechanicsCollection,
} from './mechanics';

import {
    Effect,
    effectsCollection,
} from './effects';


export type FightDecodeOptions = {
    collection: FightCollection
    clock?: Clock
}

export function getBasicValues(obj: any) {
    const results: Record<string, any> = {};
    if (obj) {
        for (const property in obj) {
            const val = obj[property];
            if (
                (val || val === 0) &&
                (
                    typeof (val) === 'number' ||
                    typeof (val) === 'bigint' ||
                    typeof (val) === 'string' ||
                    typeof (val) === 'boolean'
                )
            ) {
                results[property] = val;
            }
        }
    }

    return results;
}

function tryParse(data: any) {
    if (typeof data === 'string') {
        try {
            data = YAML.parse(data);
        } catch (err) {
            /* ignored */
        }
    }
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (err) {
            /* ignored */
        }
    }

    return data;
}

export function decodeScheduled<T>(data: any, func: (data: any, optons: FightDecodeOptions) => T, options: FightDecodeOptions): Scheduled<T> {
    const scheduledResult: Scheduled<T> = {
        ...data,
        item: func(data.item, options),
    };

    if (data.after) {
        scheduledResult.after =
            isScheduled(data.after) ? decodeScheduled<T>(data.after, func, options) :
                func(data.after, options);
    }

    if (data.afterRepeats) {
        scheduledResult.afterRepeats =
            isScheduled(data.afterRepeats) ? decodeScheduled<T>(data.afterRepeats, func, options) :
                func(data.afterRepeats, options);
    }

    return scheduledResult;
}

export function decodeEffect(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    let effectClass = Effect;
    let effectClassName: string = data.name;
    if ((effectsCollection as any)[effectClassName]) {
        effectClass = (effectsCollection as any)[effectClassName] as typeof Effect;
    }

    const resultEffect = new effectClass({
        ...options,
        ...data,
    });

    return resultEffect;
}

export function decodeScheduledEffect(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    return decodeScheduled(data, decodeEffect, options)
}

export function decodeMechanic(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    let mechanicClass = Mechanic;
    let mechanicClassName: string = data.name;
    if (mechanicsCollection[mechanicClassName as any]) {
        mechanicClass = mechanicsCollection[mechanicClassName] as typeof Mechanic;
    }

    const effects = data?.effects?.map((effect: any) => decodeScheduledEffect(effect, options)) || [];

    console.log('DATA: ', data);
    return new mechanicClass({
        ...options,
        ...data,
        effects,
    });
}

export function decodeScheduledMechanic(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    return decodeScheduled(data, decodeMechanic, options)
}

export function decodeFightSection(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    let sectionClass = FightSection;
    let sectionClassName: string = data.name;
    if (sectionClassName && (sectionsCollection as any)[sectionClassName]) {
        sectionClass = (sectionsCollection as any)[sectionClassName] as typeof FightSection;
    }

    const mechanics = data?.mechanics?.map((mechanic: any) => decodeScheduledMechanic(mechanic, options)) || [];

    return new sectionClass({
        ...options,
        ...data,
        mechanics,
    });
}

export function decodeScheduledFightSection(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    return decodeScheduled(data, decodeFightSection, options)
}

export function decodeFight(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    let fightClass = Fight;
    let fightClassName: string = data.name;
    if (fightClassName && (fightsCollection as any)[fightClassName]) {
        fightClass = (fightsCollection as any)[fightClassName] as typeof Fight;
    }

    const sections = data?.sections?.map((section: any) => decodeScheduledFightSection(section, options)) || [];

    return new fightClass({
        ...options,
        ...data,
        sections,
    });
}

import * as YAML from 'yaml';
import * as Bab from '@babylonjs/core';
import { Clock } from './clock';
import { FightCollection } from './fight-collection';

import {
    type Scheduled,
    isScheduled,
} from './scheduled';

import {
    Effect,
    Mechanic,
    FightSection,
    Fight,
} from './effects';

import { effectsCollection } from './fight-effects';
import { mechanicsCollection } from './fight-mechanics';

export type FightDecodeOptions = {
    collection: FightCollection
    clock?: Clock
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
        item: func(data.item, options),
        repeat: data.repeat,
        startDelay: data.startDelay,
        endDelay: data.endDelay,
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
    if (effectsCollection[effectClassName as any]) {
        effectClass = effectsCollection[effectClassName] as typeof Effect;
    }

    const resultEffect = new effectClass({
        ...options,

        duration: data.duration,
        position: data.position,
        positionType: data.positionType,
        repeatTarget: data.repeatTarget,
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

    return new mechanicClass({
        ...options,

        name: data.name,
        scheduling: data.scheduling,
        effects,
    });
}

export function decodeScheduledMechanic(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    return decodeScheduled(data, decodeMechanic, options)
}

export function decodeFightSection(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    const mechanics = data?.mechanics?.map((mechanic: any) => decodeScheduledMechanic(mechanic, options)) || [];

    return new FightSection({
        ...options,

        name: data.name,
        scheduling: data.scheduling,
        mechanics,
    });
}

export function decodeScheduledFightSection(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    return decodeScheduled(data, decodeFightSection, options)
}

export function decodeFight(data: any, options: FightDecodeOptions) {
    data = tryParse(data);

    const sections = data?.sections?.map((section: any) => decodeScheduledFightSection(section, options)) || [];

    return new Fight({
        ...options,

        name: data.name,
        scheduling: data.scheduling,
        sections,
    });
}

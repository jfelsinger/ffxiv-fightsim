import * as YAML from 'yaml';

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

function getDurationDefault(item: any) {
    return item?.getDuration?.() || 0;
}

export function decodeScheduled<T>(
    data: any,
    itemBuilder: (data: any, optons: FightDecodeOptions) => T,
    options: FightDecodeOptions,
    getItemDuration: (item: T) => number = getDurationDefault
): Scheduled<T> {
    const repeat = data.repeat || 0;
    const scheduledResult: Scheduled<T> = repeat ? {
        ...data,
        group: [],
        item: undefined,
        n: 1,
        repeat: 0,
        startDelay: parseNumber(data.startDelay || 0),
        preStartDelay: parseNumber(data.preStartDelay || 0),
        endDelay: parseNumber(data.endDelay || 0),
    } : {
        ...data,
        item: itemBuilder(data.item, options),
        n: 1,
        repeat: 0,
        startDelay: parseNumber(data.startDelay || 0),
        preStartDelay: parseNumber(data.preStartDelay || 0),
        endDelay: parseNumber(data.endDelay || 0),
    };

    // console.log('Build scheduled item: ', repeat, scheduledResult);

    if (isScheduledGroup(scheduledResult)) {
        while (scheduledResult.group.length < repeat + 1) {
            scheduledResult.group.push(itemBuilder(data.item, options));
        }
    } else {
    }

    if (data.after) {
        const after =
            isScheduled(data.after) ? decodeScheduled<T>(data.after, itemBuilder, options) :
                itemBuilder(data.after, options);
        scheduledResult.after = Array.isArray(after) ? after[0] : after;
    }

    // if (repeat) {
    //     let preRepeatDuration = getScheduledDuration(scheduledResult, getItemDuration);
    //     for (let i = 0; i < repeat; i++) {
    //         const repeatScheduled = {
    //             ...data,
    //             item: itemBuilder(data.item, options),
    //             n: i + 2,
    //             repeat: 0,
    //             startDelay: preRepeatDuration + parseNumber(data.startDelay || 0),
    //             preStartDelay: parseNumber(data.preStartDelay || 0),
    //             endDelay: parseNumber(data.endDelay || 0),
    //         };

    //         if (data.after) {
    //             const after =
    //                 isScheduled(data.after) ? decodeScheduled<T>(data.after, itemBuilder, options) :
    //                     itemBuilder(data.after, options);
    //             repeatScheduled.after = Array.isArray(after) ? after[0] : after;
    //         }

    //         results.push(repeatScheduled);

    //         // TODO: If the scheduling is sequential, need to switch how startDelay is handled.
    //         //       For parallel scheduling, this should be correct as-is.

    //         // Set to, and don't add, the duration because the startDelay has previous items baked in
    //         preRepeatDuration = getScheduledDuration(repeatScheduled, getItemDuration);
    //     }

    //     // const repeatedItems: T[] = [];
    //     // while (repeatedItems.length < repeat) {
    //     //     repeatedItems.push(itemBuilder(data.item, options));
    //     // }
    //     // scheduledResult.repeatedItems = repeatedItems;
    // }


    // Instead of a sub-item, we need repeats to broken out and decoded into their own Scheduled objects
    //  - An array of unique scheduled items
    //  - Each one respects and calculates the duration of the previous
    // if (repeat) {
    //     const repeatedItems: T[] = [];
    //     while (repeatedItems.length < repeat) {
    //         repeatedItems.push(itemBuilder(data.item, options));
    //     }

    //     scheduledResult.repeatedItems = repeatedItems;
    // }

    // `afterRepeats` is a scheduled action to happen after the initial item, but also after all the repeats
    //  - The start time for this would have to be calculated bas on the initial and item durations
    //  - No `afterRepeats` items are being used right now, so can probably temporarily disable
    if (data.afterRepeats) {
        const afterRepeats =
            isScheduled(data.afterRepeats) ? decodeScheduled<T>(data.afterRepeats, itemBuilder, options) :
                itemBuilder(data.afterRepeats, options);
        scheduledResult.afterRepeats = Array.isArray(afterRepeats) ? afterRepeats[0] : afterRepeats;
    }

    // return scheduledResult;
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

    // Flatten returned array so that decode can return an array and things still work
    const effects = data?.effects?.map((effect: any) => decodeScheduledEffect(effect, options))?.flat() || [];

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

    const mechanics = data?.mechanics?.map((mechanic: any) => decodeScheduledMechanic(mechanic, options))?.flat() || [];

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

    const sections = data?.sections?.map((section: any) => decodeScheduledFightSection(section, options))?.flat() || [];

    return new fightClass({
        ...options,
        ...data,
        sections,
    });
}

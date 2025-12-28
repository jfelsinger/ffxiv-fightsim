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

export function decodeScheduledGroup<T>(
    data: any,
    itemBuilder: (data: any, optons: FightDecodeOptions) => T,
    options: FightDecodeOptions,
    getItemDuration: (item: T) => number = getDurationDefault
): ScheduledGroup<T> {
    const repeat = data.repeat || 0;
    let n = data.n || 1;
    const pickGroup = data.pickGroup || simpleRandomIdGen(6);

    const { group, item, ...rest } = data;
    // TODO: Support repeats
    let scheduledResult: ScheduledGroup<T> = {
        ...rest,
        scheduling: data.scheduling || 'sequential',
        group: data.group?.map((groupItem: any) => {
            if (isScheduled(groupItem)) {
                console.log('Decoding scheduled group item:', groupItem);
                return decodeScheduled<T>(groupItem, itemBuilder, options, getItemDuration);
            }
            return itemBuilder(groupItem, options)
        }) || [],
        pickGroup,
        n,
        startDelay: parseNumber(data.startDelay || 0),
        preStartDelay: parseNumber(data.preStartDelay || 0),
        endDelay: parseNumber(data.endDelay || 0),
        postEndDelay: parseNumber(data.postEndDelay || 0),
    };

    if (repeat) {
        const delayOffset = parseNumber(data.delayOffset || 0);
        const scheduledResultGroup: ScheduledGroup<T> = {
            ...rest,
            group: [],
            pickGroup,
            n,
            repeat: 0,
            scheduling: data.scheduling || (data.delayOffset ? 'parallel' : 'sequential'),
            delayOffset,
            // Pre-start delay is applied before the repeats, so only done once
            preStartDelay: parseNumber(data.preStartDelay || 0),
            startDelay: 0,
            endDelay: 0,
            postEndDelay: parseNumber(data.postEndDelay || 0),
        };

        let i = 0
        while (scheduledResultGroup.group.length < repeat + 1) {
            i++;
            const pickGroup = data.pickGroup || simpleRandomIdGen(6);
            scheduledResultGroup.group.push({
                ...rest,
                group: data.group?.map((groupItem: any) => {
                    if (isScheduled(groupItem)) {
                        return decodeScheduled<T>(groupItem, itemBuilder, options, getItemDuration);
                    }
                    return itemBuilder(groupItem, options);
                }) || [],
                pickGroup,
                n: n + i,
                // preStartDelay: 0,
                preStartDelay: 0,
                startDelay: parseNumber(data.startDelay || 0),
                endDelay: parseNumber(data.endDelay || 0),
                postEndDelay: 0,
            });
        }

        scheduledResult = scheduledResultGroup;
    }

    decodeScheduledAfters(data, scheduledResult, itemBuilder, options, getItemDuration);

    return scheduledResult;
}

export function decodeScheduledItem<T>(
    data: any,
    itemBuilder: (data: any, optons: FightDecodeOptions) => T,
    options: FightDecodeOptions,
    getItemDuration: (item: T) => number = getDurationDefault
): Scheduled<T> {
    const repeat = data.repeat || 0;
    let n = data.n || 1;
    const { group, item, ...rest } = data;
    console.log('Decoding scheduled item:', data);
    let scheduledResult: Scheduled<T> = {
        ...rest,
        item: itemBuilder(data.item, options),
        n,
        repeat: 0,
        startDelay: parseNumber(data.startDelay || 0),
        preStartDelay: parseNumber(data.preStartDelay || 0),
        endDelay: parseNumber(data.endDelay || 0),
        postEndDelay: parseNumber(data.postEndDelay || 0),
    };

    if (repeat) {
        const pickGroup = data.pickGroup || simpleRandomIdGen(6);
        const delayOffset = parseNumber(data.delayOffset || 0);
        const scheduledResultGroup: ScheduledGroup<T> = {
            ...rest,
            group: [],
            pickGroup,
            n,
            repeat: 0,
            scheduling: data.scheduling || (data.delayOffset ? 'parallel' : 'sequential'),
            delayOffset,
            // Pre-start delay is applied before the repeats, so only done once
            preStartDelay: parseNumber(data.preStartDelay || 0),
            startDelay: 0,
            endDelay: 0,
            postEndDelay: parseNumber(data.postEndDelay || 0),
        };

        let i = 0
        while (scheduledResultGroup.group.length < repeat + 1) {
            i++;
            scheduledResultGroup.group.push({
                ...rest,
                item: itemBuilder(data.item, options),
                n: n + i,
                repeat: 0,
                // preStartDelay: 0,
                preStartDelay: 0,
                startDelay: parseNumber(data.startDelay || 0),
                endDelay: parseNumber(data.endDelay || 0),
                postEndDelay: 0,
            });
        }

        scheduledResult = scheduledResultGroup;
        console.log('#### Scheduled Result Group:', scheduledResult);
    }

    decodeScheduledAfters(data, scheduledResult, itemBuilder, options, getItemDuration);

    // return scheduledResult;
    return scheduledResult;
}

export function decodeScheduledAfters<T>(
    data: any,
    scheduledResult: Scheduled<T>,
    itemBuilder: (data: any, optons: FightDecodeOptions) => T,
    options: FightDecodeOptions,
    getItemDuration: (item: T) => number = getDurationDefault
): Scheduled<T> {
    if (data.after) {
        const after =
            isScheduled(data.after) ? decodeScheduled<T>(data.after, itemBuilder, options) :
                itemBuilder(data.after, options);
        scheduledResult.after = Array.isArray(after) ? after[0] : after;
    }

    // `afterRepeats` is a scheduled action to happen after the initial item, but also after all the repeats
    //  - The start time for this would have to be calculated bas on the initial and item durations
    //  - No `afterRepeats` items are being used right now, so can probably temporarily disable
    if (data.afterRepeats) {
        const afterRepeats =
            isScheduled(data.afterRepeats) ? decodeScheduled<T>(data.afterRepeats, itemBuilder, options) :
                itemBuilder(data.afterRepeats, options);
        scheduledResult.afterRepeats = Array.isArray(afterRepeats) ? afterRepeats[0] : afterRepeats;
    }

    return scheduledResult;
}

export function decodeScheduled<T>(
    data: any,
    itemBuilder: (data: any, optons: FightDecodeOptions) => T,
    options: FightDecodeOptions,
    getItemDuration: (item: T) => number = getDurationDefault
): Scheduled<T> {
    if (data && 'group' in data) {
        return decodeScheduledGroup<T>(data, itemBuilder, options, getItemDuration);
    }

    // TODO: Maybe do something about the null/undefined case.
    return decodeScheduledItem<T>(data, itemBuilder, options, getItemDuration);
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

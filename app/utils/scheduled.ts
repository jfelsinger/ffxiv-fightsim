export type ScheduleMode = 'sequential' | 'parallel';

export type ScheduledBase<T> = {
    label?: string
    n?: number
    comment?: string
    repeat?: number
    delayOffset?: number
    preStartDelay?: number
    startDelay?: number
    endDelay?: number
    postEndDelay?: number
    after?: ScheduledItem<T> | T
    afterRepeats?: ScheduledItem<T> | T
}

export type ScheduledItem<T> = ScheduledBase<T> & {
    item: T
}

export type ScheduledGroup<T> = ScheduledBase<T> & {
    scheduling?: ScheduleMode
    pickGroup?: string
    pickedIndex?: number

    exclusives: (string | number)[][]

    distributionType?: // see: effects/distribute.ts
    | 'ordered'
    | 'random'
    | 'random-rotation'
    | 'random-direction'
    | 'random-start'
    // Pick is for (usually randomly) picking an item or number of items from the distribution
    // - ordered: picks are made in distribution order, without randomness
    // - unique: each of a pick should be a unique option
    // - fully-unique: picks are removed from future iterations until all have been used
    // - repeating: two of the same option can be picked in an iteration
    pickMode?:
    | 'ordered'
    // | 'repeating'
    | 'unique'
    | 'fully-unique'
    // pick?: number[] | number
    pick?: number

    group: (Scheduled<T> | T)[]
}

export type Scheduled<T> = ScheduledGroup<T> | ScheduledItem<T>;

export type PickInfo = {
    pickGroup: string
    lastPickIndex: number
    pickCount?: number
    choices: number[]
    picked: (number[])[]
}

export const PickInfoMapping: Partial<Record<string, PickInfo>> = {};

// Currently:
//  A single scheduled contains a single item, everything follows the schedule-execution of the parent
//
// New implementation:
//  A group that can execture multiple items independent of the parent's scheduling type
//
// * Parent
//     Scheduled<Item>[]
//       item: Item

export function isScheduledGroup<T>(v: unknown): v is ScheduledGroup<T> {
    return typeof v === 'object' && v != null && 'group' in v && !('item' in v);
}

export function isScheduledItem<T>(v: unknown): v is ScheduledItem<T> {
    return typeof v === 'object' && v != null && 'item' in v && !('group' in v);
}

export function isScheduled<T>(v: unknown): v is Scheduled<T> {
    return typeof v === 'object' && v != null && ('item' in v || 'group' in v);
}

export function forEachNestedScheduled<T>(
    scheduled: Scheduled<T> | undefined,
    func: (item: Scheduled<T>, i?: number) => void,
    maxDepth = 20,
    includeSelf = false,
) {
    if (!scheduled) { return; }
    if (includeSelf) {
        func(scheduled);
    }
    if (!maxDepth) { return; }

    if (isScheduledGroup(scheduled)) {
        scheduled?.group?.forEach((groupItem, i) => {
            if (isScheduled(groupItem)) {
                forEachNestedScheduled(groupItem, func, maxDepth - 1, true);
            }
        });
    }
}

export function forEachScheduledEntry<T>(
    scheduled: Scheduled<T> | undefined,
    func: (entry: Scheduled<T> | T, i?: number) => void,
) {
    if (!scheduled) { return; }
    if (isScheduledItem(scheduled)) {
        func(scheduled.item);
    } else if (isScheduledGroup(scheduled)) {
        const picks = getScheduledPicks(scheduled);
        picks?.forEach((groupItem) => {
            func(groupItem);
        });
    }
}

export function forEachScheduledItem<T>(
    scheduled: Scheduled<T> | undefined,
    func: (item: T, i?: number) => void,
) {
    forEachScheduledEntry(scheduled, (entry, i) => {
        if (isScheduled(entry)) {
            forEachScheduledItem(entry as Scheduled<T>, func);
        } else {
            func(entry as T);
        }
    });
}

export function getScheduledDuration<T>(
    scheduled: Scheduled<T>,
    getItemDuration: (item: T) => number = (() => 0)
) {
    let duration = 0;
    duration += scheduled?.preStartDelay || 0;
    duration += scheduled?.startDelay || 0;

    const picks = getScheduledPicks(scheduled);
    const scheduling = ('scheduling' in scheduled && scheduled.scheduling) ? scheduled.scheduling : 'sequential';
    if (scheduling === 'parallel') {
        let maxDelay = 0;
        picks.forEach((entry, i) => {
            if (entry) {
                if (isScheduled(entry)) {
                    maxDelay = Math.max(maxDelay, getScheduledDuration(entry, getItemDuration));
                } else {
                    maxDelay = Math.max(maxDelay, getItemDuration(entry));
                }
            }
        });
        duration += maxDelay;
    } else {
        picks.forEach((entry, i) => {
            if (entry) {
                if (isScheduled(entry)) {
                    duration += getScheduledDuration(entry, getItemDuration);
                    console.log(`Getting duration for scheduled entry: `, entry, duration);
                } else {
                    duration += getItemDuration(entry);
                    console.log(`Getting duration for item entry: `, entry, duration);
                }
            }
        });
    }

    // if (isScheduledGroup(scheduled) && scheduled.scheduling === 'parallel') {
    //     let maxDelay = 0;
    //     forEachScheduledEntry(scheduled, (entry) => {
    //         if (entry) {
    //             if (isScheduled(entry)) {
    //                 maxDelay = Math.max(maxDelay, getScheduledDuration(entry, getItemDuration));
    //             } else {
    //                 maxDelay = Math.max(maxDelay, getItemDuration(entry));
    //             }
    //         }
    //     })

    //     duration += maxDelay;
    // } else {
    //     forEachScheduledEntry(scheduled, (entry) => {
    //         if (entry) {
    //             if (isScheduled(entry)) {
    //                 duration += getScheduledDuration(entry, getItemDuration);
    //             } else {
    //                 duration += getItemDuration(entry);
    //             }
    //         }
    //     });
    // }

    duration += scheduled?.endDelay || 0;
    duration += scheduled?.postEndDelay || 0;

    if (scheduled.after) {
        if (isScheduled(scheduled.after)) {
            duration += scheduled?.after?.preStartDelay || 0;
            duration += getScheduledDuration(scheduled.after as Scheduled<T>, getItemDuration)
        } else {
            duration += getItemDuration(scheduled.after);
        }
    }

    return duration;
}

export type ScheduledParent<T> = {
    scheduled: Scheduled<T>,
    n: number,
    parent?: ScheduledParent<T>,
}

export function getScheduledPicks<T>(
    scheduled: Scheduled<T>,
): (T | Scheduled<T>)[] {
    if (isScheduledGroup(scheduled)) {
        if (scheduled.pickGroup) {
            let pickGroup: PickInfo = PickInfoMapping[scheduled.pickGroup] || {
                pickGroup: scheduled.pickGroup,
                lastPickIndex: -1,
                pickCount: 0,
                choices: scheduled.group.map((_, i) => i),
                picked: [],
            };

            PickInfoMapping[scheduled.pickGroup] = pickGroup;
            if (!pickGroup.pickCount) {
                pickGroup.pickCount = 0;
                // 1st, apply distribution
                let choices = scheduled.group.map((_, i) => i);
                if (scheduled.distributionType === 'random') {
                    choices = shuffleArray(choices);
                } else if (scheduled.distributionType === 'random-start') {
                    choices = rotateArray(choices, Math.floor(Math.random() * choices.length) + 1);
                } else if (scheduled.distributionType === 'random-direction') {
                    if (Math.random() < 0.5) {
                        choices = choices.reverse();
                    }
                } else if (scheduled.distributionType === 'random-rotation') {
                    choices = rotateArray(choices, Math.floor(Math.random() * choices.length) + 1);
                    if (Math.random() < 0.5) {
                        choices = choices.reverse();
                    }
                }
                pickGroup.choices = choices;
            }

            // 2nd, calculate picks
            let picks: number[] = [];
            if ((scheduled.pickedIndex || scheduled.pickedIndex === 0) && pickGroup.picked[scheduled.pickedIndex]) {
                const storedPicks = pickGroup.picked[scheduled.pickedIndex];
                console.log(`Getting stored picks for pickGroup: ${scheduled.pickGroup}`, scheduled, scheduled.pickedIndex, pickGroup);
                if (storedPicks) { picks = storedPicks as number[]; }
            } else {
                const choicesCount = pickGroup.choices.length;
                const exclusives = scheduled.exclusives || [];

                if (scheduled.pickMode === 'unique') {
                    const amountToPick = scheduled.pick || 1;
                    let availableChoices = pickGroup.choices.slice();
                    while (availableChoices.length && picks.length < amountToPick) {
                        const choice = availableChoices.splice(Math.floor(Math.random() * availableChoices.length), 1)[0];
                        console.log(`Getting unique picks for pickGroup: ${scheduled.pickGroup}`, picks, scheduled, pickGroup, availableChoices, choice);
                        if (choice || choice === 0) {
                            picks.push(choice);
                            exclusives.filter((exclusions) => exclusions.includes(choice)).forEach((exclusions) => {
                                availableChoices = availableChoices.filter((c) => !exclusions.includes(c));
                            });
                        }
                    }
                    console.log(`Got unique picks for pickGroup: ${scheduled.pickGroup}`, picks, scheduled, pickGroup, availableChoices);
                } else if (scheduled.pickMode === 'fully-unique') {
                    const amountToPick = scheduled.pick || 1;
                    let availableChoices = pickGroup.choices.filter(c => pickGroup.picked.every(p => Array.isArray(p) ? !p.includes(c) : p !== c));
                    while (availableChoices.length && picks.length < amountToPick) {
                        const choice = availableChoices.splice(Math.floor(Math.random() * availableChoices.length), 1)[0];
                        if (choice || choice === 0) {
                            picks.push(choice);
                            exclusives.filter((exclusions) => exclusions.includes(choice)).forEach((exclusions) => {
                                availableChoices = availableChoices.filter((c) => !exclusions.includes(c));
                            });
                        }
                    }
                } else {
                    const amountToPick = scheduled.pick || choicesCount;
                    // ordered/default
                    while (picks.length < amountToPick) {
                        if (pickGroup.lastPickIndex >= choicesCount - 1) {
                            pickGroup.lastPickIndex = -1;
                        }
                        const choice = pickGroup.choices[++pickGroup.lastPickIndex];
                        if (choice || choice === 0) {
                            picks.push(choice);
                        }
                    }
                }

                pickGroup.pickCount++;
                scheduled.pickedIndex = pickGroup.picked.length;
                pickGroup.picked.push(picks as number[]);
            }

            return picks.map((i) => scheduled.group[i]).filter((_) => _) as (Scheduled<T> | T)[];
        }

        return scheduled.group.filter((_) => _);
    } else {
        const { item } = scheduled;
        if (item) {
            return [item];
        }
    }

    return [];
}

export function traverseScheduled<T>(
    scheduled: Scheduled<T>,
    func: (item: T, n: number, startTime: number, currentDelay: number, parent?: ScheduledParent<T>) => any,
    getItemDuration: (item: T) => number = (() => 0),
    clock: Clock,
    repeatNumber = 0,
    startTime = 0
) {
    console.log(`Traversing scheduled, starting at: ${startTime}`, scheduled);
    let delay = 0;
    delay += scheduled?.preStartDelay || 0;
    delay += scheduled?.startDelay || 0;

    const picks = getScheduledPicks(scheduled);
    const scheduling = ('scheduling' in scheduled && scheduled.scheduling) ? scheduled.scheduling : 'sequential';
    if (scheduling === 'parallel') {
        let maxDelay = 0;
        picks.forEach((entry, i) => {
            if (entry) {
                if (isScheduled(entry)) {
                    traverseScheduled(entry as Scheduled<T>, func, getItemDuration, clock, repeatNumber, startTime + delay);
                    maxDelay = Math.max(maxDelay, getScheduledDuration(entry, getItemDuration));
                } else {
                    func(entry, repeatNumber, startTime, delay);
                    maxDelay = Math.max(maxDelay, getItemDuration(entry));
                }
            }
        });
        delay += maxDelay;
    } else {
        picks.forEach((entry, i) => {
            if (entry) {
                if (isScheduled(entry)) {
                    traverseScheduled(entry as Scheduled<T>, func, getItemDuration, clock, repeatNumber, startTime + delay);
                    delay += getScheduledDuration(entry, getItemDuration);
                } else {
                    func(entry, repeatNumber, startTime, delay);
                    delay += getItemDuration(entry);
                }
            }
        });
    }

    // if (isScheduledGroup(scheduled) && scheduled.scheduling === 'parallel') {
    //     let maxDelay = 0;
    //     forEachScheduledEntry(scheduled, (entry) => {
    //         if (entry) {
    //             if (isScheduled(entry)) {
    //                 traverseScheduled(entry as Scheduled<T>, func, getItemDuration, clock, repeatNumber, startTime + delay);
    //                 maxDelay = Math.max(maxDelay, getScheduledDuration(entry, getItemDuration));
    //             } else {
    //                 func(entry, repeatNumber, startTime, delay);
    //                 maxDelay = Math.max(maxDelay, getItemDuration(entry));
    //             }
    //         }
    //     });
    //     delay += maxDelay;
    // } else {
    //     forEachScheduledEntry(scheduled, (entry) => {
    //         if (entry) {
    //             if (isScheduled(entry)) {
    //                 traverseScheduled(entry as Scheduled<T>, func, getItemDuration, clock, repeatNumber, startTime + delay);
    //                 delay += getScheduledDuration(entry, getItemDuration);
    //             } else {
    //                 func(entry, repeatNumber, startTime, delay);
    //                 delay += getItemDuration(entry);
    //             }
    //         }
    //     });
    // }


    delay += scheduled.endDelay || 0;
    delay += scheduled.postEndDelay || 0;

    if (scheduled.afterRepeats) {
        if (isScheduled(scheduled.afterRepeats)) {
            delay += scheduled?.afterRepeats?.preStartDelay || 0;
            delay += traverseScheduled(
                scheduled.afterRepeats as Scheduled<T>,
                (i, n, st, cd, p) => {
                    if (p) { p.parent = { n: repeatNumber, scheduled }; }
                    else { p = { n: repeatNumber, scheduled }; }
                    return func(i, n, st, cd, p);
                },
                getItemDuration,
                clock,
                0,
                startTime + delay
            )
        } else {
            func(scheduled.afterRepeats, repeatNumber, startTime, delay, { n: repeatNumber, scheduled });
            delay += getItemDuration(scheduled.afterRepeats);
        }
    }

    return startTime + delay;
}

export function getScheduledJSONSnapshot<T>(scheduled: Scheduled<T>) {
    const result: any = {
        label: scheduled.label,
        repeat: scheduled.repeat,
        preStartDelay: scheduled.preStartDelay,
        startDelay: scheduled.startDelay,
        endDelay: scheduled.endDelay,
    };

    if (isScheduledItem(scheduled)) {
        const item: any = scheduled.item;
        if (item && 'toJSONSnapshot' in item) {
            result.item = item.toJSONSnapshot();
        }
    } else {
        result.scheduling = scheduled.scheduling,
            result.group = scheduled.group.map((g) => {
                if (isScheduledItem(g)) { return getScheduledJSONSnapshot(g); }
                if (isScheduledGroup(g)) { return getScheduledJSONSnapshot(g); }
                if (g && (typeof g === 'object') && 'toJSONSnapshot' in g) {
                    return (g as any).toJSONSnapshot();
                }
            });
    }

    if (scheduled.after) {
        result.after = getScheduledJSONSnapshot(scheduled.after as Scheduled<T>);
    }

    if (scheduled.afterRepeats) {
        result.afterRepeats = getScheduledJSONSnapshot(scheduled.afterRepeats as Scheduled<T>);
    }

    return result;
}

export function loadScheduledJSONSnapshot<T>(scheduled: Scheduled<T>, snapshot: any) {
    if (snapshot.label) { scheduled.label = snapshot.label; }
    if (snapshot.repeat) { scheduled.repeat = snapshot.repeat; }
    if (snapshot.preStartDelay) { scheduled.preStartDelay = snapshot.preStartDelay; }
    if (snapshot.startDelay) { scheduled.startDelay = snapshot.startDelay; }
    if (snapshot.endDelay) { scheduled.endDelay = snapshot.endDelay; }

    if (isScheduledItem(scheduled)) {
        const item: any = scheduled.item;
        if (snapshot.item && 'loadJSONSnapshot' in item) {
            item.loadJSONSnapshot(snapshot.item);
        }
    } else {
        if (snapshot.scheduling) { scheduled.scheduling = snapshot.scheduling; }
        if (Array.isArray(snapshot.group)) {
            const len = snapshot.group.length;
            for (let i = 0; i < len; i++) {
                const item: any = scheduled?.group?.[i];
                if (item) {
                    if (isScheduledItem(item)) {
                        loadScheduledJSONSnapshot(item, snapshot.group[i]);
                    }
                    else if (isScheduledGroup(item)) {
                        loadScheduledJSONSnapshot(item, snapshot.group[i]);
                    }
                    else if (item && 'toJSONSnapshot' in item) {
                        item.loadJSONSnapshot(snapshot.group[i]);
                    }
                }
            }
        }
    }

    if (scheduled.after && snapshot.after) {
        loadScheduledJSONSnapshot(scheduled.after as Scheduled<T>, snapshot.after);
    }

    if (scheduled.afterRepeats && snapshot.afterRepeats) {
        loadScheduledJSONSnapshot(scheduled.afterRepeats as Scheduled<T>, snapshot.afterRepeats);
    }

    return scheduled;
}

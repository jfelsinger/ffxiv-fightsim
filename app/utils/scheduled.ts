export type ScheduleMode = 'sequential' | 'parallel';

export type ScheduledBase<T> = {
    label?: string
    comment?: string
    repeat?: number
    preStartDelay?: number
    startDelay?: number
    endDelay?: number
    after?: ScheduledItem<T> | T
    afterRepeats?: ScheduledItem<T> | T
}

export type ScheduledItem<T> = ScheduledBase<T> & {
    item: T
}

export type ScheduledGroup<T> = ScheduledBase<T> & {
    scheduling?: ScheduleMode
    group: (Scheduled<T> | T)[]
}

export type Scheduled<T> = ScheduledGroup<T> | ScheduledItem<T>;

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
    return typeof v === 'object' && v != null && 'group' in v;
}

export function isScheduledItem<T>(v: unknown): v is ScheduledItem<T> {
    return typeof v === 'object' && v != null && 'item' in v && !('group' in v);
}

// Should be a combination of the above but... :shrug:
// Being kept as-is for references elsewhere, until everything is refactored
export function isScheduled<T>(v: unknown): v is ScheduledItem<T> {
    return typeof v === 'object' && v != null && 'item' in v;
}

export function forEachScheduledItem<T>(
    scheduled: Scheduled<T> | undefined,
    func: (item: T, i?: number) => void,
) {
    if (!scheduled) { return; }
    if (isScheduledItem(scheduled)) {
        console.log('forEachScheduledItem - item:', scheduled.item);
        func(scheduled.item);
    } else if (isScheduledGroup(scheduled)) {
        scheduled?.group?.forEach((groupItem, i) => {
            if (isScheduled(groupItem)) {
                if (isScheduledItem(groupItem)) {
                    console.log('forEachScheduledItem - scheduled item:', groupItem?.item);
                    func(groupItem.item, i);
                } else {
                    console.log('forEachScheduledItem - scheduled group:', groupItem);
                    // TODO: Fix how this will work with `i`, since it's nested
                    forEachScheduledItem(groupItem, func);
                }
            } else {
                console.log('forEachScheduledItem - scheduled X:', groupItem);
                func(groupItem as T, i);
            }
        });
    }
}

export function getScheduledDuration<T>(
    scheduled: Scheduled<T>,
    getItemDuration: (item: T) => number = (() => 0)
) {
    let duration = 0;
    duration += scheduled?.startDelay || 0;

    forEachScheduledItem(scheduled, (item) => {
        if (item) {
            duration += getItemDuration(item);
        }
    })
    // if (isScheduledItem(scheduled)) {
    //     duration += getItemDuration(scheduled.item);
    // } else {
    //     // TODO: Implement scheduling type
    //     const len = scheduled.group.length;
    //     for (let i = 0; i < len; i++) {
    //         const groupItem = scheduled.group[i];
    //         if (isScheduledItem(groupItem)) {
    //             duration += getScheduledDuration(
    //                 groupItem,
    //                 getItemDuration,
    //             );
    //         }
    //         else if (isScheduledGroup(groupItem)) {
    //             duration += getScheduledDuration(
    //                 groupItem as any,
    //                 getItemDuration,
    //             );
    //         }
    //         else if (groupItem) {
    //             duration += getItemDuration(groupItem);
    //         }
    //     }
    // }

    duration += scheduled?.endDelay || 0;

    if (scheduled.after) {
        if (isScheduled(scheduled.after)) {
            duration += scheduled?.after?.preStartDelay || 0;
            duration += getScheduledDuration(scheduled.after, getItemDuration)
        } else {
            duration += getItemDuration(scheduled.after);
        }
    }

    // Phase out repeats outside of decoding logic
    // if (scheduled.repeat) {
    //     duration += duration * scheduled.repeat;
    //     if (scheduled.afterRepeats) {
    //         if (isScheduled(scheduled.afterRepeats)) {
    //             duration += scheduled?.afterRepeats?.preStartDelay || 0;
    //             duration += getScheduledDuration(scheduled.afterRepeats, getItemDuration)
    //         } else {
    //             duration += getItemDuration(scheduled.afterRepeats);
    //         }
    //     }
    // }

    return duration;
}

export type ScheduledParent<T> = {
    scheduled: Scheduled<T>,
    n: number,
    parent?: ScheduledParent<T>,
}

// Deprecrated - Async/Await timeout usage cannot be rewound
// export async function executeScheduled<T>(scheduled: Scheduled<T>, func: (item: T, n: number, parent?: ScheduledParent<T>) => Promise<any>, clock: Clock, repeatNumber = 0) {
//     if (scheduled.startDelay) {
//         await clock.wait(scheduled.startDelay);
//     }
//
//     if (isScheduledItem(scheduled)) {
//         await func(scheduled.item, repeatNumber);
//     } else {
//     }
//
//     if (scheduled.endDelay) {
//         await clock.wait(scheduled.endDelay);
//     }
//
//     if (scheduled.after) {
//         if (isScheduled(scheduled.after)) {
//             if (scheduled.after.preStartDelay) { await wait(scheduled.after.preStartDelay); }
//             await executeScheduled(
//                 scheduled.after,
//                 (i, n, p) => {
//                     if (p) { p.parent = { n: repeatNumber, scheduled }; }
//                     else { p = { n: repeatNumber, scheduled }; }
//                     return func(i, n, p);
//                 },
//                 clock,
//             )
//         } else {
//             await func(scheduled.after, repeatNumber, { n: repeatNumber, scheduled });
//         }
//     }
//
//     if (scheduled.repeat) {
//         if (scheduled.repeat > repeatNumber) {
//             await executeScheduled(scheduled, func, clock, (repeatNumber || 0) + 1)
//         } else if (scheduled.afterRepeats) {
//             if (isScheduled(scheduled.afterRepeats)) {
//                 // `preStartDelay` only seems implemented for the two after types, and none actually exist, probably ok
//                 // to ignore for now, and revisit the intended functionality later
//                 if (scheduled.afterRepeats.preStartDelay) { await wait(scheduled.afterRepeats.preStartDelay); }
//                 await executeScheduled(
//                     scheduled.afterRepeats,
//                     (i, n, p) => {
//                         if (p) { p.parent = { n: repeatNumber, scheduled }; }
//                         else { p = { n: repeatNumber, scheduled }; }
//                         return func(i, n, p);
//                     },
//                     clock,
//                 )
//             } else {
//                 await func(scheduled.afterRepeats, repeatNumber, { n: repeatNumber, scheduled });
//             }
//         }
//     }
// }

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

    forEachScheduledItem(scheduled, (item) => {
        delay += scheduled.startDelay || 0;
        func(item, repeatNumber, startTime, delay);
        delay += getItemDuration(item);

        delay += scheduled.endDelay || 0;

        if (scheduled.after) {
            if (isScheduled(scheduled.after)) {
                delay += scheduled?.after?.preStartDelay || 0;
                delay += traverseScheduled(
                    scheduled.after,
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
                func(scheduled.after, repeatNumber, startTime, delay, { n: repeatNumber, scheduled });
                delay += getItemDuration(scheduled.after);
            }
        }

    });



    // if (isScheduledItem(scheduled)) {
    //     func(scheduled.item, repeatNumber, startTime, delay);
    //     // if (repeatNumber > 0 && scheduled.repeatedItems?.[repeatNumber - 1]) {
    //     //     func(scheduled.repeatedItems[repeatNumber - 1] as T, repeatNumber, startTime, delay);
    //     // } else {
    //     //     func(scheduled.item, repeatNumber, startTime, delay);
    //     // }

    //     delay += getItemDuration(scheduled.item);
    // } else if (isScheduledGroup(scheduled)) {
    //     // TODO: Implement scheduling type
    //     // MAKE SURE THE DELAY += is right
    //     const len = scheduled.group.length;
    //     for (let i = 0; i < len; i++) {
    //         const groupItem = scheduled.group[i];
    //         if (isScheduledItem(groupItem)) {
    //             delay += traverseScheduled(
    //                 groupItem,
    //                 func,
    //                 getItemDuration,
    //                 clock,
    //                 repeatNumber,
    //                 startTime + delay
    //             );
    //         }
    //         else if (isScheduledGroup(groupItem)) {
    //             delay += traverseScheduled(
    //                 groupItem as any,
    //                 func,
    //                 getItemDuration,
    //                 clock,
    //                 repeatNumber,
    //                 startTime + delay
    //             );
    //         }
    //         else if (groupItem) {
    //             func(groupItem, repeatNumber, startTime, delay);
    //             delay += getItemDuration(groupItem);
    //         }
    //     }
    // }

    if (scheduled.afterRepeats) {
        if (isScheduled(scheduled.afterRepeats)) {
            delay += scheduled?.afterRepeats?.preStartDelay || 0;
            delay += traverseScheduled(
                scheduled.afterRepeats,
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

    // if (scheduled.repeat) {
    //     // console.log('Shcheduled O has repeats: ', scheduled.repeat, repeatNumber, startTime + delay, scheduled);
    //     if (scheduled.repeat > repeatNumber) {
    //         delay += traverseScheduled(scheduled, func, getItemDuration, clock, (repeatNumber || 0) + 1, startTime + delay);
    //     } else if (scheduled.afterRepeats) {
    //         if (isScheduled(scheduled.afterRepeats)) {
    //             delay += scheduled?.afterRepeats?.preStartDelay || 0;
    //             delay += traverseScheduled(
    //                 scheduled.afterRepeats,
    //                 (i, n, st, cd, p) => {
    //                     if (p) { p.parent = { n: repeatNumber, scheduled }; }
    //                     else { p = { n: repeatNumber, scheduled }; }
    //                     return func(i, n, st, cd, p);
    //                 },
    //                 getItemDuration,
    //                 clock,
    //                 0,
    //                 startTime + delay
    //             )
    //         } else {
    //             func(scheduled.afterRepeats, repeatNumber, startTime, delay, { n: repeatNumber, scheduled });
    //             delay += getItemDuration(scheduled.afterRepeats);
    //         }
    //     }
    // }

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

export type ScheduleMode = 'sequential' | 'parallel';
export type Scheduled<T> = {
    item: T
    repeatedItems?: T[]
    label?: string
    comment?: string
    repeat?: number
    preStartDelay?: number
    startDelay?: number
    endDelay?: number
    after?: Scheduled<T> | T
    afterRepeats?: Scheduled<T> | T
}

export function isScheduled<T>(v: unknown): v is Scheduled<T> {
    return typeof v === 'object' && v != null && 'item' in v;
}

export function getScheduledDuration<T>(
    scheduled: Scheduled<T>,
    getItemDuration: (item: T) => number = (() => 0)
) {
    let duration = 0;
    duration += scheduled?.startDelay || 0;
    duration += getItemDuration(scheduled.item);
    duration += scheduled?.endDelay || 0;

    if (scheduled.after) {
        if (isScheduled(scheduled.after)) {
            duration += scheduled?.after?.preStartDelay || 0;
            duration += getScheduledDuration(scheduled.after, getItemDuration)
        } else {
            duration += getItemDuration(scheduled.after);
        }
    }

    if (scheduled.repeat) {
        duration += duration * scheduled.repeat;
        if (scheduled.afterRepeats) {
            if (isScheduled(scheduled.afterRepeats)) {
                duration += scheduled?.afterRepeats?.preStartDelay || 0;
                duration += getScheduledDuration(scheduled.afterRepeats, getItemDuration)
            } else {
                duration += getItemDuration(scheduled.afterRepeats);
            }
        }
    }

    return duration;
}

export type ScheduledParent<T> = {
    scheduled: Scheduled<T>,
    n: number,
    parent?: ScheduledParent<T>,
}

// Using async/await was a mistake. Instead of executing and waiting, scheduling will have
// to be done through the tick system... probably
export async function executeScheduled<T>(scheduled: Scheduled<T>, func: (item: T, n: number, parent?: ScheduledParent<T>) => Promise<any>, clock: Clock, repeatNumber = 0) {
    if (scheduled.startDelay) {
        await clock.wait(scheduled.startDelay);
    }

    await func(scheduled.item, repeatNumber);

    if (scheduled.endDelay) {
        await clock.wait(scheduled.endDelay);
    }

    if (scheduled.after) {
        if (isScheduled(scheduled.after)) {
            if (scheduled.after.preStartDelay) { await wait(scheduled.after.preStartDelay); }
            await executeScheduled(
                scheduled.after,
                (i, n, p) => {
                    if (p) { p.parent = { n: repeatNumber, scheduled }; }
                    else { p = { n: repeatNumber, scheduled }; }
                    return func(i, n, p);
                },
                clock,
            )
        } else {
            await func(scheduled.after, repeatNumber, { n: repeatNumber, scheduled });
        }
    }

    if (scheduled.repeat) {
        if (scheduled.repeat > repeatNumber) {
            await executeScheduled(scheduled, func, clock, (repeatNumber || 0) + 1)
        } else if (scheduled.afterRepeats) {
            if (isScheduled(scheduled.afterRepeats)) {
                if (scheduled.afterRepeats.preStartDelay) { await wait(scheduled.afterRepeats.preStartDelay); }
                await executeScheduled(
                    scheduled.afterRepeats,
                    (i, n, p) => {
                        if (p) { p.parent = { n: repeatNumber, scheduled }; }
                        else { p = { n: repeatNumber, scheduled }; }
                        return func(i, n, p);
                    },
                    clock,
                )
            } else {
                await func(scheduled.afterRepeats, repeatNumber, { n: repeatNumber, scheduled });
            }
        }
    }
}

export function traverseScheduled<T>(
    scheduled: Scheduled<T>,
    func: (item: T, n: number, startTime: number, currentDelay: number, parent?: ScheduledParent<T>) => any,
    getItemDuration: (item: T) => number = (() => 0),
    clock: Clock,
    repeatNumber = 0,
    startTime = 0
) {
    // console.log(`Traversing scheduled, starting at: ${startTime}, repeat #: ${repeatNumber}`, scheduled);
    let delay = scheduled.startDelay || 0;
    if (repeatNumber > 0 && scheduled.repeatedItems?.[repeatNumber - 1]) {
        func(scheduled.repeatedItems[repeatNumber - 1] as T, repeatNumber, startTime, delay);
    } else {
        func(scheduled.item, repeatNumber, startTime, delay);
    }

    delay += getItemDuration(scheduled.item);
    delay += scheduled?.endDelay || 0;

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

    if (scheduled.repeat) {
        // console.log('Shcheduled O has repeats: ', scheduled.repeat, repeatNumber, startTime + delay, scheduled);
        if (scheduled.repeat > repeatNumber) {
            delay += traverseScheduled(scheduled, func, getItemDuration, clock, (repeatNumber || 0) + 1, startTime + delay);
        } else if (scheduled.afterRepeats) {
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

    const item: any = scheduled.item;
    if (item && 'toJSONSnapshot' in item) {
        result.item = item.toJSONSnapshot();
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

    const item: any = scheduled.item;
    if (snapshot.item && 'loadJSONSnapshot' in item) {
        item.loadJSONSnapshot(snapshot.item);
    }

    if (scheduled.after && snapshot.after) {
        loadScheduledJSONSnapshot(scheduled.after as Scheduled<T>, snapshot.after);
    }

    if (scheduled.afterRepeats && snapshot.afterRepeats) {
        loadScheduledJSONSnapshot(scheduled.afterRepeats as Scheduled<T>, snapshot.afterRepeats);
    }

    return scheduled;
}

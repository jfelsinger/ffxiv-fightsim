export type ScheduleMode = 'sequential' | 'parallel';
export type Scheduled<T> = {
    item: T
    label?: string
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

export function getScheduledDuration<T>(scheduled: Scheduled<T>, getItemDuration: (item: T) => number = (() => 0)) {
    let duration = 0;
    duration += scheduled?.startDelay || 0;
    duration += getItemDuration(scheduled.item);
    duration += scheduled?.endDelay || 0;

    if (scheduled.after) {
        if (isScheduled(scheduled.after)) {
            duration += getScheduledDuration(scheduled.after, getItemDuration)
        } else {
            duration += getItemDuration(scheduled.after);
        }
    }

    if (scheduled.repeat) {
        duration += duration * scheduled.repeat;
        if (scheduled.afterRepeats) {
            if (isScheduled(scheduled.afterRepeats)) {
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

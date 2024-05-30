export type ScheduleMode = 'sequential' | 'parallel';
export type Scheduled<T> = {
    item: T
    repeat?: number
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

export async function executeScheduled<T>(scheduled: Scheduled<T>, func: (item: T) => Promise<void>, clock: Clock, repeatNumber = 0) {
    if (scheduled.startDelay) {
        await clock.wait(scheduled.startDelay);
    }

    await func(scheduled.item);

    if (scheduled.endDelay) {
        await clock.wait(scheduled.endDelay);
    }

    if (scheduled.after) {
        if (isScheduled(scheduled.after)) {
            await executeScheduled(scheduled.after, func, clock)
        } else {
            await func(scheduled.after);
        }
    }

    if (scheduled.repeat) {
        if (scheduled.repeat > repeatNumber) {
            await executeScheduled(scheduled, func, clock, (repeatNumber || 0) + 1)
        } else if (scheduled.afterRepeats) {
            if (isScheduled(scheduled.afterRepeats)) {
                await executeScheduled(scheduled.afterRepeats, func, clock)
            } else {
                await func(scheduled.afterRepeats);
            }
        }
    }
}

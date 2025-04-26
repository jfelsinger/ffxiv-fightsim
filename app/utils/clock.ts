const debug = Debug('game:utils:clock');

// type ClockTimeoutFunc = (time: number, clock: Clock) => void;
type ClockTimeoutFunc = (entry?: ClockTimeoutEntry, delta?: number) => void;
type ClockTimeoutEntry = {
    id: number
    func: ClockTimeoutFunc
    time: number
    interval?: number
    persist?: boolean
    reverse?: boolean
    isExecuting?: boolean
    undo?: ClockTimeoutFunc
    undoIsExecuting?: boolean
}

type ExtraTimeoutOptions = {
    undo?: ClockTimeoutFunc
    persist?: boolean
    reverse?: boolean
}

type ClockOptions = {
    name?: string
    startTime: number
    scaling: number
    duration: number
    paused: boolean
}

const DefaultClockOptions: ClockOptions = {
    startTime: 0,
    scaling: 1.0,
    duration: 0,
    paused: false,
} as const;

export class Clock extends EventEmitter {
    name?: string;
    time: number;
    lastDelta: number = 0;
    _prevTime: number;
    scaling: number;
    duration?: number;
    isPaused: boolean;
    executeOnTick: boolean = true;

    timeouts: ClockTimeoutEntry[] = [];

    constructor(options?: Partial<ClockOptions>) {
        super();
        const opts = {
            ...DefaultClockOptions,
            ...options,
        }

        this.name = opts.name;
        this.time = opts.startTime;
        this._prevTime = opts.startTime;
        this.scaling = opts.scaling;
        this.duration = opts.duration;
        this.isPaused = opts.paused;
        if (!this.isPaused) {
            this.start(); // To make sure the event is emitted
        }
    }

    start() {
        this.emit('start', this.time, this);
        this.isPaused = false;
    }

    pause() {
        this.emit('pause', this.time, this);
        this.isPaused = true;
    }

    tick(delta: number = 1) {
        if (this.isPaused) {
            return;
        } // else:

        delta *= this.scaling;
        this._prevTime = this.time;
        this.time += delta;
        this.lastDelta = delta;

        if (this.duration && this.time >= this.duration) {
            this.time = this.duration;
        }
        this.emit('tick', this.time, delta, this);
        this.emit('time-change', this.time, delta, this);

        if (this.executeOnTick) {
            this.executeTick(delta);
        }
    }

    setTime(time: number, setPrevToo = false) {
        if (this.duration) {
            time = Math.min(time, this.duration);
        }

        const prevTime = this.time;
        this.time = time;
        const delta = time - this._prevTime;
        this.emit('time-change', this.time, time - this._prevTime, this);
        if (setPrevToo) {
            this._prevTime = time;
        } else {
            this._prevTime = prevTime;
        }

        this.executeTick(delta);
    }

    clear(id: number) {
        // this.timeouts = this.timeouts.filter((e) => e.id != id)
        const index = this.timeouts.findIndex((e) => e.id === id)

        if (index === -1)
            return;
        if (index === 0) {
            this.timeouts.shift();
        } else if (index === this.timeouts.length - 1) {
            this.timeouts.length = this.timeouts.length - 1;
        } else {
            this.timeouts.slice(index, 1);
        }
    }

    wait(ms: number) {
        return new Promise<void>(res => {
            this.after(() => res(), ms);
        });
    }

    waitTill(time: number) {
        return new Promise<void>(res => {
            this.at(() => res(), time);
        });
    }

    at(func: ClockTimeoutFunc, time: number, opts?: ExtraTimeoutOptions) {
        const id = (Math.round(Math.random() * 1000) * 100000) + time + this.time;
        this.timeouts.push({
            id,
            func,
            time,
            persist: !!opts?.undo,
            ...opts,
        });
        return id;
    }

    after(func: ClockTimeoutFunc, ms: number, opts?: ExtraTimeoutOptions) {
        return this.at(func, this.time + ms, opts);
    }

    intervalAt(func: ClockTimeoutFunc, interval: number, time = 0, opts?: ExtraTimeoutOptions) {
        const id = (Math.round(Math.random() * 1000) * 100000) + interval + this.time;
        this.timeouts.push({
            id,
            func,
            time: time || this.time,
            interval,
            persist: !!opts?.undo,
            ...opts,
        });
        return id;
    }

    intervalAfter(func: ClockTimeoutFunc, interval: number, delay = 0, opts?: ExtraTimeoutOptions) {
        return this.intervalAt(func, interval, this.time + delay, opts);
    }

    executeTick(delta: number = 1) {
        const isReverse = delta < 0;
        const timeouts = this.timeouts.slice();
        // const timeouts = this.timeouts.filter((e) =>
        //     !e.isExecuting &&
        //     e.time > this._prevTime &&
        //     e.time <= this.time);

        this.emit('start-execute', this.time, this);
        const length = timeouts.length;
        if (isReverse) {
            for (let i = 0; i < length; i++) {
                const timeout = timeouts[i];
                if (!timeout) { continue; }
                if (timeout.reverse) {
                } else {
                    if (!timeout.isExecuting ||
                        timeout.time > this._prevTime ||
                        timeout.time <= this.time
                    )
                        continue;
                    // else:

                    if (timeout.persist) {
                        delete timeout.isExecuting;
                    }

                    if (timeout.undo && !timeout.undoIsExecuting) {
                        timeout.undoIsExecuting = true;
                        try {
                            timeout.undo(timeout, delta);
                        } catch (err) {
                            debug('tick execute undo error: ', err);
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < length; i++) {
                const timeout = timeouts[i];
                if (!timeout) { continue; }
                if (timeout.reverse) {
                } else {
                    if (timeout.isExecuting ||
                        timeout.time <= this._prevTime ||
                        timeout.time > this.time
                    )
                        continue;
                    // else:
                    timeout.isExecuting = true;
                    if (timeout.undoIsExecuting) {
                        delete timeout.undoIsExecuting;
                    }

                    try {
                        // timeout.func(this.time, this);
                        timeout.func(timeout, delta);
                    } catch (err) {
                        debug('tick execute error: ', err);
                    }

                    if (timeout.interval) {
                        delete timeout.isExecuting;
                        timeout.time += timeout.interval;
                    } else if (!timeout.persist) {
                        this.clear(timeout.id);
                    }
                }
            }
        }
        this.emit('execute', this.time, this);
    }
}

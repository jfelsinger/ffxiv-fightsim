import { EventEmitter } from 'eventemitter3';

import Debug from 'debug';
const debug = Debug('game:utils:clock');


type ClockTimeoutFunc = (time: number, clock: Clock) => void;
type ClockTimeoutEntry = {
    id: number,
    func: ClockTimeoutFunc,
    time: number,
    interval?: number,
    isExecuting?: boolean,
}

type ClockOptions = {
    startTime: number,
    scaling: number,
    duration: number,
    paused: boolean,
}

const DefaultClockOptions: ClockOptions = {
    startTime: 0,
    scaling: 1.0,
    duration: 0,
    paused: false,
} as const;

export class Clock extends EventEmitter {
    time: number;
    lastDelta: number = 0;
    #prevTime: number;
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

        this.time = opts.startTime;
        this.#prevTime = opts.startTime;
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
        this.#prevTime = this.time;
        this.time += delta;
        this.lastDelta = delta;

        if (this.duration && this.time >= this.duration) {
            this.time = this.duration;
        }
        this.emit('tick', this.time, delta, this);

        if (this.executeOnTick) {
            this.executeTick();
        }
    }

    setTime(time: number, setPrevToo = false) {
        if (this.duration) {
            time = Math.min(time, this.duration);
        }

        this.time = time;
        if (setPrevToo) {
            this.#prevTime = time;
        }
        this.emit('time-change', this.time, this);
    }

    clear(id: number) {
        // this.timeouts = this.timeouts.filter((e) => e.id != id)
        const index = this.timeouts.findIndex((e) => e.id === id)
        if (index != -1) {
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

    at(func: ClockTimeoutFunc, time: number) {
        const id = (Math.round(Math.random() * 1000) * 100000) + time + this.time;
        this.timeouts.push({
            id,
            func,
            time,
        });
        return id;
    }

    after(func: ClockTimeoutFunc, ms: number) {
        return this.at(func, this.time + ms);
    }

    intervalAt(func: ClockTimeoutFunc, interval: number, time = 0) {
        const id = (Math.round(Math.random() * 1000) * 100000) + interval + this.time;
        this.timeouts.push({
            id,
            func,
            time: time || this.time,
            interval
        });
        return id;
    }

    intervalAfter(func: ClockTimeoutFunc, interval: number, delay = 0) {
        return this.intervalAt(func, interval, this.time + delay);
    }

    executeTick() {
        const timeouts = this.timeouts.filter((e) =>
            !e.isExecuting &&
            e.time > this.#prevTime &&
            e.time <= this.time);

        this.emit('start-execute', this.time, this);
        const length = timeouts.length;
        for (let i = 0; i < length; i++) {
            const timeout = timeouts[i];
            if (timeout.isExecuting)
                continue;
            // else:
            timeout.isExecuting = true;

            try {
                timeout.func(this.time, this);
            } catch (err) {
                debug('tick execute error: ', err);
            }

            if (timeout.interval) {
                timeout.time += timeout.interval;
                timeout.isExecuting = false;
            } else {
                this.clear(timeout.id);
            }
        }
        this.emit('execute', this.time, this);
    }
}

export const DefaultMechanicSchedulingMode = 'parallel';

const { cast: castState } = useCastState();

export const enum MechanicStage {
    preInitialization = 0,
    initialized = 1,

    start = 2,
    running = 3,

    preCleanup = 4,
    ended = 5,
};

export type MechanicOptions = {
    label?: string
    name?: string
    comment?: string
    scheduling?: ScheduleMode
    effects: Scheduled<Effect>[]
    collection: FightCollection
    clock?: Clock
    duration?: number | string
    telegraph?: number | string
    usePlayerTick?: boolean

    castName?: string
    castTime?: number
}

export class Mechanic extends EventEmitter {
    n?: number;
    scheduledParent?: ScheduledParent<Mechanic>;

    name: string = 'default';
    label?: string;
    comment?: string;
    scheduling: ScheduleMode;
    effects: Scheduled<Effect>[];
    activeEffects: Scheduled<Effect>[] = [];
    collection: FightCollection;
    clock: Clock;
    isActive: boolean = false;
    usePlayerTick: boolean = false;
    options: MechanicOptions;

    stage: MechanicStage = MechanicStage.preInitialization;
    startTime: number = 0;
    cleanupTime: number = 0;
    endTime: number = 0;
    get elapsed() { return this.clock.time - this.startTime; }

    toJSON() {
        const results = getBasicValues(this.options);
        return {
            label: this.options.label,
            comment: this.options.comment,
            name: this.name,
            scheduling: this.scheduling,
            ...results,
            effects: this.effects,
        };
    }

    __cachedDuration?: number;
    getDuration() {
        if (this.__cachedDuration !== undefined) {
            return this.__cachedDuration;
        }

        let duration = 0;
        if (this.scheduling === 'sequential') {
            const len = this.effects.length;
            for (let i = 0; i < len; i++) {
                const effect = this.effects[i];
                duration += getScheduledDuration(effect, ((i) => i?.getDuration() || 0));
            }
        } else {
            duration += Math.max(
                ...this.effects.map(
                    (effect) => getScheduledDuration(effect, ((i) => i?.getDuration() || -0))
                )
            );
        }

        this.__cachedDuration = duration;
        return duration;
    }

    constructor(options: MechanicOptions) {
        super();
        this.options = options;
        this.label = options.label;
        this.comment = options.comment;
        this.effects = options.effects || [];
        this.scheduling = options.scheduling || DefaultMechanicSchedulingMode;
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        const onTickUpdate = (time: number, delta: number) => {
            this.tickUpdate(time, delta);
        };

        this.usePlayerTick = options.usePlayerTick || false;
        if (this.usePlayerTick) {
            this.collection.playerClock.on('time-change', onTickUpdate);
            this.on('dispose', () => {
                this.collection.playerClock.off('time-change', onTickUpdate);
            });
        } else {
            this.clock.on('time-change', onTickUpdate);
            this.on('dispose', () => {
                this.clock.off('time-change', onTickUpdate);
            });
        }

        const len = this.effects.length;
        for (let i = 0; i < len; i++) {
            const effect = this.effects[i];
            if (effect?.item?.options) {
                if (options.duration && !effect.item.options.duration) {
                    effect.item.setDuration(options.duration);
                }
                if (options.telegraph && !effect.item.options.duration) {
                    effect.item.setTelegraph(options.telegraph);
                }
            }

            effect.item.on('effect-hit', (data) => {
                this.emit('effect-hit', {
                    ...data,
                    mechanic: this,
                });
            });
        }

        if (options.name) {
            this.name = options.name;
        }
    }

    setStage(stage: MechanicStage) {
        const oldStage = this.stage;
        this.stage = stage;
        this.emit('stage-change', { mechanic: this, oldStage, stage });
        return oldStage;
    }

    getEffects() {
        return this.effects;
    }

    getDurationPercent(duration?: number) {
        duration = duration || this.getDuration();
        if (!duration || (!this.isActive && !this.startTime)) {
            return 0;
        }

        if (this.endTime > this.startTime) {
            return 1.0;
        }

        const elapsed = Math.min(duration, this.elapsed);
        return Math.min(1.0, Math.max(0.0, elapsed / duration));
    }

    init(n = 0, scheduledSelf: Scheduled<Mechanic>, parent?: ScheduledParent<Mechanic>, startTime?: number) {
        this.n = n;
        this.scheduledParent = parent;

        this.label = this.label || scheduledSelf.label;
        this.startTime = startTime ?? this.clock.time ?? 0;
        this.cleanupTime = this.startTime + this.getDuration() + 1;

        const effects = this.getEffects();
        this.activeEffects = effects;

        let delay = this.startTime;

        const len = effects.length;
        if (this.scheduling === 'sequential') {
            for (let i = 0; i < len; i++) {
                const effect = effects[i];
                if (effect) {
                    delay += this.initEffect(effect, delay)
                }
            }
        } else {
            for (let i = 0; i < len; i++) {
                const effect = effects[i];
                if (effect) {
                    this.initEffect(effect, delay)
                }
            }
        }

        this.setStage(MechanicStage.initialized);
    }

    initEffect(effect: Scheduled<Effect>, startTime: number) {
        if (effect?.preStartDelay) { startTime += effect.preStartDelay; }
        effect.item.on('start-effect', () => { this.emit('start-effect', { effect }) });
        effect.item.on('end-effect', () => { this.emit('end-effect', { effect }) });
        const result = traverseScheduled(
            effect,
            (item, n, st, cd, p) => {
                console.log(`Init effect ${effect.label || item.name} ${n}: `, st, effect);
                item.init(n, effect, p, st + cd);
            },
            ((i) => i?.getDuration() || 0),
            this.clock,
            0,
            startTime
        );
        return result;
    }

    run(time: number) {
        if (time >= this.startTime) {
            if (this.stage === MechanicStage.initialized) {
                return this.runStart();
            }

            if (time >= this.cleanupTime && this.stage === MechanicStage.running) {
                return this.runEnd();
            }
        }
    }

    runStart() {
        this.setStage(MechanicStage.start);
        this.isActive = true;
        this.emit('start-mechanic');
        this.setStage(MechanicStage.running);
    }

    runEnd() {
        this.setStage(MechanicStage.preCleanup);
        this.endTime = this.clock.time;
        this.isActive = false;
        console.log('End mechanic: ', this.label);
        this.emit('end-mechanic');
        this.setStage(MechanicStage.ended);
    }

    tickUpdate(time: number, delta: number) {
        this.run(time);
        if (this.isActive) {
            const durationPercent = this.getDurationPercent();
            if (this.options.castName) {
                const castPercent = this.options.castTime ? this.getDurationPercent(this.options.castTime) : durationPercent;
                if (castPercent >= 0 && castPercent < 1) {
                    if (castPercent > 0.985) {
                        castState.value = {
                            name: this.options.castName,
                            percent: 1,
                        };
                    } else {
                        castState.value = {
                            name: this.options.castName,
                            percent: castPercent,
                        };
                    }
                } else {
                    castState.value = undefined;
                }
            }

            this.emit('tick', {
                time,
                delta,
                durationPercent,
            });
        }
    }

    dispose() {
        this.isActive = false;
        this.emit('dispose');
        const len = this.effects.length;
        for (let i = 0; i < len; i++) {
            this.effects[i]?.item?.dispose();
        }
    }

    toJSONSnapshot() {
        const result = {
            n: this.n,
            name: this.name,
            label: this.label,
            scheduling: this.scheduling,
            isActive: this.isActive,
            usePlayerTick: this.usePlayerTick,
            startTime: this.startTime,
            endTime: this.endTime,
            stage: this.stage,

            // TODO: Deal with scheduledParent properly
            // scheduledParent: this.scheduledParent,

            // options: JSON.parse(JSON.stringify(this.options)),
            effects: (this.effects)?.map(s => getScheduledJSONSnapshot(s)),
            activeEffects: (this.activeEffects)?.map(s => getScheduledJSONSnapshot(s)),
        };

        return result;
    }

    loadJSONSnapshot(state: any) {
        if (!state) return;
        this.n = state.n;
        this.name = state.name;
        this.label = state.label;
        this.scheduling = state.scheduling;
        this.isActive = state.isActive;
        this.usePlayerTick = state.usePlayerTick;
        this.startTime = state.startTime;
        this.endTime = state.endTime;
        this.stage = state.stage;
        // this.options = state.options;

        // TODO: Deal with scheduledParent properly
        // this.scheduledParent = state.scheduledParent;

        this.effects.forEach((s, i) => {
            state.effects?.[i] && loadScheduledJSONSnapshot(s, state.effects[i]);
        });

        // May be unnecessary, since `activeEffects` is just a ref to the original effects array
        this.activeEffects.forEach((s, i) => {
            state.activeEffects?.[i] && loadScheduledJSONSnapshot(s, state.activeEffects[i]);
        });
    }
}

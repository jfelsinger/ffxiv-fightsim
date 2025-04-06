export const DefaultMechanicSchedulingMode = 'parallel';

const castState = useCastState();

export type MechanicOptions = {
    label?: string
    name?: string
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
    scheduling: ScheduleMode;
    effects: Scheduled<Effect>[];
    activeEffects: Scheduled<Effect>[] = [];
    collection: FightCollection;
    clock: Clock;
    isActive: boolean = false;
    usePlayerTick: boolean = false;
    options: MechanicOptions;

    toJSON() {
        const results = getBasicValues(this.options);
        return {
            label: this.options.label,
            name: this.name,
            scheduling: this.scheduling,
            ...results,
            effects: this.effects,
        };
    }

    getDuration() {
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

        return duration;
    }

    constructor(options: MechanicOptions) {
        super();
        this.options = options;
        this.label = options.label;
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

    getEffects() {
        return this.effects;
    }

    startTime: number = 0;
    endTime: number = 0;
    get elapsed() { return this.clock.time - this.startTime; }

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

    async execute(n = 0, parent?: ScheduledParent<Mechanic>) {
        this.n = n;
        this.scheduledParent = parent;

        this.isActive = true;
        this.startTime = this.clock.time;
        this.emit('start-execute');

        const effects = this.getEffects();
        this.activeEffects = effects;
        if (this.scheduling === 'sequential') {
            const len = effects.length;
            for (let i = 0; i < len; i++) {
                if (!this.isActive) break;
                await this.executeEffect(effects[i])
            }
        } else if (this.isActive) {
            await Promise.all(effects.map(effect => this.executeEffect(effect)));
        }

        this.endTime = this.clock.time;
        this.isActive = false;
        this.emit('end-execute');
    }

    tickUpdate(time: number, delta: number) {
        if (this.isActive) {
            const durationPercent = this.getDurationPercent();
            if (this.options.castName) {
                const castPercent = this.options.castTime ? this.getDurationPercent(this.options.castTime) : durationPercent;
                if (castPercent < 1) {
                    castState.value = {
                        name: this.options.castName,
                        percent: castPercent,
                    };
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

    async executeEffect(effect: Scheduled<Effect>) {
        this.emit('start-effect', { effect });
        if (effect?.preStartDelay) { await this.clock.wait(effect.preStartDelay); }
        await executeScheduled(effect, (item, n, p) => Promise.resolve(this.isActive && item.start(n, p)), this.clock)
        this.emit('end-effect', { effect });
    }

    async dispose() {
        this.isActive = false;
        this.emit('dispose');
        const len = this.effects.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push(this.effects[i]?.item?.dispose());
        }
        await Promise.all(promises);
    }
}

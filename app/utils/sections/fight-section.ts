import { Mechanic } from '../mechanics';

export const DefaultFightSectionSchedulingMode = 'sequential';

export type SectionOptions = {
    label?: string
    name?: string
    comment?: string
    scheduling?: ScheduleMode
    mechanics: Scheduled<Mechanic>[]
    collection: FightCollection
    clock?: Clock
}

export class FightSection extends EventEmitter {
    n?: number;
    scheduledParent?: ScheduledParent<FightSection>;

    name: string = 'default';
    comment?: string;
    label?: string;
    scheduling: ScheduleMode;
    mechanics: Scheduled<Mechanic>[];
    collection: FightCollection;
    clock: Clock;
    isActive: boolean = false;
    options: SectionOptions;

    totalMechanics = 0;
    endedMechanics = 0;

    toJSON() {
        const results = getBasicValues(this.options);
        return {
            label: this.options.label,
            name: this.name,
            comment: this.options.comment,
            scheduling: this.scheduling,
            mechanics: this.mechanics,
            ...results,
        };
    }

    __cachedDuration?: number;
    getDuration() {
        if (this.__cachedDuration !== undefined) {
            return this.__cachedDuration;
        }

        let duration = 0;
        if (this.scheduling === 'sequential') {
            const len = this.mechanics.length;
            for (let i = 0; i < len; i++) {
                const mechanic = this.mechanics[i];
                duration += getScheduledDuration(mechanic, ((i) => i?.getDuration() || 0));
            }
        } else {
            duration += Math.max(
                ...this.mechanics.map(
                    (mechanic) => getScheduledDuration(mechanic, ((i) => i?.getDuration() || -0))
                )
            );
        }

        this.__cachedDuration = duration;
        return duration;
    }

    constructor(options: SectionOptions) {
        super();
        this.options = options;
        this.label = options.label;
        this.comment = options.comment;
        this.mechanics = options.mechanics || [];
        this.scheduling = options.scheduling || DefaultFightSectionSchedulingMode;
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        const len = this.mechanics.length;
        for (let i = 0; i < len; i++) {
            const mechanic = this.mechanics[i];
            console.log('Setup mechanics: ', mechanic);
            forEachScheduledItem(mechanic, (item) => {
                item.on('effect-hit', (data) => {
                    this.emit('effect-hit', {
                        ...data,
                        section: this,
                    });
                });
            });
        }

        if (options.name) {
            this.name = options.name;
        }
    }

    async execute(n = 0, parent?: ScheduledParent<FightSection>) {
        return;
    }

    init(n = 0, scheduledSelf: Scheduled<FightSection>, parent?: ScheduledParent<FightSection>, startTime = 0) {
        this.n = n;
        this.scheduledParent = parent;

        this.label = this.label || scheduledSelf.label;
        startTime = startTime ?? this.clock.time ?? 0;

        this.clock.at(() => {
            this.isActive = true;
            this.emit('start-section');
        }, startTime, { persist: true });

        let delay = startTime;
        const len = this.mechanics.length;
        if (this.scheduling === 'sequential') {
            for (let i = 0; i < len; i++) {
                const mechanic = this.mechanics[i];
                if (mechanic) {
                    delay += this.initMechanic(mechanic, delay)
                }
            }
        } else {
            for (let i = 0; i < len; i++) {
                const mechanic = this.mechanics[i];
                if (mechanic) {
                    this.initMechanic(mechanic, delay)
                }
            }
        }
    }

    initMechanic(mechanic: Scheduled<Mechanic>, startTime: number) {
        if (mechanic?.preStartDelay) { startTime += mechanic.preStartDelay; }
        const result = traverseScheduled(
            mechanic,
            (item, n, st, cd, p) => {
                console.log('Init mechanic: ', n, p);
                item.init(n, mechanic, p, st + cd);
            },
            ((i) => i?.getDuration() || 0),
            this.clock,
            0,
            startTime
        );

        this.totalMechanics++;
        forEachScheduledItem(mechanic, (item) => {
            item.on('start-mechanic', () => {
                console.log('Mechanic started: ', this.label, mechanic);
                this.emit('start-mechanic', { mechanic });
            });

            item.on('end-mechanic', () => {
                this.emit('end-mechanic', { mechanic });
                this.endedMechanics++;
                if (this.endedMechanics >= this.totalMechanics) {
                    console.log('Section ended: ', this.label, this.endedMechanics);
                    this.emit('end-section');
                }
            });
        })
        return result;
    }

    dispose() {
        this.isActive = false;
        const len = this.mechanics.length;
        for (let i = 0; i < len; i++) {
            forEachScheduledItem(this.mechanics[i], (item) => {
                item?.dispose();
            });
        }
    }

    toJSONSnapshot() {
        const result = {
            n: this.n,
            name: this.name,
            label: this.label,
            scheduling: this.scheduling,
            isActive: this.isActive,

            // TODO: Deal with scheduledParent properly
            // scheduledParent: this.scheduledParent,

            // options: JSON.parse(JSON.stringify(this.options)),
            mechanics: (this.mechanics)?.map(s => getScheduledJSONSnapshot(s)),
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
        // this.options = state.options;

        // TODO: Deal with scheduledParent properly
        // this.scheduledParent = state.scheduledParent;

        this.mechanics.forEach((s, i) => {
            state.mechanics?.[i] && loadScheduledJSONSnapshot(s, state.mechanics[i]);
        });
    }
}


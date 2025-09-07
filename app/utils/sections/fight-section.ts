import { Mechanic } from '../mechanics';

export const DefaultFightSectionSchedulingMode = 'sequential';

export type SectionOptions = {
    label?: string
    name?: string
    scheduling?: ScheduleMode
    mechanics: Scheduled<Mechanic>[]
    collection: FightCollection
    clock?: Clock
}

export class FightSection extends EventEmitter {
    n?: number;
    scheduledParent?: ScheduledParent<FightSection>;

    name: string = 'default';
    label?: string;
    scheduling: ScheduleMode;
    mechanics: Scheduled<Mechanic>[];
    collection: FightCollection;
    clock: Clock;
    isActive: boolean = false;
    options: SectionOptions;

    toJSON() {
        const results = getBasicValues(this.options);
        return {
            label: this.options.label,
            name: this.name,
            scheduling: this.scheduling,
            mechanics: this.mechanics,
            ...results,
        };
    }

    getDuration() {
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

        return duration;
    }

    constructor(options: SectionOptions) {
        super();
        this.options = options;
        this.label = options.label;
        this.mechanics = options.mechanics || [];
        this.scheduling = options.scheduling || DefaultFightSectionSchedulingMode;
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;

        const len = this.mechanics.length;
        for (let i = 0; i < len; i++) {
            const mechanic = this.mechanics[i];
            mechanic.item.on('effect-hit', (data) => {
                this.emit('effect-hit', {
                    ...data,
                    section: this,
                });
            });
        }

        if (options.name) {
            this.name = options.name;
        }
    }

    async execute(n = 0, parent?: ScheduledParent<FightSection>) {
        this.n = n;
        this.scheduledParent = parent;

        this.isActive = true;
        this.emit('start-execute');

        if (this.scheduling === 'sequential') {
            const len = this.mechanics.length;
            for (let i = 0; i < len; i++) {
                if (!this.isActive) break;
                await this.executeMechanic(this.mechanics[i])
            }
        } else if (this.isActive) {
            await Promise.all(this.mechanics.map(m => this.executeMechanic(m)));
        }

        this.isActive = false;
        this.emit('end-execute');
    }

    async executeMechanic(mechanic: Scheduled<Mechanic>) {
        this.emit('start-mechanic', { mechanic });
        if (mechanic?.preStartDelay) { await this.clock.wait(mechanic.preStartDelay); }
        await executeScheduled(mechanic, (item, n, p) => Promise.resolve(this.isActive && item.execute(n, p)), this.clock)
        this.emit('end-mechanic', { mechanic });
    }

    dispose() {
        this.isActive = false;
        const len = this.mechanics.length;
        for (let i = 0; i < len; i++) {
            this.mechanics[i]?.item?.dispose();
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

            options: JSON.parse(JSON.stringify(this.options)),
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
        this.options = state.options;

        // TODO: Deal with scheduledParent properly
        // this.scheduledParent = state.scheduledParent;

        this.mechanics.forEach((s, i) => {
            state.mechanics?.[i] && loadScheduledJSONSnapshot(s, state.mechanics[i]);
        });
    }
}


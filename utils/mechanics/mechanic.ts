import { EventEmitter } from 'eventemitter3';
import { Clock } from '../clock';

import {
    type ScheduleMode,
    type Scheduled,
    getScheduledDuration,
    executeScheduled,
} from '../scheduled';
import { Effect } from '../effects';
import { FightCollection } from '../fight-collection';
import { getBasicValues } from '../decode-fight';

export const DefaultMechanicSchedulingMode = 'parallel';

export type MechanicOptions = {
    label?: string
    name?: string
    scheduling?: ScheduleMode
    effects: Scheduled<Effect>[]
    collection: FightCollection
    clock?: Clock
}

export class Mechanic extends EventEmitter {
    name: string = 'default';
    label?: string
    scheduling: ScheduleMode;
    effects: Scheduled<Effect>[];
    activeEffects: Scheduled<Effect>[] = [];
    collection: FightCollection;
    clock: Clock;
    isActive: boolean = false;
    options: MechanicOptions;

    toJSON() {
        const results = getBasicValues(this.options);
        return {
            label: this.options.label,
            name: this.name,
            scheduling: this.scheduling,
            effects: this.effects,
            ...results,
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

        const len = this.effects.length;
        for (let i = 0; i < len; i++) {
            const effect = this.effects[i];
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

    async execute() {
        this.isActive = true;
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

        this.isActive = false;
        this.emit('end-execute');
    }

    async executeEffect(effect: Scheduled<Effect>) {
        this.emit('start-effect', { effect });
        if (effect?.preStartDelay) { await this.clock.wait(effect.preStartDelay); }
        await executeScheduled(effect, (item) => Promise.resolve(this.isActive && item.start()), this.clock)
        this.emit('end-effect', { effect });
    }

    async dispose() {
        this.isActive = false;
        const len = this.effects.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push(this.effects[i]?.item?.dispose());
        }
        await Promise.all(promises);
    }
}

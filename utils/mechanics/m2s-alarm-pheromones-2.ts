import * as Bab from '@babylonjs/core';
import {
    type Scheduled,
} from '../scheduled';
import { Effect } from '../effects';

export const DefaultMechanicSchedulingMode = 'parallel';

import {
    Mechanic,
    type MechanicOptions,
} from './';

export type M2SAlarmPheromones2Options = MechanicOptions & {
};

export class M2SAlarmPheromones2 extends Mechanic {
    override name = 'm2s-alarm-pheromones-2';
    override options: M2SAlarmPheromones2Options;

    constructor(options: M2SAlarmPheromones2Options) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        const effectShowTelegraph = (effect: Scheduled<Effect>) => {
            console.log('alarm pheromones, bee - telegraph: ', effect);
        };

        const effectPreSnapshot = (effect: Scheduled<Effect>) => {
            console.log('alarm pheromones, bee - snapshot: ', effect);
        };

        this.on('start-execute', () => {
        });

        this.on('start-effect', ({ effect }) => {
            effect.item.on('show-telegraph', effectShowTelegraph);
            effect.item.on('pre-snapshot', effectPreSnapshot);
        });

        this.on('end-effect', ({ effect }) => {
            effect.item.off('show-telegraph', effectShowTelegraph);
            effect.item.off('pre-snapshot', effectPreSnapshot);
        });

        this.on('dispose', () => {
        });
    }

    override getEffects(): Scheduled<Effect>[] {
        const allEffects = this.effects;
        const rotationIncrement = 22.5;
        const startRotation = rotationIncrement * Math.round(Math.random() * 15);
        const direction = Math.round(Math.random()) ? 'cw' : 'ccw';

        allEffects.forEach((effect, i) => {
            if (direction === 'cw') {
                const rotation = startRotation + rotationIncrement * i;
                effect.item.options.rotation = rotation;
            } else if (direction === 'ccw') {
                const rotation = startRotation - rotationIncrement * i;
                effect.item.options.rotation = rotation;
            }
        });

        return allEffects;
    }
}

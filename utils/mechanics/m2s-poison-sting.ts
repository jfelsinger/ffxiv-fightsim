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

export type M2SPoisonStingOptions = MechanicOptions & {
};


export class M2SPoisonSting extends Mechanic {
    override name = 'm2s-poison-sting';
    override options: M2SPoisonStingOptions;

    constructor(options: M2SPoisonStingOptions) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        (window as any).__mechanic = this;

        const effectShowTelegraph = (effect: Scheduled<Effect>) => {
        };

        const effectPreSnapshot = (effect: Scheduled<Effect>) => {
        };

        this.on('start-execute', () => {
        });

        this.on('start-effect', ({ effect }) => {
            effect.item.on('start', () => {
                console.log('Start Poison Sting: ', effect);
            });
            effect.item.on('end', () => {
                console.log('End Poison Sting: ', effect);
            });
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

    // override getEffects(): Scheduled<Effect>[] {
    // }
}

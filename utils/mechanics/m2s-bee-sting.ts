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

export type M2SBeeStingOptions = MechanicOptions & {
};


export class M2SBeeSting extends Mechanic {
    override name = 'm2s-bee-sting';
    override options: M2SBeeStingOptions;

    constructor(options: M2SBeeStingOptions) {
        console.log('BEE STING: ', options);

        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        const effectShowTelegraph = (effect: Scheduled<Effect>) => {
            console.log('show effect: ', effect);
        };

        const effectPreSnapshot = (effect: Scheduled<Effect>) => {
            console.log('pre-snapshot: ', effect);
        };

        this.on('start-execute', () => {
        });

        this.on('start-effect', ({ effect }) => {
            effect.item.once('show-telegraph', effectShowTelegraph);
            effect.item.once('pre-snapshot', effectPreSnapshot);
        });

        this.on('end-effect', ({ effect }) => {
        });

        this.on('dispose', () => {
        });
    }

    // override getEffects(): Scheduled<Effect>[] {
    // }
}

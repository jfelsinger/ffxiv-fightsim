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
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        const effectShowTelegraph = (effect: Scheduled<Effect>) => {
        };

        const effectPreSnapshot = (effect: Scheduled<Effect>) => {
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

    // override getEffects(): Scheduled<Effect>[] {
    // }
}

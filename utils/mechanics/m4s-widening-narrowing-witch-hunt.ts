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

export type WitchHuntType = 'narrowing' | 'widening';

export type M4SWideningNarrowingWitchHuntOptions = MechanicOptions & {
    huntType?: WitchHuntType
}

export class M4SWideningNarrowingWitchHunt extends Mechanic {
    override name = 'm4s-widening-narrowing-witch-hunt';
    override options: M4SWideningNarrowingWitchHuntOptions;
    particles?: Bab.ParticleSystem;

    constructor(options: M4SWideningNarrowingWitchHuntOptions) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        const huntType = useState<WitchHuntType>('m4s-wnwh-type', () => Math.round(Math.random()) ? 'widening' : 'narrowing');

        this.on('start-execute', () => {
            huntType.value = Math.round(Math.random()) ? 'widening' : 'narrowing';
            if (huntType.value === 'widening') {
                this.options.castName = 'Widening Witch Hunt';
            } else {
                this.options.castName = 'Narrowing Witch Hunt';
            }

            const hit1 = this.effects.find((m) => m.label === 'inner-outer-1');
            if (hit1) {
                if (huntType.value === 'widening') {
                    hit1.item.innerRadius = 0;
                    hit1.item.outerRadius = 12.925;
                } else {
                    hit1.item.innerRadius = 12.925;
                    hit1.item.outerRadius = 60;
                }
            }
            const hit2 = this.effects.find((m) => m.label === 'inner-outer-2');
            if (hit2) {
                if (huntType.value === 'widening') {
                    hit2.item.innerRadius = 12.925;
                    hit2.item.outerRadius = 60;
                } else {
                    hit2.item.innerRadius = 0;
                    hit2.item.outerRadius = 12.925;
                }
            }
            const hit3 = this.effects.find((m) => m.label === 'inner-outer-3');
            if (hit3) {
                if (huntType.value === 'widening') {
                    hit3.item.innerRadius = 0;
                    hit3.item.outerRadius = 12.925;
                } else {
                    hit3.item.innerRadius = 12.925;
                    hit3.item.outerRadius = 60;
                }
            }
            const hit4 = this.effects.find((m) => m.label === 'inner-outer-4');
            if (hit4) {
                if (huntType.value === 'widening') {
                    hit4.item.innerRadius = 12.925;
                    hit4.item.outerRadius = 60;
                } else {
                    hit4.item.innerRadius = 0;
                    hit4.item.outerRadius = 12.925;
                }
            }
        });
    }
}

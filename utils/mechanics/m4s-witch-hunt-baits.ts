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
import { moveEmitHelpers } from 'typescript';
import { Babylon } from '#build/components';

export type BaitType = 'near' | 'far';
export type BaitList = [BaitType, BaitType, BaitType, BaitType];
export type M4SWitchHuntBaitsOptions = MechanicOptions & {
    startBait?: BaitType
}

export class M4SWitchHuntBaits extends Mechanic {
    override name = 'm4s-witch-hunt-baits';
    override options: M4SWitchHuntBaitsOptions;
    particles?: Bab.ParticleSystem;

    constructor(options: M4SWitchHuntBaitsOptions) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        const startBait = useState<BaitType>('m4s-wnwh-start-bait', () => Math.round(Math.random()) ? 'near' : 'far');

        this.on('start-execute', () => {
            startBait.value = Math.round(Math.random()) ? 'near' : 'far';

            const hit1 = this.effects.find((m) => m.label === 'bait-1');
            const hit2 = this.effects.find((m) => m.label === 'bait-2');
            const hit3 = this.effects.find((m) => m.label === 'bait-3');
            const hit4 = this.effects.find((m) => m.label === 'bait-4');

            console.log('BAITS BAITS BAITS: ', startBait.value, [
                hit1, hit2, hit3, hit4
            ]);
        });
    }
}

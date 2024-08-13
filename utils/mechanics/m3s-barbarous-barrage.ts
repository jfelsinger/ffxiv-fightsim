import { getPosition } from '../positioning';

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

export type M3SBarbarousBarrageOptions = MechanicOptions & {
};


export class M3SBarbarousBarrage extends Mechanic {
    override name = 'm3s-barbarous-barrage';
    override options: M3SBarbarousBarrageOptions;

    constructor(options: M3SBarbarousBarrageOptions) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        (window as any).__mechanic = this;

        // const effectShowTelegraph = (effect: Scheduled<Effect>) => {
        // };

        // const effectPreSnapshot = (effect: Scheduled<Effect>) => {
        // };

        this.on('start-execute', () => {
            if (Math.round(Math.random())) {
                const m1 = this.effects.find(e => e.label === 'kb-tower-m1');
                const m2 = this.effects.find(e => e.label === 'kb-tower-m2');
                if (m1 && m2) {
                    console.log('set middle kbs horizontal: ', m1, m2);
                    m1.item.options.position = '0,0.5';
                    m1.item.position = '0,0.5';
                    m2.item.options.position = '0,-0.5';
                    m2.item.position = '0,-0.5';
                }
            }

            this.clock.after(() => {
                const boss = this.collection.getMeshByName('boss-marker');
                console.log('MECHANIC:', this, boss);
                const positions = [
                    '-0.55,-0.55',
                    '0.55,-0.55',
                    '-0.55,0.55',
                    '0.55,0.55',
                ];
                if (boss) {
                    boss.position = getPosition(
                        positions[Math.round(Math.random() * (positions.length - 1))],
                        'arena',
                        this.collection,
                    );
                }
            }, 3700 + 1750 + 9000 - 200);
        });

        // this.on('start-effect', ({ effect }) => {
        // });

        // this.on('end-effect', ({ effect }) => {
        // });

        // this.on('dispose', () => {
        // });
    }

    // override getEffects(): Scheduled<Effect>[] {
    // }
}

import * as Bab from '@babylonjs/core';
import { yalmsToM } from '../conversions';
import createMarkerMat from '../../materials/enemy-marker';
import { Boss } from '../boss';
import { getPosition } from '../positioning';

import {
    Fight,
    type FightOptions,
} from './';

export type M3SFightOptions = FightOptions & {
};

export class M3SFight extends Fight {
    options: M3SFightOptions;
    boss: Boss;

    constructor(options: M3SFightOptions) {
        super(options);
        this.options = options;

        this.on('start-execute', () => {
            const bossSize = yalmsToM(5.25);
            const height = bossSize * 2.75;
            const width = height * 0.655;

            const boss = new Boss('Discount Akuma', {
                size: 5.5,
                width,
                height,
                image: '/images/fights/m3s/boss.webp',
            }, this.collection);
            boss.body.position.y = bossSize * 1.125;
            this.boss = boss;
        });
    }

    async dispose() {
        this.boss?.dispose();
        await super.dispose();
    }
}

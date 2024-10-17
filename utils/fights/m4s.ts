import * as Bab from '@babylonjs/core';
import { yalmsToM } from '../conversions';
import createMarkerMat from '../../materials/enemy-marker';
import { Boss } from '../boss';
import { getPosition } from '../positioning';

import {
    Fight,
    type FightOptions,
} from './';

export type M4SFightOptions = FightOptions & {
};

export class M4SFight extends Fight {
    options: M4SFightOptions;
    boss: Boss;

    constructor(options: M4SFightOptions) {
        super(options);
        this.options = options;

        this.on('start-execute', () => {
            const bossSize = yalmsToM(5.25);
            const height = bossSize * 2.525;
            const width = height * 0.879433;

            const boss = new Boss('Wicked Thunder', {
                size: 6.65,
                width,
                height,
                image: '/images/fights/m4s/boss.png',
            }, this.collection);
            boss.body.position.y = bossSize * 1.12;
            // boss.position.z = 12;
            this.boss = boss;
        });
    }

    async dispose() {
        this.boss?.dispose();
        await super.dispose();
    }
}

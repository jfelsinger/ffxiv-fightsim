import * as Bab from '@babylonjs/core';
import { yalmsToM } from '../conversions';
import createMarkerMat from '../../materials/enemy-marker';
import { Boss } from '../boss';
import { Character } from '../character';
import { getPosition } from '../positioning';
import { addTag } from '../meta-helpers';
import { isWithinRadius } from '../vector-helpers';
import { yalmsToM } from '../conversions';
import { Indicator } from '../indicator';

import { useTutorialMode } from '../../composables/tutorialMode';

import {
    M4SFight,
    type M4SFightOptions,
} from './m4s';

export type M4STutorialFightOptions = M4SFightOptions & {
};

export class M4STutorialFight extends M4SFight {
    override options: M4STutorialFightOptions;
    indicator?: Indicator;
    activeStep: string = 'none';

    constructor(options: M4STutorialFightOptions) {
        super(options);
        this.options = options;

        const { isTutorial, showTutorialStep, canContinueTutorial } = useTutorialMode();

        this.on('start-section', () => {
        });

        this.on('start-execute', () => {
            let player = this.collection.characters['player'];
            const { npcs } = this.collection.setupStandardParty();
            npcs.forEach((npc) => this.setupNpc(npc));
            if (player) {
                this.setupPositionCheck(player);
            }

            const size = 0.7;

            const mi = (position: string, isRed?: boolean) => {
                return new Indicator({
                    size,
                    ...(isRed ? {
                        color: Bab.Color3.Red(),
                    } : {}),
                    position,
                    positionType: 'arena',
                }, this.collection);
            };

            // DN positions
            const m1Inner1 = mi('-.2625,0');
            const m1Inner2 = mi('-.1925,0', true);
            const m1Outer1 = mi('-.615,0');
            const m1Outer2 = mi('-.53,0', true);

            const m2Inner1 = mi('.2625,0');
            const m2Inner2 = mi('.1925,0', true);
            const m2Outer1 = mi('.615,0');
            const m2Outer2 = mi('.53,0', true);

            const mtInner1 = mi('0,.1925');
            const mtInner2 = mi('0,.2625', true);
            const mtOuter1 = mi('0,.53');
            const mtOuter2 = mi('0,.615', true);

            const otInner1 = mi('0,-.1925');
            const otInner2 = mi('0,-.2625', true);
            const otOuter1 = mi('0,-.53');
            const otOuter2 = mi('0,-.615', true);

            const h1Inner1 = mi('-.337,-.337');
            const h1Inner2 = mi('-.312,-.312', true);
            const h1Outer1 = mi('-.5,-.5');
            const h1Outer2 = mi('-.476,-.476', true);

            const h2Inner1 = mi('.337,-.337');
            const h2Inner2 = mi('.312,-.312', true);
            const h2Outer1 = mi('.5,-.5');
            const h2Outer2 = mi('.476,-.476', true);

            const r1Inner1 = mi('-.337,.337', true);
            const r1Inner2 = mi('-.312,.312');
            const r1Outer1 = mi('-.5,.5', true);
            const r1Outer2 = mi('-.476,.476');

            const r2Inner1 = mi('.337,.337', true);
            const r2Inner2 = mi('.312,.312');
            const r2Outer1 = mi('.5,.5', true);
            const r2Outer2 = mi('.476,.476');
        });
    }

    setupPositionCheck(player: Character) {
        let isInPosition = false;
        let key: any;

        const checkPositionTick = () => {
            if (this.indicator?.playerIsInPosition(player)) {
                if (!isInPosition) {
                    console.log('getting in position...');
                    isInPosition = true;
                    key = setTimeout(() => {
                        this.emit('in-position');
                        console.log('WE\'RE IN POSITION!');
                    }, 500);
                }
            } else {
                isInPosition = false;
                clearTimeout(key);
            }
        };

        this.collection.playerClock.on('tick', checkPositionTick);
        this.on('dispose', () => {
            this.collection.playerClock.off('tick', checkPositionTick);
        });
    }

    setupNpc(npc: Character) {
        // Position the NPC...
        // npc.position = getPosition(
        //     getRandPosition(),
        //     'arena',
        //     this.collection
        // );

        const onTick = () => {
            if (this.activeStep === 'alarm-pheromones') {
            } else if (this.activeStep?.startsWith('poison-sting')) {
            } else if (this.activeStep === ('bee-sting')) {
            } else {
                npc.steering.idle()
            }

            npc.steering.lookWhereGoing(true);
            npc.steering.animate();
        };

        this.collection.worldClock.on('tick', onTick);
        this.on('dispose', () => {
            this.collection.worldClock.off('tick', onTick);
            npc.dispose();
        });
    }
}

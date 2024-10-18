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

const positions = {
    inner: [{
        m1: '-.2625,0',
        m2: '.2625,0',
        mt: '0,.1925',
        ot: '0,-.1925',
        h1: '-.337,-.337',
        h2: '.337,-.337',
        r1: '-.312,.312',
        r2: '.312,.312',
    }, {
        m1: '-.1925,0',
        m2: '.1925,0',
        mt: '0,.2625',
        ot: '0,-.2625',
        h1: '-.312,-.312',
        h2: '.312,-.312',
        r1: '-.337,.337',
        r2: '.337,.337',
    }],

    outer: [{
        m1: '-.615,0',
        m2: '.615,0',
        mt: '0,.53',
        ot: '0,-.53',
        h1: '-.5,-.5',
        h2: '.5,-.5',
        r1: '-.476,.476',
        r2: '.476,.476',
    }, {
        m1: '-.53,0',
        m2: '.53,0',
        mt: '0,.615',
        ot: '0,-.615',
        h1: '-.476,-.476',
        h2: '.476,-.476',
        r1: '-.5,.5',
        r2: '.5,.5',
    }],
} as const;

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
            const { role: playerRole } = useRole();
            const { npcs } = this.collection.setupStandardParty();
            npcs.forEach((npc) => this.setupNpc(npc));
            if (player) {
                this.setupPositionCheck(player);
            }

            const size = 0.5;

            const mi = (position: string, isRed?: boolean) => {
                const indicator = new Indicator({
                    size,
                    ...(isRed ? {
                        color: Bab.Color3.Red(),
                    } : {}),
                    position,
                    positionType: 'arena',
                }, this.collection);
                this.on('dispose', () => indicator.dispose());
                return indicator;
            };

            // DN positions
            for (const prop in positions) {
                positions[prop].forEach((el, i) => {
                    console.log('els: ', el, i);
                    for (const role in el) {
                        if (role === playerRole.value) {
                            mi(el[role], i === 1);
                        }
                    }
                });
            }
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

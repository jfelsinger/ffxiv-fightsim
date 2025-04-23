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

        const size = 0.5;

        const mi = (position: string, isRed?: boolean) => {
            const indicator = new Indicator({
                size,
                ...(isRed ? {
                    color: new Bab.Color3(0.1450980392156863, 0.8196078431372549, 0.9450980392156862),
                } : {
                    color: new Bab.Color3(1, 1, 0.09803921568627451),
                }),
                position,
                positionType: 'arena',
            }, this.collection);
            this.on('dispose', () => indicator.dispose());
            return indicator;
        };

        const { role: playerRole } = useRole();
        const { hits, hitsRecord, recordHits } = useHits();

        this.on('end-execute', () => {
            if (hits.value === 0) {
                recordHits();
            }

            console.log('HITS: ', hitsRecord.value);
        });

        this.on('start-execute', () => {
            let player = this.collection.characters['player'];
            const { npcs } = this.collection.setupStandardParty();
            npcs.forEach((npc) => this.setupNpc(npc));
            if (player) {
                this.setupPositionCheck(player);
            }

            // DN positions
            // for (const prop in positions) {
            //     positions[prop].forEach((el, i) => {
            //         console.log('els: ', el, i);
            //         for (const role in el) {
            //             if (role === playerRole.value) {
            //                 mi(el[role], i === 1);
            //             }
            //         }
            //     });
            // }
        });

        this.on('start-section', ({ section }) => {

            section.item.on('start-mechanic', ({ mechanic }) => {

                mechanic.item.on('start-effect', ({ effect }) => {
                    let player = this.collection.characters['player'];
                    const huntType = useState<WitchHuntType>('m4s-wnwh-type', () => Math.round(Math.random()) ? 'widening' : 'narrowing');
                    if (effect.label === 'inner-outer-1') {
                        effect.item.on('start', () => {
                            if (huntType.value === 'widening') {
                                this.activeStep = 'outer-1';
                                const position = positions.outer[0][playerRole.value];
                                const stepIndicator = mi(position, false);
                                this.indicator = stepIndicator;
                                effect.item.on('snapshot', () => {
                                    if (!stepIndicator?.playerIsInPosition(player)) {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Red();
                                        hits.value++;
                                    } else {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Green();
                                    }
                                })
                            } else {
                                this.activeStep = 'inner-1';
                                const position = positions.inner[0][playerRole.value];
                                const stepIndicator = mi(position, false);
                                this.indicator = stepIndicator;
                                effect.item.on('snapshot', () => {
                                    if (!stepIndicator?.playerIsInPosition(player)) {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Red();
                                        hits.value++;
                                    } else {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Green();
                                    }
                                })
                            }
                        });
                    } else if (effect.label === 'inner-outer-2') {
                        effect.item.on('start', () => {
                            if (huntType.value === 'widening') {
                                this.activeStep = 'inner-1';
                                const position = positions.inner[0][playerRole.value];
                                const stepIndicator = mi(position, false);
                                this.indicator = stepIndicator;
                                effect.item.on('snapshot', () => {
                                    if (!stepIndicator?.playerIsInPosition(player)) {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Red();
                                        hits.value++;
                                    } else {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Green();
                                    }
                                })
                            } else {
                                this.activeStep = 'outer-1';
                                const position = positions.outer[0][playerRole.value];
                                const stepIndicator = mi(position, false);
                                this.indicator = stepIndicator;
                                effect.item.on('snapshot', () => {
                                    if (!stepIndicator?.playerIsInPosition(player)) {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Red();
                                        hits.value++;
                                    } else {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Green();
                                    }
                                })
                            }
                        });
                    } else if (effect.label === 'inner-outer-3') {
                        effect.item.on('start', () => {
                            if (huntType.value === 'widening') {
                                this.activeStep = 'outer-2';
                                const position = positions.outer[1][playerRole.value];
                                const stepIndicator = mi(position, true);
                                this.indicator = stepIndicator;
                                effect.item.on('snapshot', () => {
                                    if (!stepIndicator?.playerIsInPosition(player)) {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Red();
                                        hits.value++;
                                    } else {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Green();
                                    }
                                })
                            } else {
                                this.activeStep = 'inner-2';
                                const position = positions.inner[1][playerRole.value];
                                const stepIndicator = mi(position, true);
                                this.indicator = stepIndicator;
                                effect.item.on('snapshot', () => {
                                    if (!stepIndicator?.playerIsInPosition(player)) {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Red();
                                        hits.value++;
                                    } else {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Green();
                                    }
                                })
                            }
                        });
                    } else if (effect.label === 'inner-outer-4') {
                        effect.item.on('start', () => {
                            if (huntType.value === 'widening') {
                                this.activeStep = 'inner-2';
                                const position = positions.inner[1][playerRole.value];
                                const stepIndicator = mi(position, true);
                                this.indicator = stepIndicator;
                                effect.item.on('snapshot', () => {
                                    if (!stepIndicator?.playerIsInPosition(player)) {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Red();
                                        hits.value++;
                                    } else {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Green();
                                    }
                                })
                            } else {
                                this.activeStep = 'outer-2';
                                const position = positions.outer[1][playerRole.value];
                                const stepIndicator = mi(position, true);
                                this.indicator = stepIndicator;
                                effect.item.on('snapshot', () => {
                                    if (!stepIndicator?.playerIsInPosition(player)) {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Red();
                                        hits.value++;
                                    } else {
                                        stepIndicator.material.diffuseColor = Bab.Color3.Green();
                                    }
                                })
                            }
                        });
                    }
                });
            });
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

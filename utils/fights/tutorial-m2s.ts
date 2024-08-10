import * as Bab from '@babylonjs/core';
import { Character } from '../character';
import { getPosition } from '../positioning';
import { shuffleArray } from '../array-shuffle';
import { rotateArray } from '../array-rotate';
import { isWithinRadius } from '../vector-helpers';
import { yalmsToM } from '../conversions';
import { Indicator } from '../indicator';

import { useTutorialMode } from '../../composables/tutorialMode';

import {
    M2SFight,
    type M2SFightOptions,
} from './m2s';

export type M2STutorialOptions = M2SFightOptions & {
};

function r(a: number, x: number, y: number) {
    a *= 0.0174533;
    const cs = Math.cos(a);
    const sn = Math.sin(a);
    return {
        x: Math.round((x * cs - y * sn) * 10000) / 10000,
        y: Math.round((x * sn + y * cs) * 10000) / 10000,
    };
}

function getRotationPosition(startRotation: number, step: 1 | 2 | 3 | 4, isCW: boolean, isDps: boolean) {
    let pos = isDps ? { x: 0.725, y: 0 } : { x: -0.725, y: 0 };

    if (startRotation) {
        if (isCW) {
            if (startRotation % 67.5 === 0) {
                pos = r(-67.5, pos.x, pos.y);
            } else if (startRotation % 45 === 0) {
                pos = r(-45, pos.x, pos.y);
            } else if (startRotation % 22.5 === 0) {
                pos = r(-22.5, pos.x, pos.y);
            }
        } else {
            if (startRotation % 67.5 === 0) {
                pos = r(67.5, pos.x, pos.y);
            } else if (startRotation % 45 === 0) {
                pos = r(45, pos.x, pos.y);
            } else if (startRotation % 22.5 === 0) {
                pos = r(22.5, pos.x, pos.y);
            }
        }
    }

    if (step > 1) {
        // Do a 11.25 cw/ccw adjustment

        // if (isCW) {
        //     pos = r(11.25, pos.x, pos.y);
        // } else {
        //     pos = r(-11.25, pos.x, pos.y);
        // }
    }

    console.log('getRotationPosition: ', isDps, isCW,
        r(22.5 * (step - 1), pos.x, pos.y),
        r(-22.5 * (step - 1), pos.x, pos.y)
    );

    if (isCW) {
        pos = r(22.5 * (step - 1), pos.x, pos.y);
    } else {
        pos = r(-22.5 * (step - 1), pos.x, pos.y);
        pos.y *= -1;
    }

    const result = `${pos.x},${pos.y}`;
    console.log('getRotationPosition: ', startRotation, step, isCW, isDps, result);

    return result;
}


export class M2STutorial extends M2SFight {
    options: M2STutorialOptions;
    indicator?: Indicator;
    activeStep: string = 'none';
    pheromonesMechanic: any;


    constructor(options: M2STutorialOptions) {
        super(options);
        this.options = options;

        const tutorialStep1Time = 500 + 1000; // drops/plash of venom
        const tutorialStep2Time = (500 + 2400 + 4700) + 100; // 100ms into alarm pheromones cast
        let tutorialStep3Time = (500 + 2400 + 4700) + 6150 + 100; // 100ms into poison sting cast

        const { isTutorial, showTutorialStep, canContinueTutorial } = useTutorialMode();

        this.on('start-section', ({ section }) => {
            if (section?.item?.name === 'm2s-x-of-venom') {
                this.clock.after(() => {
                    canContinueTutorial.value = true;
                    showTutorialStep(1);
                }, 2500);
            } else if (section?.item?.name === 'm2s-alarm-pheromones-2') {

                (window as any).__section = section;
                const pheromonesMechanic = section.item.mechanics.find((sm) => sm?.item?.name === 'm2s-alarm-pheromones-2')?.item;
                this.pheromonesMechanic = pheromonesMechanic;
                console.log('PHERO MECH: ', pheromonesMechanic);

                this.activeStep = 'alarm-pheromones';
                this.clock.after(() => {
                    canContinueTutorial.value = false;
                    showTutorialStep(2);

                    this.once('in-position', () => {
                        canContinueTutorial.value = true;
                        if (this.clock.isPaused) {
                            this.clock.once('start', () => {
                                this.indicator?.dispose();
                            });
                        } else {
                            this.indicator?.dispose();
                        }
                    });

                    let player = this.collection.characters['player'];
                    if (player?.tags?.has('support')) {
                        this.indicator = new Indicator({
                            position: '-0.05,0.1',
                            positionType: 'arena',
                        }, this.collection);
                    } else {
                        this.indicator = new Indicator({
                            position: '0.05,-0.1',
                            positionType: 'arena',
                        }, this.collection);
                    }
                }, 1000);

                section.item.on('start-mechanic', ({ mechanic }) => {
                    console.log('=======> start-mechanic: ', mechanic?.item);
                    if (mechanic?.item?.name === 'm2s-poison-sting') {
                        mechanic.item.once('start-execute', () => {
                            console.log('Start poision sting!', mechanic);
                            this.activeStep = 'poison-sting';
                        });

                        mechanic.item.on('start-effect', ({ effect }) => {
                            effect.item.once('start', () => {
                                if (effect.label === 'sting-1') {
                                    this.activeStep = 'poison-sting-1';
                                    console.log('Poison Sting 1');
                                    this.clock.after(() => {
                                        showTutorialStep(3);
                                        let player = this.collection.characters['player'];
                                        if (player?.tags?.has('support-1') || player?.tags?.has('dps-1')) {
                                            canContinueTutorial.value = false;
                                            this.indicator = new Indicator({
                                                position: getRotationPosition(this.pheromonesMechanic.startRotation, 1, this.pheromonesMechanic.rotationDirection === 'cw', player?.tags?.has('dps')),
                                                positionType: 'arena',
                                            }, this.collection);
                                            this.once('in-position', () => {
                                                canContinueTutorial.value = true;
                                                if (this.clock.isPaused) {
                                                    this.clock.once('start', () => {
                                                        this.indicator?.dispose();
                                                    });
                                                } else {
                                                    this.indicator?.dispose();
                                                }
                                            });
                                        }
                                    }, 2100);

                                } else if (effect.label === 'sting-2') {
                                    console.log('Poison Sting 2');
                                    this.clock.after(() => {
                                        this.activeStep = 'poison-sting-2';
                                    }, 1200);
                                    this.clock.after(() => {
                                        let player = this.collection.characters['player'];
                                        if (player?.tags?.has('support-2') || player?.tags?.has('dps-2')) {
                                            showTutorialStep(3);
                                            canContinueTutorial.value = false;
                                            this.indicator = new Indicator({
                                                position: getRotationPosition(this.pheromonesMechanic.startRotation, 2, this.pheromonesMechanic.rotationDirection === 'cw', player?.tags?.has('dps')),
                                                positionType: 'arena',
                                            }, this.collection);
                                            this.once('in-position', () => {
                                                canContinueTutorial.value = true;
                                                if (this.clock.isPaused) {
                                                    this.clock.once('start', () => {
                                                        this.indicator?.dispose();
                                                    });
                                                } else {
                                                    this.indicator?.dispose();
                                                }
                                            });
                                        }
                                    }, 2100);

                                } else if (effect.label === 'sting-3') {
                                    console.log('Poison Sting 3');
                                    this.clock.after(() => {
                                        this.activeStep = 'poison-sting-3';
                                    }, 1200);
                                    this.clock.after(() => {
                                        let player = this.collection.characters['player'];
                                        if (player?.tags?.has('support-3') || player?.tags?.has('dps-3')) {
                                            showTutorialStep(3);
                                            canContinueTutorial.value = false;
                                            this.indicator = new Indicator({
                                                position: getRotationPosition(this.pheromonesMechanic.startRotation, 3, this.pheromonesMechanic.rotationDirection === 'cw', player?.tags?.has('dps')),
                                                positionType: 'arena',
                                            }, this.collection);
                                            this.once('in-position', () => {
                                                canContinueTutorial.value = true;
                                                if (this.clock.isPaused) {
                                                    this.clock.once('start', () => {
                                                        this.indicator?.dispose();
                                                    });
                                                } else {
                                                    this.indicator?.dispose();
                                                }
                                            });
                                        }
                                    }, 2100);

                                } else if (effect.label === 'sting-4') {
                                    console.log('Poison Sting 4');
                                    this.clock.after(() => {
                                        this.activeStep = 'poison-sting-4';
                                    }, 1200);
                                    this.clock.after(() => {
                                        this.activeStep = 'poison-sting-next';
                                    }, 6200);
                                    this.clock.after(() => {
                                        let player = this.collection.characters['player'];
                                        if (player?.tags?.has('support-4') || player?.tags?.has('dps-4')) {
                                            showTutorialStep(3);
                                            canContinueTutorial.value = false;
                                            this.indicator = new Indicator({
                                                position: getRotationPosition(this.pheromonesMechanic.startRotation, 4, this.pheromonesMechanic.rotationDirection === 'cw', player?.tags?.has('dps')),
                                                positionType: 'arena',
                                            }, this.collection);
                                            this.once('in-position', () => {
                                                canContinueTutorial.value = true;
                                                if (this.clock.isPaused) {
                                                    this.clock.once('start', () => {
                                                        this.indicator?.dispose();
                                                    });
                                                } else {
                                                    this.indicator?.dispose();
                                                }
                                            });
                                        }
                                    }, 2100);
                                }
                            });
                        });
                    };
                });
            }
        });

        this.on('start-execute', () => {

            const roles = shuffleArray([
                'tank',
                'tank',
                'healer',
                'healer',
                'dps',
                'dps',
                'dps',
                'dps',
            ]);

            let dpsCount = 1;
            let supportCount = 1;
            const makeNpc = (name: string, position: string, role: string) => {
                let color = Bab.Color3.FromHexString('#e9c8aa');
                let specular = Bab.Color3.FromHexString('#e9c8aa');

                if (role === 'tank') {
                    color = Bab.Color3.FromHexString('#889aef');
                    specular = Bab.Color3.FromHexString('#465ece');
                } else if (role === 'healer') {
                    color = Bab.Color3.FromHexString('#a2cc96');
                    specular = Bab.Color3.FromHexString('477938');
                } else if (role === 'dps') {
                    color = Bab.Color3.FromHexString('#de9899');
                    specular = Bab.Color3.FromHexString('#7b3839');
                }

                const npc = new Character(name, {
                    role: role as any,
                    diffuseColor: color,
                    specularColor: specular,
                    startPosition: getPosition(
                        position,
                        'arena',
                        this.collection
                    ),
                }, this.collection.scene, this.collection.worldClock);
                npc.tags.clear();
                npc.tags.add(role);
                if (role === 'tank' || role === 'healer') {
                    npc.tags.add('support');
                }

                this.collection.addCharacter(npc);

                const onTick = () => {
                    if (this.activeStep === 'alarm-pheromones') {
                        if (npc.tags.has('support')) {
                            npc.steering.seekWithArrive(getPosition(
                                '-0.05,0.1',
                                'arena',
                                this.collection
                            ), { priority: 1.0, threshold: 1.0 });
                        } else {
                            npc.steering.seekWithArrive(getPosition(
                                '0.05,-0.1',
                                'arena',
                                this.collection
                            ), { priority: 1.0, threshold: 1.0 });
                        }
                    } else if (this.activeStep?.startsWith('poison-sting')) {
                        if (npc.tags.has('support')) {

                            if (this.activeStep === 'poison-sting-1' && npc.tags.has('support-1')) {
                                npc.steering.seekWithArrive(getPosition(
                                    getRotationPosition(this.pheromonesMechanic.startRotation, 1, this.pheromonesMechanic.rotationDirection === 'cw', false),
                                    'arena',
                                    this.collection
                                ), { priority: 10.0 });
                            } else if (this.activeStep === 'poison-sting-2' && npc.tags.has('support-2')) {
                                npc.steering.seekWithArrive(getPosition(
                                    getRotationPosition(this.pheromonesMechanic.startRotation, 2, this.pheromonesMechanic.rotationDirection === 'cw', false),
                                    'arena',
                                    this.collection
                                ), { priority: 10.0 });
                            } else if (this.activeStep === 'poison-sting-3' && npc.tags.has('support-3')) {
                                npc.steering.seekWithArrive(getPosition(
                                    getRotationPosition(this.pheromonesMechanic.startRotation, 3, this.pheromonesMechanic.rotationDirection === 'cw', false),
                                    'arena',
                                    this.collection
                                ), { priority: 10.0 });
                            } else if (this.activeStep === 'poison-sting-4' && npc.tags.has('support-4')) {
                                npc.steering.seekWithArrive(getPosition(
                                    getRotationPosition(this.pheromonesMechanic.startRotation, 4, this.pheromonesMechanic.rotationDirection === 'cw', false),
                                    'arena',
                                    this.collection
                                ), { priority: 10.0 });
                            } else {
                                npc.steering.seekWithArrive(getPosition(
                                    '-0.05,0.1',
                                    'arena',
                                    this.collection
                                ), { priority: 1.0, threshold: 1.0 });
                            }
                        } else {

                            if (this.activeStep === 'poison-sting-1' && npc.tags.has('dps-1')) {
                                npc.steering.seekWithArrive(getPosition(
                                    getRotationPosition(this.pheromonesMechanic.startRotation, 1, this.pheromonesMechanic.rotationDirection === 'cw', true),
                                    'arena',
                                    this.collection
                                ), { priority: 10.0 });
                            } else if (this.activeStep === 'poison-sting-2' && npc.tags.has('dps-2')) {
                                npc.steering.seekWithArrive(getPosition(
                                    getRotationPosition(this.pheromonesMechanic.startRotation, 2, this.pheromonesMechanic.rotationDirection === 'cw', true),
                                    'arena',
                                    this.collection
                                ), { priority: 10.0 });
                            } else if (this.activeStep === 'poison-sting-3' && npc.tags.has('dps-3')) {
                                npc.steering.seekWithArrive(getPosition(
                                    getRotationPosition(this.pheromonesMechanic.startRotation, 3, this.pheromonesMechanic.rotationDirection === 'cw', true),
                                    'arena',
                                    this.collection
                                ), { priority: 10.0 });
                            } else if (this.activeStep === 'poison-sting-4' && npc.tags.has('dps-4')) {
                                npc.steering.seekWithArrive(getPosition(
                                    getRotationPosition(this.pheromonesMechanic.startRotation, 4, this.pheromonesMechanic.rotationDirection === 'cw', true),
                                    'arena',
                                    this.collection
                                ), { priority: 10.0 });
                            } else {
                                npc.steering.seekWithArrive(getPosition(
                                    '0.05,-0.1',
                                    'arena',
                                    this.collection
                                ), { priority: 1.0, threshold: 1.0 });
                            }
                        }
                    }
                    else {
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
                return npc;
            };

            let player = this.collection.characters['player'];
            if (player) {
                const role = roles[0];
                player.role = role;
                player.tags.add(role);
                if (role === 'tank' || role === 'healer') {
                    player.tags.add('support');
                }

                if (role === 'tank') {
                    (player.body.material as Bab.StandardMaterial).diffuseColor = Bab.Color3.FromHexString('#465ece');
                    (player.body.material as Bab.StandardMaterial).specularColor = Bab.Color3.FromHexString('#889aef');
                } else if (role === 'healer') {
                    (player.body.material as Bab.StandardMaterial).diffuseColor = Bab.Color3.FromHexString('#477938');
                    (player.body.material as Bab.StandardMaterial).specularColor = Bab.Color3.FromHexString('#a2cc96');
                } else if (role === 'dps') {
                    (player.body.material as Bab.StandardMaterial).diffuseColor = Bab.Color3.FromHexString('#7b3839');
                    (player.body.material as Bab.StandardMaterial).specularColor = Bab.Color3.FromHexString('#de9899');
                }
            }

            const getRandPosition = () => {
                let x = 0 + (Math.random() - 0.5) * 0.54;
                x = Math.round(x * 1500) / 1000;
                if (x > 0) {
                    x + 0.35;
                } else {
                    x - 0.35;
                }

                let y = (Math.random() - 0.5) * 0.54;
                y = Math.round(y * 1200) / 1000;
                if (y > -0.85) {
                    y + 0.25;
                } else {
                    y - 0.25;
                }

                return `${x},${y}`;
            };

            const npcs = [
                makeNpc('npc-1', getRandPosition(), roles[1]),
                makeNpc('npc-2', getRandPosition(), roles[2]),
                makeNpc('npc-3', getRandPosition(), roles[3]),
                makeNpc('npc-4', getRandPosition(), roles[4]),
                makeNpc('npc-5', getRandPosition(), roles[5]),
                makeNpc('npc-6', getRandPosition(), roles[6]),
                makeNpc('npc-7', getRandPosition(), roles[7]),
            ] as const;

            const characters = shuffleArray([
                player,
                ...npcs,
            ]);

            characters.forEach((character) => {
                if (character?.tags?.has('support')) {
                    if (character.name === 'player') {
                    }

                    character.tags.add(`support-${supportCount++}`);
                } else if (character?.tags?.has('dps')) {
                    if (character.name === 'player') {
                    }

                    character.tags.add(`dps-${dpsCount++}`);
                }
            });

            (window as any).characters = characters;

            // (window as any).step = 1;
            // const getStep = () => (window as any).step;

            this.collection.worldClock.on('tick', () => {
            });

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
                npcs.forEach(npc => npc.dispose())
                this.indicator?.dispose();
            });
        });
    }

    isInPosition(player: Character | undefined, position: Bab.Vector3, radius = 1.5) {
        const colliderPosition = player?.collider?.absolutePosition;
        if (colliderPosition) {
            return isWithinRadius(
                position.x - colliderPosition.x,
                position.z - colliderPosition.z,
                radius
            );
        }

        return false;
    }

    override async dispose() {
        await super.dispose();
    }
}

import * as Bab from '@babylonjs/core';
import { Character } from '../character';
import { getPosition } from '../positioning';
import { shuffleArray } from '../array-shuffle';
import { yalmsToM } from '../conversions';

import {
    Fight,
    type FightOptions,
} from './';

export type M2STutorialOptions = FightOptions & {
};

const WayMarkClockwiseListing = [
    'A',
    'One',
    'B',
    'Two',
    'C',
    'Three',
    'D',
    'Four',
] as const;

function getNextWaymark(name: string) {
    const index = WayMarkClockwiseListing.indexOf(name as any);
    if (index && index < WayMarkClockwiseListing.length - 1) {
        return WayMarkClockwiseListing[index + 1];
    }
    return WayMarkClockwiseListing[0];
}

function getPrevWaymark(name: string) {
    const index = WayMarkClockwiseListing.indexOf(name as any);
    if (index && index >= 1) {
        return WayMarkClockwiseListing[index - 1];
    }
    return WayMarkClockwiseListing[WayMarkClockwiseListing.length - 1];
}

export class M2STutorial extends Fight {
    options: M2STutorialOptions;

    constructor(options: M2STutorialOptions) {
        super(options);
        this.options = options;

        console.log('M2STutorial: ', this);


        this.on('start-execute', () => {
            const makeNpc = (name: string, position: string) => {
                const npc = new Character(name, {
                    diffuseColor: Bab.Color3.FromHexString('#e9c8aa'),
                    specularColor: Bab.Color3.Magenta(),
                    startPosition: getPosition(
                        position,
                        'arena',
                        this.collection
                    ),
                }, this.collection.scene, this.collection.worldClock);
                this.collection.addCharacter(npc);
                return npc;
            };

            let player = this.collection.characters['player'];
            let marker = this.collection.getMeshByName('waymark-one');
            const waymarks = shuffleArray(this.waymarks || []);

            const getRandPosition = () => {
                let x = 0 + (Math.random() - 0.5) * 0.18;
                x = Math.round(x * 1500) / 1000;
                if (x > 0) {
                    x + 0.35;
                } else {
                    x - 0.35;
                }

                let y = -0.72 + (Math.random() - 0.5) * 0.15;
                y = Math.round(y * 1200) / 1000;
                if (y > -0.85) {
                    y + 0.15;
                } else {
                    y - 0.15;
                }
                y = Math.max(-0.98, y);

                return `${x},${y}`;
            };
            const npcs = [
                makeNpc('npc-1', getRandPosition()),
                makeNpc('npc-2', getRandPosition()),
                makeNpc('npc-3', getRandPosition()),
                makeNpc('npc-4', getRandPosition()),
                makeNpc('npc-5', getRandPosition()),
                makeNpc('npc-6', getRandPosition()),
                makeNpc('npc-7', getRandPosition()),
            ] as const;

            const playerWaymark = waymarks[0];
            const npcsWithMark = npcs.map((npc, i) => {
                const waymark = waymarks[i + 1];

                const nextName = getNextWaymark(waymark.name);
                const next = this.findWaymark(nextName);

                const prevName = getPrevWaymark(waymark.name);
                const prev = this.findWaymark(prevName);

                return {
                    npc,
                    waymark: waymarks[i + 1],
                    next,
                    prev
                };
            });


            const bossPosition = Bab.Vector3.Zero();
            (window as any).step = 1;
            const getStep = () => (window as any).step;
            this.collection.worldClock.on('tick', () => {
                marker = marker || this.collection.getMeshByName('waymark-one');
                player = player || this.collection.characters['player'];
                // if (player) {
                //     npc.steering.lookAtMesh(player);
                // }
                // const direction = npc.getDirection(Bab.Vector3.Forward());
                // npc.velocity = direction;
                // // npc.steering.velocity = new Bab.Vector3(0.05, 0.0, 0.1);
                // npc.steering.lookWhereGoing(true);

                npcsWithMark.forEach(({ npc, waymark, next, prev }) => {
                    const waymarkName = waymark?.name;
                    let target = waymark?.mesh?.position?.clone();
                    if (target) {

                        if (getStep() === 1) {
                            if (['One', 'Two', 'Three', 'Four'].includes(waymarkName)) {
                                target = bossPosition.add(target.scale(0.18))
                            } else {
                                target = bossPosition.add(target.scale(0.65))
                            }
                        } else if (getStep() === 2) {
                            if (['One', 'Two', 'Three', 'Four'].includes(waymarkName)) {
                                target = bossPosition.add(target.scale(0.65))
                            } else {
                                target = bossPosition.add(target.scale(0.18))
                            }
                        } else if (getStep() === 3) {
                            if (['One', 'Two', 'Three', 'Four'].includes(waymarkName)) {
                                target = next?.mesh?.position?.clone() || target;
                                target = bossPosition.add(target.scale(0.45))
                            } else {
                                target = bossPosition.add(target.scale(0.18))
                            }
                        } else if (getStep() === 4) {
                            if (['One', 'Two', 'Three', 'Four'].includes(waymarkName)) {
                                target = bossPosition.add(target.scale(0.45))
                            } else {
                                target = prev?.mesh?.position?.clone() || target;
                                target = bossPosition.add(target.scale(0.18))
                            }
                        }

                        npc.steering.seekWithArrive(target, { priority: 10.0 });
                    }
                    npc.steering.lookWhereGoing(true);
                    npc.steering.animate();
                })
                // if (marker) {
                //     npc.steering.seekWithArrive(marker?.position, { priority: 10.0 });
                // }
                // if (player) {
                //     npc.steering.persue(player.position, player.velocity.scale(0.1), { weight: 0.01 });
                // }
                // npc.steering.lookWhereGoing(true);
                // npc.steering.animate();
            });

            const disc2 = Bab.MeshBuilder.CreateDisc('marker', {
                radius: yalmsToM(5.5),
            }, this.collection.scene);
            disc2.rotation.x = Math.PI / 2;
            disc2.position.y = 0.02;
            const disc2Mat = new Bab.StandardMaterial('marker-mat', this.collection.scene);
            disc2Mat.diffuseColor = Bab.Color3.Red();
            disc2Mat.alpha = 0.55;
            disc2.material = disc2Mat;

            const disc = Bab.MeshBuilder.CreateDisc('marker', {
                radius: yalmsToM(2.5),
            }, this.collection.scene);
            disc.rotation.x = Math.PI / 2;
            // disc.position = playerWaymark.mesh?.position?.clone() || disc.position;
            disc.position.y = 0.03;
            const discMat = new Bab.StandardMaterial('marker-mat', this.collection.scene);
            discMat.diffuseColor = Bab.Color3.Green();
            discMat.alpha = 0.49;
            disc.material = discMat;

            let isInPosition = false;
            let key: any;
            this.collection.playerClock.on('tick', () => {
                const collider = player?.collider;
                if (collider && playerWaymark?.checkMeshCollision(collider)) {
                    if (!isInPosition) {
                        console.log('getting in position...');
                        isInPosition = true;
                        key = setTimeout(() => {
                            console.log('WE IN POSITION!');
                        }, 500);
                    }
                } else {
                    isInPosition = false;
                    clearTimeout(key);
                }
            });

            this.on('dispose', () => {
                npcs.forEach(npc => npc.dispose())
                disc.dispose();
            });
        });
    }

    async dispose() {
        await super.dispose();
    }
}

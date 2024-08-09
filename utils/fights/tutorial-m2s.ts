import * as Bab from '@babylonjs/core';
import { Character } from '../character';
import { getPosition } from '../positioning';
import { shuffleArray } from '../array-shuffle';
import { rotateArray } from '../array-rotate';
import { isWithinRadius } from '../vector-helpers';
import { yalmsToM } from '../conversions';
import { Indicator } from '../indicator';

import {
    M2SFight,
    type M2SFightOptions,
} from './m2s';

export type M2STutorialOptions = M2SFightOptions & {
};

export class M2STutorial extends M2SFight {
    options: M2STutorialOptions;

    constructor(options: M2STutorialOptions) {
        super(options);
        this.options = options;

        console.log('M2STutorial: ', this);

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
                npc.tags.add(role);
                if (role === 'tank' || role === 'healer') {
                    npc.tags.add('support');
                }

                this.collection.addCharacter(npc);
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
                let x = 0 + (Math.random() - 0.5) * 0.18;
                x = Math.round(x * 1500) / 1000;
                if (x > 0) {
                    x + 0.35;
                } else {
                    x - 0.35;
                }

                let y = (Math.random() - 0.5) * 0.15;
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
                    character.tags.add(`support-${supportCount++}`);
                } else if (character?.tags?.has('dps')) {
                    character.tags.add(`dps-${dpsCount++}`);
                }
            });

            (window as any).characters = characters;

            // (window as any).step = 1;
            // const getStep = () => (window as any).step;

            this.collection.worldClock.on('tick', () => {
            });

            const indicator = new Indicator({}, this.collection);

            let isInPosition = false;
            let key: any;

            const checkPositionTick = () => {
                if (indicator.playerIsInPosition(player)) {
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
                indicator.dispose();
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

import * as Bab from '@babylonjs/core';
import { getPosition } from '../positioning';
import { addTag } from '../meta-helpers';

import {
    FightSection,
    type SectionOptions,
} from './';

export type P9SSectionOptions = SectionOptions & {
}

export class P9SSection extends FightSection {
    options: P9SSectionOptions;
    orbs: Bab.Mesh[] = [];

    constructor(options: P9SSectionOptions) {
        super(options);
        this.options = options;

        const orbMat = new Bab.StandardMaterial('orb-mat', this.collection.scene);
        orbMat.diffuseColor = Bab.Color3.Purple();
        orbMat.emissiveColor = Bab.Color3.Purple();

        const orbCount = 4;
        const diameter = 2.5;
        this.on('start-execute', () => {
            for (let i = 0; i < orbCount; i++) {
                const orb = Bab.MeshBuilder.CreateSphere(`orb-${i + 1}`, {
                    diameter,
                }, this.collection.scene);
                addTag(orb, 'levinorb');
                addTag(orb, `orb-${i + 1}`);

                console.log('eh: ', this.collection.arena);
                switch (i) {
                    case 0:
                        orb.position = getPosition('0,0.5', 'arena', this.collection);
                        break;
                    case 1:
                        orb.position = getPosition('0.5,0', 'arena', this.collection);
                        break;
                    case 2:
                        orb.position = getPosition('0,-0.5', 'arena', this.collection);
                        break;
                    case 3:
                        orb.position = getPosition('-0.5,0', 'arena', this.collection);
                        break;
                }
                orb.position.y += diameter;
                orb.material = orbMat;

                this.orbs.push(orb);
            }
        });
    }

    async dispose() {
        this.orbs.forEach(o => o?.dispose());
        await super.dispose();
    }
}


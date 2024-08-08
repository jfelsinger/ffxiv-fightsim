import { yalmsToM } from '../conversions';
import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';

import {
    CastBarEffect,
    type CastBarEffectOptions,
} from './cast-bar';

export type StageComboCastEffectOptions = CastBarEffectOptions & {
    telegraphDirection: 'cardinals' | 'intercardinals'
};

export class StageComboCastEffect extends CastBarEffect {
    name = 'stage-combo-cast-bar';
    telegraphDirection: StageCastEffectOptions['telegraph'];
    meshes: Bab.Mesh[] = [];

    constructor(options: StageComboCastEffectOptions) {
        super(options);
        this.telegraphDirection = options.telegraphDirection || 'cardinals';
        console.log('CONSTRUCTOR!');
    }


    async startup() {
        console.log('HEY!');
        this.makeMeshes();
        await super.startup();
    }

    async cleanup() {
        console.log('CLEANUP!');
        for (const mesh of this.meshes) {
            mesh?.dispose()
        }
        await super.cleanup();
    }

    makeMeshes() {
        // const radius: yalmsToM(6);

        // const mat = new Bab.StandardMaterial('stage-telegraph-mat', this.collection.scene);
        // mat.diffuseColor = Bab.Color3.Red();

        // const disc1 = Bab.MeshBuilder.CreateDisc('stage-telegraph-1', {
        //     radius,
        // }, this.collection.scene);

    }
}

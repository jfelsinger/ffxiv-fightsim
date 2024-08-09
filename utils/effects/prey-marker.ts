import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';

import {
    Effect,
    type EffectOptions,
} from './';

export type PreyMarkerEffectOptions = EffectOptions & {
};

export class PreyMarkerEffect extends Effect {
    override name = 'prey-marker';
    // options: PreyMarkerEffectOptions;

    constructor(options: PreyMarkerEffectOptions) {
        super(options);

        const { mesh } = this.makeAoe();
        this.mesh = mesh;

        console.log('PREY MARKER: ', this);
        (window as any).prey = this;
    }

    override async cleanup() {
        this.mesh?.dispose()
        await super.cleanup();
    }

    makeAoe() {
        const mat = new Bab.StandardMaterial('dice', this.scene);
        mat.diffuseTexture = new Bab.Texture('/images/prey-marker.png');
        mat.diffuseTexture.hasAlpha = true;
        mat.useAlphaFromDiffuseTexture = true;
        mat.emissiveColor = new Bab.Color3(0.85, 0.55, 0.55);

        const size = yalmsToM(1.25);
        const mesh = Bab.MeshBuilder.CreatePlane('prey-marker', {
            size,
        }, this.collection.scene);
        mesh.material = mat;
        mesh.position = this.getPosition() || Bab.Vector3.Zero();
        mesh.position.y += 2.5;
        mesh.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;

        return {
            mesh,
            mat
        };
    }
}

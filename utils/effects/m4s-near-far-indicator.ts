import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';
import { rangex1 } from '../interpolation';

import {
    Effect,
    type EffectOptions,
} from './';

export type M4SNearFarIndicatorEffectOptions = EffectOptions & {
};

export class M4SNearFarIndicatorEffect extends Effect {
    override name = 'm4s-near-far-indicator';
    nearIndicator: Bab.Mesh;
    farIndicator: Bab.Mesh;

    constructor(options: M4SNearFarIndicatorEffectOptions) {
        super(options);
    }

    override async startup() {
        await super.startup();
        this.mesh = this.makeAoe().mesh;
    }

    makeAoe() {
        const mesh = new Bab.Mesh('near-far-indicator', this.collection.scene);
        mesh.renderingGroupId = 1;

        const fullHeight = 2.65;
        const farWidth = .37037037;
        const far = Bab.MeshBuilder.CreatePlane('far', {
            height: fullHeight,
            width: fullHeight / farWidth,
        }, this.collection.scene);
        const farMat = new Bab.StandardMaterial('far-mat', this.collection.scene)
        farMat.diffuseTexture = new Bab.Texture('/images/fights/m4s/far-1.png');
        farMat.diffuseTexture.hasAlpha = true;
        farMat.specularColor = new Bab.Color3(0, 0, 0);
        farMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
        farMat.useAlphaFromDiffuseTexture = true;
        farMat.emissiveColor = new Bab.Color3(0.1568627450980392, 0.23137254901960785, 0.3058823529411765);// (HEX : #283B4E , debugNode as BABYLON.StandardMaterial)
        far.material = farMat;
        far.material.alpha = 0;
        far.billboardMode = Bab.Mesh.BILLBOARDMODE_ALL;
        far.setParent(mesh);
        far.renderingGroupId = 1;
        this.collection.addGlow(far);

        const nearWidth = .68;
        const near = Bab.MeshBuilder.CreatePlane('near', {
            height: fullHeight,
            width: fullHeight / nearWidth,
        }, this.collection.scene);
        const nearMat = new Bab.StandardMaterial('near-mat', this.collection.scene)
        nearMat.diffuseTexture = new Bab.Texture('/images/fights/m4s/near-1.png');
        nearMat.diffuseTexture.hasAlpha = true;
        nearMat.specularColor = new Bab.Color3(0, 0, 0);
        nearMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
        nearMat.useAlphaFromDiffuseTexture = true;
        nearMat.emissiveColor = new Bab.Color3(0.21568627450980393, 0.12549019607843137, 0.3254901960784314);// (HEX : #372053 , debugNode as BABYLON.StandardMaterial)
        near.material = nearMat;
        near.material.alpha = 0;
        near.billboardMode = Bab.Mesh.BILLBOARDMODE_ALL;
        near.setParent(mesh);
        near.renderingGroupId = 1;
        this.collection.addGlow(near);

        const startBait = useState<string>('m4s-wnwh-start-bait', () => Math.round(Math.random()) ? 'near' : 'far');
        const firstIndicator = startBait.value === 'far' ? farMat : nearMat;
        const nextIndicator = startBait.value === 'far' ? nearMat : farMat;
        this.on('tick', ({ time, durationPercent, telegraph }) => {
            if (durationPercent < 0.25) {
                firstIndicator.alpha =
                    rangex1(0, 0.03, 0, 1, durationPercent) *
                    rangex1(.22, .25, 1, 0, durationPercent);
            } else if (durationPercent < 0.50) {
                nextIndicator.alpha =
                    rangex1(0.25, 0.28, 0, 1, durationPercent) *
                    rangex1(.47, .5, 1, 0, durationPercent);
            } else if (durationPercent < 0.75) {
                firstIndicator.alpha =
                    rangex1(.50, 0.53, 0, 1, durationPercent) *
                    rangex1(.72, .75, 1, 0, durationPercent);
            } else {
                nextIndicator.alpha =
                    rangex1(0.75, 0.78, 0, 1, durationPercent) *
                    rangex1(.97, 1, 1, 0, durationPercent);
            }
        });

        mesh.position.y += 5.65;
        return {
            mesh,
        };
    }
}

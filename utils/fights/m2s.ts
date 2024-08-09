import * as Bab from '@babylonjs/core';
import { yalmsToM } from '../conversions';
import createMarkerMat from '../../materials/enemy-marker';

import {
    Fight,
    type FightOptions,
} from './';

export type M2SFightOptions = FightOptions & {
};

export class M2SFight extends Fight {
    options: M2SFightOptions;
    boss: Bab.Mesh;

    constructor(options: M2SFightOptions) {
        super(options);
        this.options = options;

        const bossSize = yalmsToM(5.5);
        const height = bossSize * 1.333;
        const width = height * 1.508;

        const boss = Bab.MeshBuilder.CreatePlane('boss', { width, height }, this.collection.scene);
        this.boss = boss;
        boss.position.y = bossSize / 1.25;

        const bossMat = new Bab.StandardMaterial('m2s-boss-mat', this.collection.scene);
        bossMat.diffuseTexture = new Bab.Texture('/images/fights/m2s/boss.png');
        bossMat.diffuseTexture.hasAlpha = true;
        bossMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
        bossMat.useAlphaFromDiffuseTexture = true;
        boss.material = bossMat;
        boss.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;

        const bossMarkerMat = createMarkerMat(this.collection.scene);

        const bossMarker = Bab.MeshBuilder.CreatePlane('boss-marker', {
            size: bossSize * 2,
        }, this.collection.scene);
        bossMarker.rotation.x = Math.PI / 2;
        bossMarker.position.y = 0.02;
        bossMarker.material = bossMarkerMat;
        bossMarker.rotation.z = -Math.PI / 2;
        bossMarker.position.y += 0.05;
        bossMarker.bakeCurrentTransformIntoVertices();
    }

    async dispose() {
        this.boss?.dispose();
        await super.dispose();
    }
}

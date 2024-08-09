import * as Bab from '@babylonjs/core';
import { yalmsToM } from '../conversions';

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

        const disc2 = Bab.MeshBuilder.CreateDisc('marker', {
            radius: bossSize,
        }, this.collection.scene);
        disc2.rotation.x = Math.PI / 2;
        disc2.position.y = 0.02;
        const disc2Mat = new Bab.StandardMaterial('marker-mat', this.collection.scene);
        disc2Mat.diffuseColor = Bab.Color3.Red();
        disc2Mat.alpha = 0.55;
        disc2.material = disc2Mat;
    }

    async dispose() {
        this.boss?.dispose();
        await super.dispose();
    }
}

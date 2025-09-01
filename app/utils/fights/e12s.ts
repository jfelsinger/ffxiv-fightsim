import {
    Fight,
    type FightOptions,
} from './';

export type E12SFightOptions = FightOptions & {
};

export class E12SFight extends Fight {
    override options: E12SFightOptions;
    boss: Bab.Mesh;
    ifrit: Bab.Mesh;
    garuda: Bab.Mesh;
    leviathan: Bab.Mesh;
    ramuh: Bab.Mesh;

    constructor(options: E12SFightOptions) {
        super(options);
        this.options = options;

        const bossSize = yalmsToM(5);
        const boss = Bab.MeshBuilder.CreatePlane('boss', { size: bossSize * 2 }, this.collection.scene);
        this.boss = boss;
        boss.position.y = bossSize;
        const bossMat = new Bab.StandardMaterial('e12s-boss-mat', this.collection.scene);
        bossMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/boss.png');
        bossMat.diffuseTexture.hasAlpha = true;
        bossMat.specularColor = new Bab.Color3(0, 0, 0);
        bossMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
        boss.material = bossMat;
        boss.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;

        const crystalSize = yalmsToM(12);

        const ifritSize = crystalSize
        const ifrit = Bab.MeshBuilder.CreatePlane('ifrit', { height: ifritSize * 2, width: ifritSize * 1.2 }, this.collection.scene);
        ifrit.position.z = yalmsToM(26);
        ifrit.position.x = ifritSize * 1.2 * 1.65;
        ifrit.position.y = ifritSize * 0.8;
        const ifritMat = new Bab.StandardMaterial('e12s-ifrit', this.collection.scene);
        ifritMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/ifrit.png');
        ifritMat.diffuseTexture.hasAlpha = true;
        ifritMat.specularColor = new Bab.Color3(0, 0, 0);
        ifritMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
        ifrit.material = ifritMat;
        ifrit.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;
        this.ifrit = ifrit;

        const ramuhSize = crystalSize
        const ramuh = Bab.MeshBuilder.CreatePlane('ramuh', { height: ramuhSize * 2, width: ramuhSize * 1.2 }, this.collection.scene);
        ramuh.position.z = yalmsToM(35);
        ramuh.position.x = ramuhSize * 1.2 * 0.625;
        ramuh.position.y = ramuhSize * 0.8;
        const ramuhMat = new Bab.StandardMaterial('e12s-ramuh', this.collection.scene);
        ramuhMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/ramuh.png');
        ramuhMat.diffuseTexture.hasAlpha = true;
        ramuhMat.specularColor = new Bab.Color3(0, 0, 0);
        ramuhMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
        ramuh.material = ramuhMat;
        ramuh.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;
        this.ramuh = ramuh;

        const garudaSize = crystalSize
        const garuda = Bab.MeshBuilder.CreatePlane('garuda', { height: garudaSize * 2, width: garudaSize * 1.2 }, this.collection.scene);
        garuda.position.z = yalmsToM(35);
        garuda.position.x = garudaSize * 1.2 * -0.625;
        garuda.position.y = garudaSize * 0.8;
        const garudaMat = new Bab.StandardMaterial('e12s-garuda', this.collection.scene);
        garudaMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/garuda.png');
        garudaMat.diffuseTexture.hasAlpha = true;
        garudaMat.specularColor = new Bab.Color3(0, 0, 0);
        garudaMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
        garuda.material = garudaMat;
        garuda.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;
        this.garuda = garuda;

        const leviathanSize = crystalSize
        const leviathan = Bab.MeshBuilder.CreatePlane('leviathan', { height: leviathanSize * 2, width: leviathanSize * 1.2 }, this.collection.scene);
        leviathan.position.z = yalmsToM(26);
        leviathan.position.x = leviathanSize * 1.2 * -1.65;
        leviathan.position.y = leviathanSize * 0.8;
        const leviathanMat = new Bab.StandardMaterial('e12s-leviathan', this.collection.scene);
        leviathanMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/leviathan.png');
        leviathanMat.diffuseTexture.hasAlpha = true;
        leviathanMat.specularColor = new Bab.Color3(0, 0, 0);
        leviathanMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
        leviathan.material = leviathanMat;
        leviathan.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;
        this.leviathan = leviathan;
    }

    override async dispose() {
        this.boss?.dispose();
        await super.dispose();
    }
}

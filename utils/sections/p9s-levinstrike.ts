import {
    FightSection,
    type SectionOptions,
} from './';

export type P9SSectionOptions = SectionOptions & {
}

export class P9SSection extends FightSection {
    override options: P9SSectionOptions;
    orbs: Bab.Mesh[] = [];

    constructor(options: P9SSectionOptions) {
        super(options);
        this.options = options;

        const orbMat = new Bab.StandardMaterial('orb-mat', this.collection.scene);
        orbMat.diffuseColor = Bab.Color3.Purple();
        orbMat.emissiveColor = Bab.Color3.Purple();
        orbMat.alpha = 0.55
        orbMat.diffuseColor = new Bab.Color3(0.6235294117647059, 0.047058823529411764, 0.7333333333333333);// (HEX : #9F0CBB , debugNode as Bab.StandardMaterial)
        orbMat.specularColor = new Bab.Color3(0.2784313725490196, 0.058823529411764705, 0.23921568627450981);// (HEX : #470F3D , debugNode as Bab.StandardMaterial)
        orbMat.specularPower = 6;// (debugNode as Bab.StandardMaterial)
        orbMat.emissiveColor = new Bab.Color3(0.20784313725490197, 0.0196078431372549, 0.0784313725490196);// (HEX : #350514 , debugNode as Bab.StandardMaterial)
        orbMat.ambientColor = new Bab.Color3(0.42745098039215684, 0.0196078431372549, 0.0196078431372549);// (HEX : #6D0505 , debugNode as Bab.StandardMaterial)

        const innerOrbMat = new Bab.StandardMaterial('innerOrb-mat', this.collection.scene);
        innerOrbMat.diffuseColor = Bab.Color3.Purple();
        innerOrbMat.emissiveColor = Bab.Color3.Purple();
        innerOrbMat.diffuseColor = new Bab.Color3(0.0392156862745098, 0.07058823529411765, 0.26666666666666666);// (HEX : #0A1244 , debugNode as Bab.StandardMaterial)
        innerOrbMat.specularColor = new Bab.Color3(0.18823529411764706, 0.6784313725490196, 1);// (HEX : #30ADFF , debugNode as Bab.StandardMaterial)
        innerOrbMat.specularPower = 3.6;// (debugNode as Bab.StandardMaterial)
        innerOrbMat.emissiveColor = new Bab.Color3(0.043137254901960784, 0.10588235294117647, 0.6352941176470588);// (HEX : #0B1BA2 , debugNode as Bab.StandardMaterial)
        innerOrbMat.ambientColor = new Bab.Color3(0.058823529411764705, 0.18823529411764706, 0.7607843137254902);// (HEX : #0F30C2 , debugNode as Bab.StandardMaterial)

        const orbCount = 4;
        const diameter = 2.5;
        this.on('start-execute', () => {
            for (let i = 0; i < orbCount; i++) {
                const orb = Bab.MeshBuilder.CreateSphere(`orb-${i + 1}`, {
                    diameter,
                }, this.collection.scene);
                orb.material = orbMat;
                addTag(orb, 'levinorb');
                addTag(orb, `orb-${i + 1}`);
                orb.alphaIndex = 5;
                this.collection.addGlow(orb);

                const innerOrb = Bab.MeshBuilder.CreateSphere(`inner-orb-${i + 1}`, {
                    diameter: diameter * 0.75,
                }, this.collection.scene);
                innerOrb.alphaIndex = 6;
                innerOrb.parent = orb;
                innerOrb.material = innerOrbMat;
                this.collection.addGlow(innerOrb);

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

                this.orbs.push(orb);
            }
        });
    }

    override async dispose() {
        this.orbs.forEach(o => o?.dispose());
        await super.dispose();
    }
}


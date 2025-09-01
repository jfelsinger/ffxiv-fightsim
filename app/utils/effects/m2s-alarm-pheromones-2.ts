export type M2SAlarmPheromones2Options = AoeGroupEffectOptions<{
    name?: string
    yalms?: number
    width?: number
    height?: number
}> & {
    rotation: number
};

export class M2SAlarmPheromones2Effect extends AoeGroupEffect {
    override options: M2SAlarmPheromones2Options;
    override name = 'm2s-alarm-pheromones-2';

    constructor(options: M2SAlarmPheromones2Options) {
        options.aoes = [
            {
                name: 'aoe-square',
                yalms: 10.5,
                width: 62,
                position: '0,0.365',
            }, {
                name: 'aoe-square',
                yalms: 10.5,
                height: 62,
                position: '0.365,0',
            }, {
                name: 'aoe-square',
                yalms: 10.5,
                width: 62,
                position: '0,-0.365',
            }, {
                name: 'aoe-square',
                yalms: 10.5,
                height: 62,
                position: '-0.365,0',
            },
        ];
        super(options);
        this.options = options;
    }

    override makeAoe() {
        const { mesh: empty } = super.makeAoe();

        let yRotation = 0;
        if (this.options.rotation) {
            yRotation = -(this.options.rotation * (Math.PI / 180));
        }

        const hoverHeight = 3;
        const offset1 = '0.385';

        const beeMat = new Bab.StandardMaterial('bee-mat', this.collection.scene);
        beeMat.diffuseTexture = new Bab.Texture('/images/fights/m2s/bee-child.png');
        beeMat.diffuseTexture.hasAlpha = true;
        beeMat.useAlphaFromDiffuseTexture = true;
        beeMat.emissiveColor = new Bab.Color3(0.85, 0.55, 0.55);

        const stingerMat = new Bab.StandardMaterial('stinger-mat', this.collection.scene);
        stingerMat.diffuseColor = Bab.Color3.Green();
        stingerMat.emissiveColor = new Bab.Color3(0.25, 0.55, 0.15);

        const stingerHeight = yalmsToM(24);

        const stinger1 = Bab.MeshBuilder.CreateCylinder('stinger-1', {
            diameterTop: 0,
            height: stingerHeight,
            diameterBottom: 0.5,
            tessellation: 6,
        });
        stinger1.rotation.z = -Math.PI / 2;
        stinger1.bakeCurrentTransformIntoVertices();
        stinger1.position = getPosition(
            `-0.5,${offset1}`,
            'arena',
            this.collection
        );
        stinger1.position.y += hoverHeight;
        stinger1.parent = (empty);
        stinger1.material = stingerMat;
        this.on('dispose', () => stinger1.dispose());

        const stinger2 = Bab.MeshBuilder.CreateCylinder('stinger-2', {
            diameterTop: 0,
            height: stingerHeight,
            diameterBottom: 0.5,
            tessellation: 6,
        });
        stinger2.rotation.z = -Math.PI / 2;
        stinger2.bakeCurrentTransformIntoVertices();
        stinger2.position = getPosition(
            `${offset1},0.5`,
            'arena',
            this.collection
        );
        stinger2.position.y += hoverHeight;
        stinger2.rotation.y = 90 * (Math.PI / 180);
        stinger2.parent = (empty);
        stinger2.material = stingerMat;
        this.on('dispose', () => stinger2.dispose());

        const stinger3 = Bab.MeshBuilder.CreateCylinder('stinger-3', {
            diameterTop: 0,
            height: stingerHeight,
            diameterBottom: 0.5,
            tessellation: 6,
        });
        stinger3.rotation.z = -Math.PI / 2;
        stinger3.bakeCurrentTransformIntoVertices();
        stinger3.position = getPosition(
            `0.5,-${offset1}`,
            'arena',
            this.collection
        );
        stinger3.position.y += hoverHeight;
        stinger3.rotation.y = 180 * (Math.PI / 180);
        stinger3.parent = (empty);
        stinger3.material = stingerMat;
        this.on('dispose', () => stinger3.dispose());

        const stinger4 = Bab.MeshBuilder.CreateCylinder('stinger-4', {
            diameterTop: 0,
            height: stingerHeight,
            diameterBottom: 0.5,
            tessellation: 6,
        });
        stinger4.rotation.z = -Math.PI / 2;
        stinger4.bakeCurrentTransformIntoVertices();
        stinger4.position = getPosition(
            `-${offset1},-0.5`,
            'arena',
            this.collection
        );
        stinger4.position.y += hoverHeight;
        stinger4.rotation.y = (90 * 3) * (Math.PI / 180);
        stinger4.parent = (empty);
        stinger4.material = stingerMat;
        this.on('dispose', () => stinger4.dispose());

        const size = yalmsToM(1.5);
        const bee1 = Bab.MeshBuilder.CreatePlane('bee-1', {
            size,
        }, this.collection.scene);
        bee1.material = beeMat;
        bee1.position = getPosition(
            `-1,${offset1}`,
            'arena',
            this.collection
        );
        bee1.position.y += hoverHeight;
        bee1.rotation.y = yRotation;
        bee1.setParent(empty);
        bee1.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;
        this.on('dispose', () => bee1.dispose());

        const bee2 = Bab.MeshBuilder.CreatePlane('bee-1', {
            size,
        }, this.collection.scene);
        bee2.material = beeMat;
        bee2.position = getPosition(
            `${offset1},1`,
            'arena',
            this.collection
        );
        bee2.position.y += hoverHeight;
        bee2.rotation.y = yRotation;
        bee2.setParent(empty);
        bee2.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;
        this.on('dispose', () => bee2.dispose());

        const bee3 = Bab.MeshBuilder.CreatePlane('bee-1', {
            size,
        }, this.collection.scene);
        bee3.material = beeMat;
        bee3.position = getPosition(
            `1,-${offset1}`,
            'arena',
            this.collection
        );
        bee3.position.y += hoverHeight;
        bee3.rotation.y = yRotation;
        bee3.setParent(empty);
        bee3.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;
        this.on('dispose', () => bee3.dispose());

        const bee4 = Bab.MeshBuilder.CreatePlane('bee-1', {
            size,
        }, this.collection.scene);
        bee4.material = beeMat;
        bee4.position = getPosition(
            `-${offset1},-1`,
            'arena',
            this.collection
        );
        bee4.position.y += hoverHeight;
        bee4.rotation.y = yRotation;
        bee4.setParent(empty);
        bee4.billboardMode = Bab.Mesh.BILLBOARDMODE_ALL;
        this.on('dispose', () => bee4.dispose());


        return {
            mesh: empty,
        }
    }
}

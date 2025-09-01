export type DiceEffectOptions = EffectOptions & {
    pips?: (number | string)[] | number | string,
};

export const PipPositions = [
    [
        [0, 0, 0],
    ],
    [
        [-0.2, 0, 0],
        [+0.2, 0, 0],
    ],
    [
        [-0.2, -0.2, 0],
        [0, 0.1732, 0],
        [+0.2, -0.2, 0],
    ],
    [
        [-0.2, -0.2, 0],
        [+0.2, -0.2, 0],
        [-0.2, +0.2, 0],
        [+0.2, +0.2, 0],
    ],
    [
        [-0.4 + 0, 0, 0],

        [+0.4 - 0.2, -0.2, 0],
        [+0.4 + 0.2, -0.2, 0],
        [+0.4 - 0.2, +0.2, 0],
        [+0.4 + 0.2, +0.2, 0],
    ],
    [
        [-0.4 - 0.2, -0.2, 0],
        [-0.4 + 0, 0.1732, 0],
        [-0.4 + 0.2, -0.2, 0],

        [0.4 - 0.2, 0.2, 0],
        [0.4 + 0, -0.1732, 0],
        [0.4 + 0.2, 0.2, 0],
    ],
    [
        [-0.4 - 0.2, -0.2, 0],
        [-0.4 + 0, 0.1732, 0],
        [-0.4 + 0.2, -0.2, 0],

        [+0.4 - 0.2, -0.2, 0],
        [+0.4 + 0.2, -0.2, 0],
        [+0.4 - 0.2, +0.2, 0],
        [+0.4 + 0.2, +0.2, 0],
    ],
    [
        [-0.4 + 0.2, -0.2, 0],
        [-0.4 - 0.2, -0.2, 0],
        [-0.4 - 0.2, +0.2, 0],
        [-0.4 + 0.2, +0.2, 0],

        [+0.4 - 0.2, -0.2, 0],
        [+0.4 + 0.2, -0.2, 0],
        [+0.4 - 0.2, +0.2, 0],
        [+0.4 + 0.2, +0.2, 0],
    ],
] as const;

export class DiceEffect extends Effect {
    override name = 'aoe-dice';
    pips: DiceEffectOptions['pips'];
    pipCount: number = 1;

    constructor(options: DiceEffectOptions) {
        super(options);
        this.pips = options.pips || 1;
    }

    getPipCount() {
        let pips = this.pips;
        if (Array.isArray(pips)) {
            pips = pips[Math.floor(Math.random() * pips.length)];
        }

        if (pips && typeof (pips) === 'string') {
            pips = pips.split(',');
            pips = pips[Math.floor(Math.random() * pips.length)];
        }

        if (typeof (pips) === 'string') {
            if (pips.includes('-')) {
                pips = pips.split('-');
                const min = parseNumber((pips[0] as string)?.trim() || 1);
                const max = parseNumber((pips[1] as string)?.trim() || 1);
                return Math.floor(
                    Math.random() * (max - min)
                ) + min;
            }

            return parseNumber(pips?.trim() || 1);
        }

        return parseNumber(pips || 1);
    }

    override async startup() {
        await super.startup();
        this.pipCount = this.getPipCount();
        this.mesh = this.makeAoe().dice;
    }

    override async cleanup() {
        this.mesh?.dispose()
        await super.cleanup();
    }

    makeAoe() {
        const pipCount = this.pipCount;

        const diceMat = new Bab.StandardMaterial('dice', this.scene);

        if (pipCount % 2) { // is even
            // Blues
            diceMat.diffuseColor = new Bab.Color3(0.14901960784313725, 0.21568627450980393, 0.9803921568627451);// (HEX : #2637FA , debugNode as Bab.StandardMaterial)
            diceMat.specularColor = new Bab.Color3(0.1568627450980392, 0.20784313725490197, 0.7725490196078432);// (HEX : #2835C5 , debugNode as Bab.StandardMaterial)
            diceMat.specularPower = 1;// (debugNode as Bab.StandardMaterial)
            diceMat.emissiveColor = new Bab.Color3(0.24313725490196078, 0.3568627450980392, 0.7725490196078432);// (HEX : #3E5BC5 , debugNode as BABYLON.StandardMaterial)
            diceMat.ambientColor = new Bab.Color3(0.10196078431372549, 0.6549019607843137, 0.8470588235294118);// (HEX : #1AA7D8 , debugNode as BABYLON.StandardMaterial)
        } else {
            // Reds
            diceMat.diffuseColor = new Bab.Color3(0.9137254901960784, 0.058823529411764705, 0.0784313725490196);// (HEX : #E90F14 , debugNode as BABYLON.StandardMaterial)
            diceMat.specularColor = new Bab.Color3(0.9254901960784314, 0.26666666666666666, 0.25098039215686274);// (HEX : #EC4440 , debugNode as BABYLON.StandardMaterial)
            diceMat.specularPower = 4.8;// (debugNode as BABYLON.StandardMaterial)
            diceMat.emissiveColor = new Bab.Color3(0.611764705882353, 0.23529411764705882, 0.24705882352941178);// (HEX : #9C3C3F , debugNode as BABYLON.StandardMaterial)
            diceMat.ambientColor = new Bab.Color3(0.8666666666666667, 0.0784313725490196, 0.3254901960784314);// (HEX : #DD1453 , debugNode as BABYLON.StandardMaterial)
        }

        // const diceMat = createAoeMat(this.scene, this.getColor(), 'diceMat');
        // diceMat.alpha = 0.7;

        // diceMat.setFloat('telegraph', this.telegraph * globalTelegraph.value);
        // diceMat.setFloat('elapsed', this.getDurationPercent());
        // this.on('tick', ({ time, durationPercent }) => {
        //     diceMat.setFloat('time', time);
        //     diceMat.setFloat('telegraph', this.telegraph * globalTelegraph.value);
        //     diceMat.setFloat('elapsed', durationPercent);
        // });

        const dice = new Bab.Mesh(`dice-${pipCount}`, this.scene);
        dice.position = this.getPosition() || Bab.Vector3.Zero();
        dice.position.y += 2;
        dice.billboardMode = Bab.Mesh.BILLBOARDMODE_ALL;

        for (let i = 0; i < pipCount; i++) {
            const pip = this.getPip(i, pipCount);
            this.collection.addGlow(pip);
            pip.material = diceMat;
            pip.parent = dice;
        }

        return {
            dice
        };
    }

    getPip(index: number, total: number) {
        const positions = PipPositions[total - 1]
        const positionArr = positions && positions[index];
        const position = positionArr ? Bab.Vector3.FromArray(positionArr) : Bab.Vector3.Zero();

        const pip = Bab.MeshBuilder.CreateSphere(`pip-${index + 1}`, {
            diameter: 0.3,
            segments: 16,
        }, this.scene);
        pip.position = position;

        return pip;
    }
}

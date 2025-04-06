export type M2SPoisonStingOptions = AoeGroupEffectOptions & {
};

export class M2SPoisonStingEffect extends AoeGroupEffect {
    override options: M2SPoisonStingOptions;
    override name = 'm2s-poison-sting';

    constructor(options: M2SPoisonStingOptions) {
        super(options);
        this.options = options;

        this.aoes.forEach((aoe) => {
            if (aoe.name === 'prey-marker') {
                aoe.on('pre-snapshot', () => {
                    this.aoes.forEach((otherAoe) => {
                        otherAoe.followPosition = false;
                    });
                });
                aoe.on('snapshot', () => {
                    aoe.dispose();
                });
            } else if (aoe.name === 'aoe-disc') {
                aoe.duration *= 2.5;
            }
        });
    }
}

export type StageCastEffectOptions = AoeGroupEffectOptions & {
    telegraph: 'cardinals' | 'intercardinals'
};

export class StageCastEffect extends AoeGroupEffect {
    override name = 'stage-cast';
    override telegraph: StageCastEffectOptions['telegraph'];

    constructor(options: StageCastEffectOptions) {
        super(options);

        this.telegraph = options.telegraph || 'cardinals';
    }

    // override async execute() {
    //     const len = this.aoes.length;
    //     const promises: Promise<void>[] = [];
    //     for (let i = 0; i < len; i++) {
    //         promises.push(this.aoes[i].execute());
    //     }
    //     await Promise.all(promises);

    //     if (this.isActive) {
    //         this.snapshot();
    //     }
    // }

    // override startup() {
    //     super.startup();
    //     this.mesh = this.makeAoe().mesh;
    //     const len = this.aoes.length;
    //     for (let i = 0; i < len; i++) {
    //         const aoe = this.aoes[i];
    //         if (aoe) {
    //             aoe.startTime = this.clock.time;
    //             aoe.startup();
    //             const mesh = aoe.mesh;
    //             if (mesh && this.mesh) {
    //                 mesh.parent = this.mesh;
    //             }
    //         }
    //     }
    // }

    override toJSON() {
        return {
            ...super.toJSON(),
            aoes: this.options.aoes,
        };
    }
}

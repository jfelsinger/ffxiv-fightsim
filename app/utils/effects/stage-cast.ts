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

    override async execute() {
        const len = this.aoes.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push(this.aoes[i].execute());
        }
        await Promise.all(promises);

        if (this.isActive) {
            this.snapshot();
        }
    }

    override async startup() {
        await super.startup();
        this.mesh = this.makeAoe().mesh;
        const len = this.aoes.length;
        const promises: Promise<void>[] = [];
        for (let i = 0; i < len; i++) {
            promises.push((async () => {
                this.aoes[i].startTime = this.clock.time;
                await this.aoes[i].startup();
                const mesh = this.aoes[i].mesh;
                if (mesh && this.mesh) {
                    mesh.parent = this.mesh;
                }
            })());
        }
        await Promise.all(promises);
    }

    override async cleanup() {
        await super.cleanup();
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            aoes: this.options.aoes,
        };
    }
}

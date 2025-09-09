import {
    Effect,
    type EffectOptions,
} from './';

export type AoeGroupEffectOptions<TAOES = {}> = EffectOptions & {
    aoes?: (Partial<EffectOptions> & TAOES)[],
    rotation: number,
};

export class AoeGroupEffect extends Effect {
    override options: AoeGroupEffectOptions;
    override name = 'aoe-group';
    aoes: Effect[] = [];

    constructor(options: AoeGroupEffectOptions) {
        super(options);
        this.options = options;

        if (Array.isArray(options.aoes) && options.aoes.length) {
            const len = options.aoes.length;
            for (let i = 0; i < len; i++) {
                const aoeOptions = {
                    ...options,
                    position: '0,0,0',
                    assetContainer: this.assetContainer,
                    ...options.aoes[i],
                };

                const aoeEffect = decodeEffect(aoeOptions, {
                    collection: options.collection,
                    clock: options.clock,
                });

                if (aoeEffect) {
                    this.aoes.push(aoeEffect);
                    aoeEffect.on('effect-hit', ({ effect: subEffect, target }) => {
                        this.emit('effect-hit', {
                            effect: this,
                            subEffect,
                            target,
                        });
                    });
                }
            }

        }
    }

    override async execute() {
        return;
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

    override init(n = 0, scheduledSelf: Scheduled<Effect>, parent?: ScheduledParent<Effect>, startTime?: number) {
        super.init(n, scheduledSelf, parent, startTime);

        const len = this.aoes.length;
        for (let i = 0; i < len; i++) {
            const aoe = this.aoes[i];
            aoe?.init(0, scheduledSelf, parent, this.startTime);
        }
    }

    override startup() {
        super.startup();
        if (!this.mesh) {
            this.mesh = this.makeAoe().mesh;
        }
        const len = this.aoes.length;
        for (let i = 0; i < len; i++) {
            const aoe = this.aoes[i];
            if (aoe) {
                aoe.startTime = this.clock.time;
                aoe.startup();
                const mesh = aoe.mesh;
                if (mesh && this.mesh) {
                    mesh.parent = this.mesh;
                }
            }
        }
    }

    override runHide() {
        super.runHide();
        const len = this.aoes.length;
        for (let i = 0; i < len; i++) {
            this.aoes[i]?.runHide();
        }
    }

    override runShow() {
        super.runShow();
        const len = this.aoes.length;
        for (let i = 0; i < len; i++) {
            this.aoes[i]?.runShow();
        }
    }

    override setDuration(duration: number | string) {
        super.setDuration(duration);
        this.duration = parseNumber(duration);
        const len = this.aoes.length;
        for (let i = 0; i < len; i++) {
            this.aoes[i]?.setDuration(this.duration);
        }
    }

    override setTelegraph(telegraph: number | string) {
        super.setTelegraph(telegraph);
        const len = this.aoes.length;
        for (let i = 0; i < len; i++) {
            this.aoes[i]?.setTelegraph(this.telegraph);
        }
    }

    override cleanup() {
        const len = this.aoes.length;
        for (let i = 0; i < len; i++) {
            const aoe = this.aoes[i];
            if (aoe) {
                aoe.cleanup();
                aoe.endTime = this.clock.time;
            }
        }

        super.cleanup();
    }

    makeAoe() {
        const emptyMesh = new Bab.Mesh('aoe-group-empty', this.scene);
        emptyMesh.position = this.getPosition() || Bab.Vector3.Zero();

        if (this.options.rotation) {
            emptyMesh.rotation.y = this.options.rotation * (Math.PI / 180);
        }

        this.assetContainer?.meshes?.push(emptyMesh);
        return {
            mesh: emptyMesh,
        };
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            aoes: this.options.aoes,
        };
    }
}

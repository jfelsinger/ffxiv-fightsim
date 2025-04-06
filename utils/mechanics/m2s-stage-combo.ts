import {
    Mechanic,
    type MechanicOptions,
} from './';

export const DefaultMechanicSchedulingMode = 'parallel';
export type M2SStageComboOptions = MechanicOptions & {
};

type StageComboName =
    | 'outerstage'
    | 'centerstage';

type StageComboEffectName =
    | 'centerstage-cast'
    | 'outerstage-cast'
    | 'center-intercards'
    | 'cross-cards'
    | 'outer-cards';

const stageCombos: Record<StageComboName, [StageComboEffectName, StageComboEffectName, StageComboEffectName, StageComboEffectName]> = {
    outerstage: [
        'outerstage-cast',
        'center-intercards',
        'cross-cards',
        'outer-cards',
    ],
    centerstage: [
        'centerstage-cast',
        'outer-cards',
        'cross-cards',
        'center-intercards',
    ],
} as const;

export class M2SStageCombo extends Mechanic {
    override name = 'm2s-stage-combo';
    override options: M2SStageComboOptions;

    constructor(options: M2SStageComboOptions) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';
    }

    override getEffects(): Scheduled<Effect>[] {
        const allEffects = this.effects;

        const stageEffects: Record<StageComboEffectName, Scheduled<Effect> | undefined> = {
            // 'centerstage-cast': allEffects.find(e => e.label?.toLowerCase() === 'centerstage-cast'),
            // 'outerstage-cast': allEffects.find(e => e.label?.toLowerCase() === 'outerstage-cast'),
            'center-intercards': allEffects.find(e => e.label?.toLowerCase() === 'center-intercards'),
            'cross-cards': allEffects.find(e => e.label?.toLowerCase() === 'cross-cards'),
            'outer-cards': allEffects.find(e => e.label?.toLowerCase() === 'outer-cards'),
        };

        const comboName: StageComboName = (Math.random() < 0.5) ? 'centerstage' : 'outerstage';
        const castName = comboName === 'centerstage' ? 'Centerstage Combo' : 'Outerstage Combo';
        const result = stageCombos[comboName].map(e => stageEffects[e]).filter(e => typeof e !== 'undefined');
        this.options.castName = castName;
        result[0].startDelay = 650;


        let particles: Bab.ParticleSystem[] = [];

        this.on('start-effect', ({ effect }) => {
            if (effect?.label === 'center-intercards') {
                particles = [
                    this.getParticles(new Bab.Vector3(1.5, 0, 1.5)),
                    this.getParticles(new Bab.Vector3(-1.5, 0, 1.5)),
                    this.getParticles(new Bab.Vector3(1.5, 0, -1.5)),
                    this.getParticles(new Bab.Vector3(-1.5, 0, -1.5)),
                ];
            } else if (effect?.label === 'outer-cards') {
                particles = [
                    this.getParticles(new Bab.Vector3(1.5, 0, 0)),
                    this.getParticles(new Bab.Vector3(-1.5, 0, 0)),
                    this.getParticles(new Bab.Vector3(0, 0, 1.5)),
                    this.getParticles(new Bab.Vector3(0, 0, -1.5)),
                ];
            }
            for (const p of particles) {
                p.start();
            }
        });

        this.on('end-effect', () => {
            for (const p of particles) {
                p.stop();
                p.dispose();
            }
        });

        this.on('dispose', () => {
            for (const p of particles) {
                p.stop();
                p.dispose();
            }
        });

        return result;
        // return [
        //     ...stageCombos[comboName].map(e => stageEffects[e]).filter(e => typeof e !== 'undefined'),
        // ];
    }

    getParticles(position: Bab.Vector3) {
        const particles = new Bab.ParticleSystem('stage-particles', 2000, this.collection.scene);
        particles.particleTexture = new Bab.Texture('/images/flare-heart.png', this.collection.scene);
        particles.emitter = Bab.Vector3.Zero();

        particles.color1 = new Bab.Color4(0.93, 0.73, 0.73);
        particles.color2 = new Bab.Color4(1.0, 0.2, 0.47);
        particles.colorDead = new Bab.Color4(0.2, 0, 0, 0);

        particles.minSize = 0.1;
        particles.maxSize = 0.5;

        particles.minLifeTime = 0.3;
        particles.maxLifeTime = 1.5;
        particles.emitRate = 200;

        // L/R
        particles.createPointEmitter(
            position.add(new Bab.Vector3(0.1, 0, -0.1)),
            position.add(new Bab.Vector3(-0.1, 0.45, 0.1)),
        );

        particles.minEmitPower = 2.25;
        particles.maxEmitPower = 3.5;
        particles.updateSpeed = 0.005;
        return particles;
    }
}

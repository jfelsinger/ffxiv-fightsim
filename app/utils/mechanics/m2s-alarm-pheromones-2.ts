import {
    Mechanic,
    type MechanicOptions,
} from './';

export const DefaultMechanicSchedulingMode = 'parallel';
export type M2SAlarmPheromones2Options = MechanicOptions & {
};

export class M2SAlarmPheromones2 extends Mechanic {
    override name = 'm2s-alarm-pheromones-2';
    override options: M2SAlarmPheromones2Options;
    rotationDirection?: 'cw' | 'ccw';
    rotations?: number[];
    startRotation?: number;

    constructor(options: M2SAlarmPheromones2Options) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        const effectShowTelegraph = (effect: Scheduled<Effect>) => {
            // console.log('alarm pheromones, bee - telegraph: ', effect);
        };

        const effectPreSnapshot = (effect: Scheduled<Effect>) => {
            // console.log('alarm pheromones, bee - snapshot: ', effect);
        };

        this.on('start-execute', () => {
        });

        this.on('start-effect', ({ effect }) => {
            effect.item.on('start', () => {
                (window as any).pheromones = effect;
            });
            effect.item.on('show-telegraph', effectShowTelegraph);
            effect.item.on('pre-snapshot', effectPreSnapshot);
        });

        this.on('end-effect', ({ effect }) => {
            effect.item.off('show-telegraph', effectShowTelegraph);
            effect.item.off('pre-snapshot', effectPreSnapshot);
        });

        this.on('dispose', () => {
        });
    }

    override getEffects(): Scheduled<Effect>[] {
        const allEffects = this.effects;
        const rotationIncrement = 22.5;

        const startRotation = rotationIncrement * Math.round(Math.random() * 3);
        this.startRotation = startRotation;

        const direction = Math.round(Math.random()) ? 'cw' : 'ccw';
        this.rotationDirection = direction;

        this.rotations = [];
        allEffects.forEach((effect, i) => {
            if (direction === 'cw') {
                const rotation = startRotation + rotationIncrement * i;
                this.rotations?.push(rotation);
                effect.item.options.rotation = rotation;
                effect.item.options.rotationDirection = direction;
            } else {
                const rotation = startRotation - rotationIncrement * i;
                this.rotations?.push(rotation);
                effect.item.options.rotation = rotation;
                effect.item.options.rotationDirection = direction;
            }
        });

        return allEffects;
    }
}

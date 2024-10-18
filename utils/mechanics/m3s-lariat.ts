import * as Bab from '@babylonjs/core';
import {
    type Scheduled,
} from '../scheduled';
import { Effect } from '../effects';

export const DefaultMechanicSchedulingMode = 'parallel';

import {
    Mechanic,
    type MechanicOptions,
} from './';
import { moveEmitHelpers } from 'typescript';
import { Babylon } from '#build/components';

export type LariatType = 'octuple' | 'quadruple';
export type LariatPosition = 'inner' | 'outer';

export type M3SLariatOptions = MechanicOptions & {
    lariatType?: LariatType
    lariatPosition?: LariatPosition
};

export class M3SLariat extends Mechanic {
    override name = 'm3s-lariat';
    override options: M3SLariatOptions;
    particles?: Bab.ParticleSystem;

    constructor(options: M3SLariatOptions) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        const lariatType = useState<LariatType>('m3s-lariat-type', () => options?.lariatType || (Math.round(Math.random()) ? 'octuple' : 'quadruple'));
        const lariatPosition = useState<LariatPosition>('m3s-lariat-position', () => options?.lariatPosition || (Math.round(Math.random()) ? 'inner' : 'outer'));
        this.on('start-execute', () => {
            lariatType.value = options?.lariatType || (Math.round(Math.random()) ? 'octuple' : 'quadruple');
            lariatPosition.value = options?.lariatPosition || (Math.round(Math.random()) ? 'inner' : 'outer');

            if (lariatType.value === 'octuple') {
                this.options.castName = 'Octuple Lariat';
            } else {
                this.options.castName = 'Quadruple Lariat';
            }

            const circleAoe = this.effects.find(e => e.label === 'lariat-circle');
            if (lariatPosition.value === 'outer') {
                this.particles = this.getParticles();
                this.particles?.start();
                if (circleAoe?.item) {
                    circleAoe.item.innerRadius = 11.8;
                    circleAoe.item.outerRadius = 55;
                }
            } else {
                if (circleAoe?.item) {
                    circleAoe.item.innerRadius = 0;
                    circleAoe.item.outerRadius = 11.8;
                }
                this.disposeParticles();
            }
        });

        this.on('end-effect', () => {
            this.disposeParticles();
        });

        this.on('dispose', () => {
            this.disposeParticles();
        });
    }

    disposeParticles() {
        this.particles?.stop();
        this.particles?.dispose();
    }

    getParticles() {
        const particleSystem = new Bab.ParticleSystem('outer-lariat-fire', 2000, this.collection.scene);
        particleSystem.particleTexture = new Bab.Texture('/images/flare.png', this.collection.scene);

        particleSystem.emitter = new Bab.Vector3(0, 5.75, 0);
        particleSystem.minEmitBox = new Bab.Vector3(-1, -1, -1);
        particleSystem.maxEmitBox = new Bab.Vector3(1, 1, 1);

        particleSystem.color1 = new Bab.Color4(1, 0.87, 0.7);
        // particleSystem.color2 = new Bab.Color4(1, 0.39, 0.2);
        particleSystem.color2 = new Bab.Color4(1, 0.34901960784313724, 0.2, 1);
        particleSystem.colorDead = new Bab.Color4(0, 0, 0.2, 0.0);

        particleSystem.minSize = 0.02;
        particleSystem.maxSize = 0.35;

        particleSystem.minLifeTime = 0.35;
        particleSystem.maxLifeTime = 1.45;
        particleSystem.emitRate = 1500;
        particleSystem.gravity = new Bab.Vector3(0, -6.81, 0);

        particleSystem.direction1 = new Bab.Vector3(-2.25, 3.25, 2.25);
        particleSystem.direction2 = new Bab.Vector3(2.25, 3.25, -2.25);

        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;

        // Speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 2.4;
        particleSystem.updateSpeed = 0.005;

        return particleSystem;
    }
}

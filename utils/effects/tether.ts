import { yalmsToM } from '../conversions';
import * as Bab from '@babylonjs/core';
import { parseNumber } from '../parse-number';

import {
    Effect,
    type EffectOptions,
} from './';

export type TetherEffectOptions = EffectOptions & {
    from: string,
    to?: string,
};

export class TetherEffect extends Effect {
    name = 'aoe-square';
    from: string;
    to?: string;

    particles?: Bab.IParticleSystem;

    constructor(options: TetherEffectOptions) {
        super(options);
        this.from = options.from;
        this.to = options.to;
    }

    async startup() {
        await super.startup();
        this.makeAoe();
        this.particles?.start();
    }

    async cleanup() {
        this.mesh?.dispose()
        this.particles?.stop();
        this.particles?.dispose();
        await super.cleanup();
    }

    makeAoe() {
        const fromPosition =
            (this.collection.characters[this.from as any] ||
                this.collection.getMeshByName(this.from))?.position || Bab.Vector3.Zero();
        const toPosition =
            (this.to && (this.collection.characters[this.to as any] ||
                this.collection.getMeshByName(this.to))?.position) || this.getPosition() || Bab.Vector3.Zero();

        const emitter = new Bab.CustomParticleEmitter();
        let id = 0;

        const spread = { x: 0.25, y: 0.25, z: 0.25 };

        if (this.from === 'ifrit') {
            spread.x = 2;
            spread.y = 1.5;
            spread.z = 2.2;
        }

        emitter.particlePositionGenerator = (_index, _particle, out) => {
            out.x = fromPosition.x + Math.sin(Math.random() * 10) * spread.x;
            out.y = fromPosition.y + Math.cos(Math.random() * 10) * spread.y;
            out.z = fromPosition.z + Math.sin(Math.random() * 10) * spread.z;
            id += 1;
        };

        emitter.particleDestinationGenerator = (_index, _particle, out) => {
            out.x = toPosition.x;
            out.y = toPosition.y;
            out.z = toPosition.z;
        };

        const particles = Bab.ParticleHelper.CreateDefault(fromPosition);
        particles.emitter = Bab.Vector3.Zero();
        particles.particleEmitterType = emitter;
        if (this.from === 'ifrit') {
            particles.maxSize = 2.5;
            particles.minSize = 0.25;
        } else if (this.from === 'garuda') {
            particles.maxSize = 1.25;
            particles.minSize = 0.25;
        } else {
            particles.maxSize = 1.25;
            particles.minSize = 0.25;
        }
        particles.maxEmitPower = 0.95;
        if (this.from === 'ifrit') {
            particles.minEmitPower = 0.70;
        } else if (this.from === 'garuda') {
            particles.minEmitPower = 0.90;
        } else {
            particles.minEmitPower = 0.90;
        }
        particles.updateSpeed = 0.25;
        particles.maxLifeTime = 17.45;
        particles.minLifeTime = 17.20;
        particles.preWarmCycles = 100;

        if (this.from === 'ifrit') {
            particles.color1 = Bab.Color4.FromInts(211, 108, 79, 0.8 * 255);
            particles.color2 = Bab.Color4.FromInts(189, 25, 28, 0.8 * 255);
            particles.colorDead = Bab.Color4.FromInts(189, 25, 28, 0.5 * 255);
        } else if (this.from === 'garuda') {
            particles.color1 = Bab.Color4.FromInts(21, 109, 4, 255);
            particles.color2 = Bab.Color4.FromInts(21, 109, 4, 255);
            particles.colorDead = Bab.Color4.FromInts(21, 109, 4, 255);
        } else if (this.from === 'ramuh') {
            particles.color1 = Bab.Color4.FromInts(61, 32, 205, 255);
            particles.color2 = Bab.Color4.FromInts(61, 32, 205, 255);
            particles.colorDead = Bab.Color4.FromInts(61, 32, 205, 255);
        } else if (this.from === 'leviathan') {
            particles.color1 = Bab.Color4.FromInts(13, 195, 163, 255);
            particles.color2 = Bab.Color4.FromInts(13, 195, 163, 255);
            particles.colorDead = Bab.Color4.FromInts(13, 195, 163, 255);
        }

        particles.billboardMode = Bab.ParticleSystem.BILLBOARDMODE_STRETCHED;

        const noiseTex = new Bab.NoiseProceduralTexture('perlin', 256, this.collection.scene);
        noiseTex.animationSpeedFactor = 8;
        noiseTex.persistence = 2;
        noiseTex.brightness = 0.5;
        noiseTex.octaves = 2;
        particles.noiseTexture = noiseTex;
        if (this.from === 'ifrit') {
            particles.noiseStrength = new Bab.Vector3(.03, .03, .03);
        } else if (this.from === 'garuda') {
            particles.noiseStrength = new Bab.Vector3(.015, .015, .015);
        } else {
            particles.noiseStrength = new Bab.Vector3(.015, .015, .015);
        }

        particles.start();
        this.particles = particles;

        return {
            emitter,
            particles,
        }
    }
}

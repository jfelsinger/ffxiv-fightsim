import { getPosition } from '../positioning';
import { useState } from '#imports';

import * as Bab from '@babylonjs/core';
import {
    type Scheduled,
} from '../scheduled';
import { Effect } from '../effects';
import { degToRads } from '../vector-helpers';

export const DefaultMechanicSchedulingMode = 'parallel';

import {
    Mechanic,
    type MechanicOptions,
} from './';

export type M3SInfernalSpinOptions = MechanicOptions & {
};

const directionsCW = [
    45 * 0,
    45 * 1,
    45 * 2,
    45 * 3,
    45 * 4,
    45 * 5,
    45 * 6,
    45 * 7,
    45 * 8,
];

export class M3SInfernalSpin extends Mechanic {
    override name = 'm3s-infernal-spin';
    override options: M3SInfernalSpinOptions;
    rotationIndicator?: Bab.Mesh;

    constructor(options: M3SInfernalSpinOptions) {
        super(options);
        this.options = options;

        const isCW = useState<boolean>('m3s-infernal-spin-is-cw', () => !!Math.round(Math.random()));
        const startDirection = useState<string>('m3s-infernal-spin-start-direction', () => Math.round(Math.random()) ? 'north' : 'south');

        (window as any).__mechanic = this;

        const arrowMat = new Bab.StandardMaterial('arrow-mat', this.collection.scene);
        arrowMat.diffuseColor = new Bab.Color3(0.1803921568627451, 0.3058823529411765, 0.6196078431372549);
        arrowMat.emissiveColor = new Bab.Color3(0.15, 0.185, 0.55);
        const arrowOptions = {
            tessellation: 3,
            diameter: 1.5,
            height: 0.2,
        };


        this.on('start-execute', () => {
            isCW.value = !!Math.round(Math.random());
            startDirection.value = Math.round(Math.random()) ? 'north' : 'south';
            const startNorth = isCW.value ? 135 : 45;
            const startSouth = isCW.value ? -45 : -135;
            const start = startDirection.value === 'north' ? startNorth : startSouth;
            // this.setIndicator(isCW.value);

            const effects = this.effects;
            effects.forEach((effect, index) => {
                const adjustment = directionsCW[index] * (isCW.value ? -1 : 1);
                effect.item.thetaStart = degToRads(start + adjustment) - (effect.item.thetaLength / 2);
            });
            (window as any).__infernalSpin = this;
        });

        this.on('start-effect', ({ effect }) => {
            if (!this.rotationIndicator) {
                this.setIndicator(isCW.value);
            }
        });

        this.on('end-effect', ({ effect }) => {
            this.rotationIndicator?.dispose();
        });

        this.on('dispose', () => {
            this.rotationIndicator?.dispose();
        });
    }

    setIndicator(isCW: boolean) {
        this.rotationIndicator?.dispose();
        const arrowMat = new Bab.StandardMaterial('arrow-mat', this.collection.scene);
        if (isCW) {
            // arrowMat.diffuseColor = new Bab.Color3(0.1803921568627451, 0.3058823529411765, 0.6196078431372549);
            arrowMat.diffuseColor = Bab.Color3.Black();
            arrowMat.emissiveColor = new Bab.Color3(0.1607843137254902, 0.08235294117647059, 0.054901960784313725);
        } else {
            // arrowMat.diffuseColor = new Bab.Color3(0.1803921568627451, 0.3058823529411765, 0.6196078431372549);
            arrowMat.diffuseColor = Bab.Color3.Black();
            // arrowMat.emissiveColor = new Bab.Color3(0.15, 0.185, 0.55);
            arrowMat.emissiveColor = new Bab.Color3(0.047058823529411764, 0.07450980392156863, 0.1803921568627451);
        }
        const arrowOptions = {
            tessellation: 3,
            diameter: 1.5,
            height: 0.2,
        };

        const empty = new Bab.Mesh('m3s-infernal-spin-rotation-indicator');
        const makeArrow = (name: string, options?: any) => {
            let arrow = Bab.MeshBuilder.CreateCylinder(`arrow-${name}`, {
                ...arrowOptions,
                ...options,
            });
            this.collection.addGlow(arrow);
            arrow.material = arrowMat;
            arrow.rotation.x = Math.PI / 2;
            if (isCW) {
                arrow.rotation.y = degToRads(180);
            }
            arrow.position.z += -4.35;
            arrow.bakeCurrentTransformIntoVertices();
            arrow.setParent(empty);
            return arrow;
        }

        const gap = isCW ? -16 : 16;
        const arrow1 = makeArrow('1');
        const arrow2 = makeArrow('2', { diameter: 1.375 });
        arrow2.rotation.y += degToRads(gap);
        const arrow3 = makeArrow('3', { diameter: 1.25 });
        arrow3.rotation.y += degToRads(gap * 2);

        const arrow4 = makeArrow('4');
        arrow4.rotation.y += degToRads(180);
        const arrow5 = makeArrow('5', { diameter: 1.375 });
        arrow5.rotation.y += degToRads(180 + gap);
        const arrow6 = makeArrow('6', { diameter: 1.25 });
        arrow6.rotation.y += degToRads(180 + gap * 2);

        const animFrames = 30;
        const animRotate = new Bab.Animation('spinAnimation', 'rotation.y', animFrames,
            Bab.Animation.ANIMATIONTYPE_FLOAT,
            Bab.Animation.ANIMATIONLOOPMODE_CYCLE);
        animRotate.framePerSecond = 15;
        animRotate.setKeys([
            {
                frame: 0,
                value: 0
            }, {
                frame: animFrames,
                value: 2 * Math.PI * (isCW ? 1 : -1),
            }
        ])

        empty.position.y += 4.25;
        // empty.rotation.y += degToRads(45);
        empty.animations = [animRotate];
        this.collection.scene.beginAnimation(empty, 0, animFrames, true);
        this.rotationIndicator = empty;
        return empty;
    }
}

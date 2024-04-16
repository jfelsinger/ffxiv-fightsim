import * as Bab from '@babylonjs/core';

import Debug from 'debug';
const debug = Debug('game:utils:steering');


export type Force = {
    name: string
    vector: Bab.Vector3
    weight?: number
    priority?: number
};

export type SteeringOptions = {
    maxForce: number
    mass: number
    numSmoothingSamples: number


    arrivalThreshold: number
    avoidDistance: number
    collide: boolean
};

const DefaultSteeringOptions: SteeringOptions = {
    maxForce: 1.0,
    mass: 1.0,
    numSmoothingSamples: 20,

    arrivalThreshold: 100,
    avoidDistance: 120,
    collide: true,
} as const;

export class Steering {
    mesh: Bab.Mesh;
    game: Bab.Engine;
    options: SteeringOptions;

    steeringForce: Bab.Vector3 = Bab.Vector3.Zero();

    velocity: Bab.Vector3 = Bab.Vector3.Zero();
    forces: Force[] = [];

    vSamples: Bab.Vector3[] = [];

    get delta() {
        return this.game.getDeltaTime();
    }

    constructor(mesh: Bab.Mesh, game: Bab.Engine, options: Partial<SteeringOptions> = {}) {
        this.options = {
            ...DefaultSteeringOptions,
            ...options,
        };

        // this.maxForce = opts.maxForce;
        // this.numSmoothingSamples = opts.numSmoothingSamples;
        // this.mass = opts.mass;

        this.mesh = mesh;
        this.game = game;


        debug('Steering| ', mesh, options);
    }

    lookTowards(vec: Bab.Vector3, shouldSmooth = false) {
        let direction = this.mesh.position.clone().addInPlace(vec);
        direction.y = this.mesh.position.y;

        if (shouldSmooth) {
            if (this.vSamples.length == this.options.numSmoothingSamples) {
                this.vSamples.shift();
            }

            let c = vec.clone();
            c.y = this.mesh.position.y;
            this.vSamples.push(c);
            direction.setAll(0);

            const len = this.vSamples.length;
            for (let v = 0; v < len; v++) {
                direction.addInPlace(this.vSamples[v])
            }

            direction.scaleInPlace(1 / len)
            direction = this.mesh.position.clone().addInPlace(direction);
            direction.y = this.mesh.position.y;
        } else {
        }

        this.mesh.lookAt(direction);
        return this;
    }

    lookAtPosition(pos: Bab.Vector3) {
        this.mesh.lookAt(pos)
    }

    lookAtMesh(mesh: Bab.Mesh) {
        this.lookAtPosition(mesh.position)
    }

    lookWhereGoing(shouldSmooth = false) {
        let direction = this.mesh.position.clone().addInPlace(this.velocity);
        // direction.x += (Math.random() - 0.5) * 0.02;
        // direction.z += (Math.random() - 0.5) * 0.02;
        direction.y = this.mesh.position.y;

        if (shouldSmooth) {
            if (this.vSamples.length == this.options.numSmoothingSamples) {
                this.vSamples.shift();
            }

            let c = this.velocity.clone();
            // c.x += (Math.random() - 0.5) * 0.02;
            // c.z += (Math.random() - 0.5) * 0.02;
            c.y = this.mesh.position.y;
            this.vSamples.push(c);
            direction.setAll(0);

            const len = this.vSamples.length;
            for (let v = 0; v < len; v++) {
                direction.addInPlace(this.vSamples[v])
            }

            direction.scaleInPlace(1 / len)
            direction = this.mesh.position.clone().addInPlace(direction);
            direction.y = this.mesh.position.y;
        } else {
        }

        this.mesh.lookAt(direction);
        return this;
    }

    clampVector(vec: Bab.Vector3, max?: number) {
        max ??= this.options.maxForce;
        const i = max / vec.length();
        return vec.scaleInPlace(i < 1.0 ? i : 1.0);
    }

    update() {
        this.steeringForce = this.clampVector(this.steeringForce)
        // this.steeringForce.scaleInPlace(1 / this.mass);

        this.velocity.addInPlace(this.steeringForce);
        this.velocity = this.clampVector(this.velocity, this.options.maxForce * this.delta);
        this.velocity.y = 0;
        this.steeringForce.setAll(0);

        if (this.options.collide) {
            this.mesh.moveWithCollisions(this.velocity)
        } else {
            this.mesh.position.addInPlace(this.velocity)
        }

        this.forces = [];
    }

    applyForce(vector: Bab.Vector3) {
        this.forces.push({ vector, name: 'apply' });
        return this;
    }
}

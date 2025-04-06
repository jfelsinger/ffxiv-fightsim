const debug = Debug('game:utils:steering');

export type Force = {
    name: string
    vector: Bab.Vector3
    weight?: number
    priority?: number
    threshold?: number
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

    arrivalThreshold: 5,
    avoidDistance: 120,
    collide: false,
} as const;

export class Steering {
    mesh: Bab.Mesh;
    clock: Clock;
    options: SteeringOptions;

    steeringForce: Bab.Vector3 = Bab.Vector3.Zero();

    velocity: Bab.Vector3 = Bab.Vector3.Zero();
    forces: Force[] = [];

    vSamples: Bab.Vector3[] = [];

    get delta() {
        return this.clock.lastDelta;
    }

    constructor(mesh: Bab.Mesh, clock: Clock, options: Partial<SteeringOptions> = {}) {
        this.options = {
            ...DefaultSteeringOptions,
            ...options,
        };

        // this.maxForce = opts.maxForce;
        // this.numSmoothingSamples = opts.numSmoothingSamples;
        // this.mass = opts.mass;

        this.mesh = mesh;
        this.clock = clock;


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
        max ??= this.options.maxForce * this.delta;
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

    seek(target: Bab.Vector3, options?: Partial<Force>) {
        const threshold = options?.threshold || 0.2;
        target = target.clone();
        target.y = 0;
        let desired = target.subtract(this.mesh.position);
        desired.y = 0;

        const distance = Bab.Vector3.Distance(target, this.mesh.position);
        if (distance > threshold) {
            this.clampVector(desired.normalize());
            // this.steeringForce.addInPlace(desired);
            this.forces.push({ vector: this.steeringForce.add(desired), name: 'seek', ...options })
        } else {
            this.idle();
        }
    }

    seekWithArrive(target: Bab.Vector3, options?: Partial<Force>) {
        const threshold = options?.threshold || 0.2;
        target = target.clone();
        target.y = 0;

        const distance = Bab.Vector3.Distance(target, this.mesh.position);
        if (distance > this.options.arrivalThreshold) {
            let desired = target.subtract(this.mesh.position);
            desired.y = 0;
            desired.normalize();
            this.clampVector(desired);
            this.forces.push({ vector: this.steeringForce.add(desired), name: 'seekWithArrive', ...options })
        } else if (distance > threshold && distance < this.options.arrivalThreshold) {
            let desired = target.subtract(this.mesh.position);
            desired.y = 0;
            desired.normalize();
            desired = this.clampVector(desired);
            this.forces.push({ vector: this.steeringForce.add(desired).scaleInPlace((distance - threshold) / (this.options.arrivalThreshold - threshold)), name: 'seekWithArrive', ...options })
        } else {
            this.idle(options);
        }
    }

    persue(target: Bab.Vector3, velocity: Bab.Vector3, options?: Partial<Force>) {
        const threshold = options?.threshold || 0.5;
        target = target.clone();
        target.y = 0;

        const distance = Bab.Vector3.Distance(this.mesh.position, target);
        if (distance > 4.5) {
            const lookAheadTime = Bab.Vector3.Distance(this.mesh.position, target) / (this.options.maxForce * this.delta);
            const predictedTarget = target.add(velocity.clone().scaleInPlace(lookAheadTime / distance));
            this.seek(predictedTarget, { threshold, ...options });
        } else {
            this.seek(target, { threshold, ...options });
        }
    }

    idle(options?: Partial<Force>) {
        this.velocity.scaleInPlace(0);
        this.steeringForce.setAll(0);
        this.forces.push({ vector: this.steeringForce.clone(), name: 'idle', ...options })
    }

    applyForce(vector: Bab.Vector3, options?: Partial<Force>) {
        this.forces.push({ vector, name: 'apply', ...options });
        return this;
    }

    sortByPriority(arr: Force[]) {
        return arr.sort((a, b) => {
            return (b.priority || 1.0) - (a.priority || 1.0);
        });
    }

    animate() {
        // blend
        // this.forces.forEach(f => {
        //     this.steeringForce = this.steeringForce.add(f.vector).scaleInPlace(f.weight || 0.5);
        // });

        // priority
        this.forces = this.sortByPriority(this.forces);
        let output = this.forces[0].vector;
        this.steeringForce = this.steeringForce.add(output);

        // probability

        // truncated

        // add
        // this.forces.forEach(f => {
        //     this.steeringForce = this.steeringForce.add(f.vector);
        // });

        this.update();
    }
}

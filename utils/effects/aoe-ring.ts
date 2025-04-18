import createAoeMat from '../../materials/roundAoe';

export type AoeRingEffectOptions = EffectOptions & {
    innerRadius?: number | string
    outerRadius?: number | string

    segments?: number | string
    thetaStart?: number | string
    thetaLength?: number | string

    angle?: number | string
    direction?: number | string
};

export class AoeRingEffect extends Effect {
    options: AoeRingEffectOptions;
    name = 'aoe-ring';
    innerRadius: number
    outerRadius: number

    thetaStart: number
    thetaLength: number
    segments: number

    constructor(options: AoeRingEffectOptions) {
        super(options);
        this.options = options;
        this.innerRadius = parseNumber(options.innerRadius ?? 1);
        this.outerRadius = parseNumber(options.outerRadius || 5);


        if (options.angle) {
            this.thetaLength = degToRads(parseNumber(options.angle));
        } else {
            this.thetaLength = parseNumber(options.thetaLength || Math.PI * 2);
        }

        if (options.direction || options.direction === 0) {
            this.thetaStart = degToRads(parseNumber(options.direction)) - (this.thetaLength / 2);
        } else {
            this.thetaStart = parseNumber(options.thetaStart ?? 0);
        }

        this.segments = parseNumber(options.segments || (Math.floor(this.thetaLength / (Math.PI / 12)) + 1));
        this.segments = Math.max(Math.floor(this.thetaLength / Math.PI + 1), this.segments);
    }

    async startup() {
        await super.startup();
        this.mesh = this.makeAoe().ring;
    }

    checkMeshCollision(target: Bab.Mesh) {
        const mesh = this.mesh;
        if (!mesh || !target) {
            return false;
        }

        // subtract aoe pos from mesh pos to get local coords of target
        const maxAngle = Math.PI * 2;
        const posX = target.absolutePosition.x - mesh.absolutePosition.x;
        const posY = target.absolutePosition.z - mesh.absolutePosition.z;

        const isDistanceWithin =
            isWithinRadius(posX, posY, yalmsToM(this.outerRadius)) &&
            !isWithinRadius(posX, posY, yalmsToM(this.innerRadius));

        if (!isDistanceWithin || this.thetaLength >= maxAngle) {
            return isDistanceWithin;
        }

        const posTheta = getVectorThetaLength(posX, posY);

        let startAngle = this.thetaStart;
        if (startAngle > maxAngle) startAngle -= Math.floor(this.thetaStart / maxAngle) * maxAngle;
        if (startAngle < maxAngle) startAngle += Math.ceil(-this.thetaStart / maxAngle) * maxAngle;

        const endAngle = startAngle + this.thetaLength;

        return (
            posTheta >= startAngle &&
            posTheta <= endAngle
        );
    }

    async cleanup() {
        this.mesh?.dispose()
        await super.cleanup();
    }

    makeAoe() {
        // const ringMat = createAoeMat(this.scene, Bab.Color3.FromInts(255, 150, 20), 'ringMat');
        const ringMat = createAoeMat(this.scene, this.getColor(), 'ringMat');
        ringMat.alpha = 0.7;
        if (this.collection.arena) {
            ringMat.setFloat('arenaRadius', this.collection.arena.adjustedSize / 2);
            ringMat.setInt('arenaIsSquare', this.collection.arena.shape === 'square' ? 1 : 0);
        }

        ringMat.setFloat('telegraph', this.adjustedTelegraph);
        ringMat.setFloat('elapsed', this.getDurationPercent());
        this.on('tick', ({ time, durationPercent, telegraph }) => {
            ringMat.setFloat('time', time);
            ringMat.setFloat('telegraph', telegraph);
            ringMat.setFloat('elapsed', durationPercent);
        });

        const innerRadius = yalmsToM(this.innerRadius);
        const outerRadius = yalmsToM(this.outerRadius);
        const ring = createRingMesh('ring-aoe', {
            innerRadius,
            outerRadius,
            thetaSegments: this.segments,
            thetaStart: this.thetaStart,
            thetaLength: this.thetaLength,
        }, this.scene);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.01;
        ring.bakeCurrentTransformIntoVertices();
        ring.position = this.getPosition() || Bab.Vector3.Zero();
        ring.material = ringMat;
        ring.checkCollisions = true;

        return {
            ring,
        };
    }
}

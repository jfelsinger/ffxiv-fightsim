export type IndicatorOptions = {
    size?: number
    label?: string
    color?: Bab.Color3

    position?: PositionOption
    positionType?: EffectPositionType
    followPosition?: boolean
};

export class Indicator {
    label?: string
    mesh: Bab.Mesh

    get material() { return this.mesh.material as Bab.StandardMaterial; }

    get uniqueId() {
        return this.mesh?.uniqueId;
    }

    get position(): Bab.Vector3 {
        return this.mesh.position;
    }

    set position(pos: Bab.Vector3) {
        if (this.mesh) {
            this.mesh.position = pos;
        }
    }

    get color(): Bab.Color3 {
        return this.material.diffuseColor;
    }

    set color(color: Bab.Color3) {
        if (this.material) {
            this.material.diffuseColor = color;
        }
    }

    get alpha(): number {
        return this.material.alpha;
    }

    set alpha(alpha: number) {
        if (this.material) {
            this.material.alpha = alpha;
        }
    }

    constructor(options: IndicatorOptions, collection: FightCollection) {
        const discMat = new Bab.StandardMaterial('indicator-mat', collection.scene);
        discMat.diffuseColor = options.color || Bab.Color3.Green();
        discMat.alpha = 0.49;

        const disc = Bab.MeshBuilder.CreateDisc('marker', {
            radius: yalmsToM(options.size || 2.5),
        }, collection.scene);
        disc.rotation.x = Math.PI / 2;
        disc.position.y = 0.03;
        disc.bakeCurrentTransformIntoVertices();
        disc.material = discMat;
        disc.position = getPosition(
            options.position,
            options.positionType,
            collection
        );

        this.mesh = disc;
    }

    playerIsInPosition(player: Character | undefined, radius = 1.5) {
        const colliderPosition = player?.collider?.absolutePosition;
        const position = this.mesh.absolutePosition;
        if (colliderPosition) {
            return isWithinRadius(
                position.x - colliderPosition.x,
                position.z - colliderPosition.z,
                radius
            );
        }

        return false;
    }

    dispose() {
        this.mesh.dispose();
    }
}

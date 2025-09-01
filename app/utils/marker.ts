export type MarkerOptions = {
    name?: string
    label: string
    position: PositionOption
    positionType: PositionType
}

export class Marker {
    fight: Fight;
    options: MarkerOptions;

    mesh?: Bab.Mesh;

    constructor(fight: Fight, options: MarkerOptions) {
        this.fight = fight;
        this.options = options;

        this.fight.on('dispose', () => {
            this.dispose();
        });
    }

    createMesh() {
        const mesh = new Bab.Mesh(
            `${this.options.name || 'marker'}-${this.options.label}`,
            this.fight.collection.scene
        )

        this.mesh = mesh;

        return {
            mesh,
        };
    }

    dispose() {
        this.mesh?.dispose();
    }

    getPosition() {
        return getPosition(
            this.options.position,
            this.options.positionType,
            this.fight.collection
        )
    }
}

import * as Bab from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import getArenaBoundsMat from '../../materials/arenaBounds';

export type ArenaShape = 'round' | 'ring' | 'square';
export type ArenaOptions = {
    yalms: number
    shape?: ArenaShape
    tessellation?: number
    globalFloor?: boolean
    floorType?: string
    sizeAdjustment?: string
    collection: FightCollection
}

export class Arena {
    name: string;
    yalms: number;
    scene: Bab.Scene;
    shape: ArenaShape;
    collection: FightCollection;
    floorType: string;
    tessellation: number;
    options: ArenaOptions;

    floor: Bab.Mesh;
    globalFloor?: Bab.Mesh;
    boundary?: Bab.Mesh;
    camCollider?: Bab.Mesh;

    get size() {
        return yalmsToM(this.yalms);
    }

    get adjustedSize() {
        return this.size * (+(this.options?.sizeAdjustment || 1));
    }

    dispose() {
        this.floor?.dispose();
        this.globalFloor?.dispose();
        this.boundary?.dispose();
        this.camCollider?.dispose();
    }

    getPosition(vec: Bab.Vector3) {
        const size = this.size / 2;
        const result = vec.multiply(new Bab.Vector3(size, 1, size));

        if (this?.floor?.position) {
            result.addInPlace(this.floor.position);
        }

        return result;
    }

    constructor(name: string, options: ArenaOptions, scene: Bab.Scene) {
        this.options = options;
        this.name = name;
        this.scene = scene;
        this.yalms = options.yalms;
        this.shape = options.shape || 'round';
        this.tessellation = options.tessellation || 32;
        this.collection = options.collection;
        this.floorType = options.floorType || 'default';

        const arenaMat = this.makeArenaMat();
        const { floor, boundary } = this.makeFloor(arenaMat);
        floor.alphaIndex = 2;
        this.floor = floor;
        this.boundary = boundary;

        if (options.globalFloor) {
            const globalFloorResult = this.makeGlobalFloor();
            this.globalFloor = globalFloorResult?.globalFloor;
        }
        this.makeCamCollider();
    }

    toJSON() {
        const results = getBasicValues(this.options);
        return {
            name: this.name,
            ...results,
        }
    }

    makeGlobalFloor() {
        const gridMat = new GridMaterial('global-ground-mat', this.scene);
        let c = 0.83;
        gridMat.mainColor = new Bab.Color3(c, c, c + 0.075)
        c = 0.8;
        gridMat.lineColor = new Bab.Color3(c, c, c)
        gridMat.gridRatio = yalmsToM(1); // Make the grid display in yalms
        gridMat.majorUnitFrequency = 5; // 5 yalms
        const gridSize = yalmsToM(15 * 50);

        const gridFloor = Bab.MeshBuilder.CreateDisc('global-ground', { radius: gridSize }, this.scene);
        gridFloor.checkCollisions = false;
        gridFloor.rotation.x = Math.PI / 2;
        gridFloor.material = gridMat;
        gridFloor.bakeCurrentTransformIntoVertices();
        gridFloor.alphaIndex = 1;

        return {
            globalFloor: gridFloor,
        }
    }

    makeFloor(mat: Bab.Material, shape?: ArenaShape): { floor: Bab.Mesh, boundary?: Bab.Mesh } {
        switch (shape || this.shape) {
            case 'round':
                return this.makeRoundFloor(mat)
            case 'ring':
                return this.makeRingFloor(mat)
            case 'square':
            default:
                return this.makeSquareFloor(mat)
        }
    }

    isPositionWithinBoundary(position: Bab.Vector3) {
        if (this.shape === 'round') {
            const size = this.size;
            const radius = size / 2;
            if (position.length() < radius) {
                return true;
            }
        }

        return true;
    }

    makeSquareFloor(mat: Bab.Material): { floor: Bab.Mesh, boundary?: Bab.Mesh } {
        const size = this.size;
        const floor = Bab.MeshBuilder.CreateGround(`${this.name}Floor`, { width: size, height: size }, this.scene);
        floor.checkCollisions = false;
        floor.position.y += 0.001
        floor.material = mat;

        const boundaryMat = this.makeBoundaryMat();
        const height = size / 10;
        // const boundary = Bab.MeshBuilder.CreateBox(`${this.name}Bounds`, {
        //     width: size,
        //     depth: size,
        //     height,
        //     sideOrientation: Bab.Mesh.DOUBLESIDE,
        //     faceUV: [
        //         new Bab.Vector4(0, 0, 1, 1),
        //         new Bab.Vector4(0, 0, 1, 1),
        //         new Bab.Vector4(0, 0, 1, 1),
        //         new Bab.Vector4(0, 0, 1, 1),
        //         new Bab.Vector4(1, 1, 1, 1),
        //         new Bab.Vector4(1, 1, 1, 1),
        //     ],
        //     frontUVs: new Bab.Vector4(0, 0, 1, 1),
        //     backUVs: new Bab.Vector4(0, 0, 1, 1),
        //     wrap: true,
        // }, this.scene);
        // boundary.checkCollisions = false;
        // boundary.position.y += height / 2;
        // boundary.material = boundaryMat;
        const boundary = Bab.MeshBuilder.CreateCylinder(`${this.name}Bounds`, {
            tessellation: 4,
            diameter: size * (Math.PI / 2),
            height,
            sideOrientation: Bab.Mesh.DOUBLESIDE,
            faceUV: [
                new Bab.Vector4(1, 1, 1, 1),
                new Bab.Vector4(0, 0, 1, 1),
                new Bab.Vector4(1, 1, 1, 1),
            ],
            frontUVs: new Bab.Vector4(0, 0, 1, 1),
            backUVs: new Bab.Vector4(0, 0, 1, 1),
        }, this.scene);
        boundary.checkCollisions = false;
        boundary.position.y += height / 2;
        boundary.position.z += 0;
        boundary.material = boundaryMat;
        boundary.alphaIndex = 2;
        boundary.rotation.y = Math.PI / 4;

        return { floor, boundary };
    }

    makeRoundFloor(mat: Bab.Material): { floor: Bab.Mesh, boundary?: Bab.Mesh } {
        const tessellation = this.tessellation;
        const size = this.size;
        const floor = Bab.MeshBuilder.CreateDisc(`${this.name}Floor`, { radius: size / 2, tessellation }, this.scene);
        floor.rotation.x = Math.PI / 2;
        floor.bakeCurrentTransformIntoVertices();
        floor.checkCollisions = false;
        floor.position.y += 0.001
        floor.material = mat;


        const boundaryMat = this.makeBoundaryMat();
        const height = size / 10;
        const boundary = Bab.MeshBuilder.CreateCylinder(`${this.name}Bounds`, {
            tessellation,
            diameter: size,
            height,
            sideOrientation: Bab.Mesh.DOUBLESIDE,
            faceUV: [
                new Bab.Vector4(1, 1, 1, 1),
                new Bab.Vector4(0, 0, 1, 1),
                new Bab.Vector4(1, 1, 1, 1),
            ],
            frontUVs: new Bab.Vector4(0, 0, 1, 1),
            backUVs: new Bab.Vector4(0, 0, 1, 1),
        }, this.scene);
        boundary.checkCollisions = false;
        boundary.position.y += height / 2;
        boundary.position.z += 0;
        boundary.material = boundaryMat;
        boundary.alphaIndex = 2;

        return { floor, boundary };
    }

    makeRingFloor(mat: Bab.Material): { floor: Bab.Mesh, boundary?: Bab.Mesh } {
        const size = this.size;
        const floor = Bab.MeshBuilder.CreateDisc(`${this.name}Floor`, { radius: size / 2 }, this.scene);
        floor.rotation.x = Math.PI / 2;
        floor.bakeCurrentTransformIntoVertices();
        floor.checkCollisions = false;
        floor.position.y += 0.001
        floor.material = mat;
        return { floor };
    }

    makeBoundaryMat() {
        const boundaryMat = getArenaBoundsMat(this.scene);
        boundaryMat.alpha = 0.39;
        let time = 0;
        this.scene.registerAfterRender(() => {
            const charPos = this.collection?.player?.position ?? Bab.Vector3.Zero();
            boundaryMat.setFloat('time', time)
            boundaryMat.setArray3('characterPosition', [charPos.x, charPos.y, charPos.z])
            time += 0.1;
        })
        return boundaryMat;
    }

    makeArenaMat() {
        const matFunction: ((scene: Bab.Scene) => Bab.Material) = (arenaMats as any)[this.floorType] || arenaMats.default;

        const arenaMat = matFunction(this.scene);
        return arenaMat;
    }

    makeCamCollider() {
        this.camCollider = Bab.MeshBuilder.CreateGround('ground', { width: 2600, height: 2600 }, this.scene);
        this.camCollider.checkCollisions = true;
        this.camCollider.isVisible = false;
        return this.camCollider;
    }
}

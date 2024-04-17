import * as Bab from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import getArenaBoundsMat from '../materials/arenaBounds';

import { yalmsToM } from './conversions';

export type ArenaShape = 'round' | 'ring' | 'square';
export type ArenaOptions = {
    yalms: number
    shape?: ArenaShape
    tessellation?: number
}

export class Arena {
    name: string;
    yalms: number;
    scene: Bab.Scene;
    shape: ArenaShape;

    floor: Bab.Mesh;
    boundary?: Bab.Mesh;
    camCollider?: Bab.Mesh;
    tessellation: number

    constructor(name: string, options: ArenaOptions, scene: Bab.Scene) {
        this.name = name;
        this.scene = scene;
        this.yalms = options.yalms;
        this.shape = options.shape || 'round';
        this.tessellation = options.tessellation || 32;

        const arenaMat = this.makeArenaMat();
        const { floor, boundary } = this.makeFloor(arenaMat);
        this.floor = floor;
        this.boundary = boundary;

        this.makeCamCollider();
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

    makeSquareFloor(mat: Bab.Material): { floor: Bab.Mesh, boundary?: Bab.Mesh } {
        const size = yalmsToM(this.yalms);
        const floor = Bab.MeshBuilder.CreateGround(`${this.name}Floor`, { width: size, height: size }, this.scene);
        floor.checkCollisions = false;
        floor.position.y += 0.001
        floor.material = mat;

        const boundaryMat = this.makeBoundaryMat();
        const height = size / 10;
        const boundary = Bab.MeshBuilder.CreateBox(`${this.name}Bounds`, {
            width: size,
            depth: size,
            height,
            sideOrientation: Bab.Mesh.DOUBLESIDE,
            faceUV: [
                new Bab.Vector4(0, 0, 1, 1),
                new Bab.Vector4(0, 0, 1, 1),
                new Bab.Vector4(0, 0, 1, 1),
                new Bab.Vector4(0, 0, 1, 1),
                new Bab.Vector4(1, 1, 1, 1),
                new Bab.Vector4(1, 1, 1, 1),
            ],
            frontUVs: new Bab.Vector4(0, 0, 1, 1),
            backUVs: new Bab.Vector4(0, 0, 1, 1),
            wrap: true,
        }, this.scene);
        boundary.checkCollisions = false;
        boundary.position.y += height / 2;
        boundary.material = boundaryMat;

        return { floor, boundary };
    }

    makeRoundFloor(mat: Bab.Material): { floor: Bab.Mesh, boundary?: Bab.Mesh } {
        const tessellation = this.tessellation;
        const size = yalmsToM(this.yalms);
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
        boundary.material = boundaryMat;

        return { floor };
    }

    makeRingFloor(mat: Bab.Material): { floor: Bab.Mesh, boundary?: Bab.Mesh } {
        const size = yalmsToM(this.yalms);
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
        let time = 0;
        this.scene.registerAfterRender(() => {
            boundaryMat.setFloat('time', time)
            time += 0.1;
        })
        return boundaryMat;
    }

    makeArenaMat() {
        const arenaMat = new GridMaterial('arenaMat', this.scene);
        let c = 0.85;
        arenaMat.mainColor = new Bab.Color3(c, c, c + 0.075)
        c = 0.735;
        arenaMat.lineColor = new Bab.Color3(c, c, c)
        arenaMat.gridRatio = yalmsToM(1); // Make the grid display in yalms
        arenaMat.majorUnitFrequency = 5; // 5 yalms
        return arenaMat;
    }

    makeCamCollider() {
        this.camCollider = Bab.MeshBuilder.CreateGround('ground', { width: 2600, height: 2600 }, this.scene);
        this.camCollider.checkCollisions = true;
        this.camCollider.isVisible = false;
        return this.camCollider;
    }
}

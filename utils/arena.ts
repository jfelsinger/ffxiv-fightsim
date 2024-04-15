import * as Bab from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';

import { yalmsToM } from './conversions';

export type ArenaOptions = {
    yalms: number
}

export class Arena {
    name: string;
    yalms: number;
    scene: Bab.Scene;

    floor: Bab.Mesh;
    camCollider?: Bab.Mesh;

    constructor(name: string, options: ArenaOptions, scene: Bab.Scene) {
        this.name = name;
        this.scene = scene;
        this.yalms = options.yalms;

        const arenaMat = new GridMaterial('arenaMat', this.scene);
        let c = 0.85;
        arenaMat.mainColor = new Bab.Color3(c, c, c + 0.075)
        c = 0.735;
        arenaMat.lineColor = new Bab.Color3(c, c, c)
        arenaMat.gridRatio = yalmsToM(1); // Make the grid display in yalms
        arenaMat.majorUnitFrequency = 5; // 5 yalms
        const size = yalmsToM(this.yalms);
        const floor = Bab.MeshBuilder.CreateGround('arena', { width: size, height: size }, this.scene);
        floor.checkCollisions = false;
        floor.position.y += 0.001
        floor.material = arenaMat;
        this.floor = floor;

        this.makeCamCollider();
    }

    makeCamCollider() {
        this.camCollider = Bab.MeshBuilder.CreateGround('ground', { width: 2600, height: 2600 }, this.scene);
        this.camCollider.checkCollisions = true;
        this.camCollider.isVisible = false;
        return this.camCollider;
    }
}

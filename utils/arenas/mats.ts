import * as Bab from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import { yalmsToM } from '../conversions';

export const arenaMats = {
    'default': arenaGridMat,
    'grid': arenaGridMat,
    'image': imageArenaMat,
    'e12s': e12sArenaMat,
} as const;

export function arenaGridMat(scene: Bab.Scene) {
    const arenaMat = new GridMaterial('gridArenaMat', scene);

    let c = 0.85;
    arenaMat.mainColor = new Bab.Color3(c, c, c + 0.075)

    c = 0.735;
    arenaMat.lineColor = new Bab.Color3(c, c, c)
    arenaMat.gridRatio = yalmsToM(1); // Make the grid display in yalms
    arenaMat.majorUnitFrequency = 5; // 5 yalms

    return arenaMat;
}

export function imageArenaMat(scene: Bab.Scene, options: { name?: string, image: string }) {
    const mat = new Bab.StandardMaterial(options.name || 'imageArenaMat', scene);
    mat.diffuseTexture = new Bab.Texture(options.image, scene, undefined, false);
    return mat;
}

export function e12sArenaMat(scene: Bab.Scene) {
    const mat = imageArenaMat(scene, {
        name: 'e12sArenaMat',
        image: '/images/fights/e12s/arena.png',
    })
    mat.diffuseTexture!.hasAlpha = true;
    mat.specularColor = new Bab.Color3(0, 0, 0.05);
    return mat;
}

export default arenaMats;

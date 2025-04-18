import { GridMaterial } from '@babylonjs/materials';
import { default as createPolarGrid } from '../../materials/polarGrid';
import { default as createP9SGrid } from '../../materials/p9s';

export const arenaMats = {
    'default': arenaGridMat,
    'grid': arenaGridMat,
    'image': imageArenaMat,
    'e12s': e12sArenaMat,
    'm2s': m2sArenaMat,
    'm3s': m3sArenaMat,
    'm4s': m4sArenaMat,
    'm2s-2': m2sStage2ArenaMat,
    'p9s': p9sArenaMat,
    'polar': polarArenaMat,
    'polar-grid': polarArenaMat,
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

export function m2sArenaMat(scene: Bab.Scene) {
    const mat = imageArenaMat(scene, {
        name: 'm2sArenaMat',
        image: '/images/fights/m2s/arena.png',
    })
    mat.diffuseTexture!.hasAlpha = true;
    mat.specularColor = new Bab.Color3(0, 0, 0.05);
    return mat;
}

export function m3sArenaMat(scene: Bab.Scene) {
    const mat = imageArenaMat(scene, {
        name: 'm3sArenaMat',
        image: '/images/fights/m3s/arena.jpeg',
    })
    mat.diffuseTexture!.hasAlpha = true;
    mat.specularColor = new Bab.Color3(0, 0, 0.05);
    return mat;
}

export function m4sArenaMat(scene: Bab.Scene) {
    const mat = imageArenaMat(scene, {
        name: 'm4sArenaMat',
        image: '/images/fights/m4s/arena.png',
    })
    mat.diffuseTexture!.hasAlpha = true;
    mat.diffuseColor = new Bab.Color3(0.8784313725490196, 0.615686274509804, 0.615686274509804);// (HEX : #E09D9D , debugNode as BABYLON.StandardMaterial)
    mat.specularColor = new Bab.Color3(0.44313725490196076, 0.5450980392156862, 0.7411764705882353);// (HEX : #718BBD , debugNode as BABYLON.StandardMaterial)
    mat.specularPower = 91.3;// (debugNode as BABYLON.StandardMaterial)
    mat.emissiveColor = new Bab.Color3(0.6784313725490196, 0.3803921568627451, 0.3803921568627451);// (HEX : #AD6161 , debugNode as BABYLON.StandardMaterial)
    return mat;
}

export function m2sStage2ArenaMat(scene: Bab.Scene) {
    const mat = imageArenaMat(scene, {
        name: 'm2sStage2ArenaMat',
        image: '/images/fights/m2s/arena-2.png',
    })
    mat.diffuseTexture!.hasAlpha = true;
    mat.specularColor = new Bab.Color3(0, 0, 0.05);
    return mat;
}

export function polarArenaMat(scene: Bab.Scene) {
    const mat = createPolarGrid(scene);
    return mat;
}

export function p9sArenaMat(scene: Bab.Scene) {
    const mat = createP9SGrid(scene);
    return mat;
}

export default arenaMats;

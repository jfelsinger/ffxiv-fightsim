<script setup lang="ts">
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import { Engine, Scene, FreeCamera, Vector3 } from '@babylonjs/core';
import * as Bab from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import PixelateShader from '../materials/pixelate';
import createMarkerMat from '../materials/marker';
import createAoeMat from '../materials/standardAoe';
import { Steering } from '../utils/steering';

(window as any).Bab = Bab;

import Debug from 'debug';
const debug = Debug('game');

const canvas = ref<HTMLCanvasElement>();
let game: Engine | undefined;

function yalmsToM(y: number) {
    return y * 0.86868
}

function mToYalms(m: number) {
    return m / 0.86868
}

function onResize() {
    if (game) {
        game.resize();
    }
}

function makeArena(scene: Scene, yalms = 90) {

    const arenaMat = new GridMaterial('arenaMat', scene);
    let c = 0.85;
    arenaMat.mainColor = new Bab.Color3(c, c, c + 0.075)
    c = 0.735;
    arenaMat.lineColor = new Bab.Color3(c, c, c)
    arenaMat.gridRatio = yalmsToM(1); // Make the grid display in yalms
    arenaMat.majorUnitFrequency = 5; // 5 yalms
    const size = yalmsToM(yalms);
    const arena = Bab.MeshBuilder.CreateGround('ground', { width: size, height: size }, scene);
    arena.checkCollisions = false;
    arena.position.y += 0.001
    arena.material = arenaMat;

    const gridMat = new GridMaterial('arenaMat', scene);
    c = 0.83;
    gridMat.mainColor = new Bab.Color3(c, c, c + 0.075)
    c = 0.8;
    gridMat.lineColor = new Bab.Color3(c, c, c)
    gridMat.gridRatio = yalmsToM(1); // Make the grid display in yalms
    gridMat.majorUnitFrequency = 5; // 5 yalms
    const gridSize = yalmsToM(15 * 50);
    const gridFloor = Bab.MeshBuilder.CreateDisc('ground', { radius: gridSize }, scene);
    gridFloor.checkCollisions = false;
    gridFloor.rotation.x = Math.PI / 2;
    gridFloor.material = gridMat;
    gridFloor.bakeCurrentTransformIntoVertices();

    const ground = Bab.MeshBuilder.CreateGround('ground', { width: 2600, height: 2600 }, scene);
    ground.checkCollisions = true;
    ground.isVisible = false;

    return {
        platform: arena,
        ground,
    }
}

function makeAoe(scene: Scene, yalms = 15) {
    const discMat = createAoeMat(scene, Bab.Color3.FromInts(255, 150, 20), 'discMat');
    discMat.alpha = 0.7;
    const disc = Bab.MeshBuilder.CreateDisc('area', { radius: yalmsToM(yalms) }, scene);
    disc.position.y = 0.01;
    disc.material = discMat;
    disc.rotation.x = Math.PI / 2;
    disc.checkCollisions = true;

    return {
        disc,
    }
}

function makeCharacter(scene: Scene, game: Engine) {
    const charMat = new Bab.StandardMaterial('charMat', scene);
    charMat.diffuseColor = new Bab.Color3(0.2, 0.6, 1.0);
    charMat.specularColor = new Bab.Color3(0.2, 0.1, 0.7);

    const invisMat = new Bab.StandardMaterial('mat', scene);
    invisMat.alpha = 0;

    // 5034ms / 30y; ~5s/30y
    // 168ms/y; 166.66ms/y
    const yalmsPerMs = 1 / (5034 / 30)
    // const yalmsPerMs = 1 / yalmsToM(166)
    // const yalmsPerMs = 1 / 166;
    const speed = yalmsToM(yalmsPerMs);
    debug('SPEED : ', yalmsPerMs, speed);

    // const speed = 0.03;
    const speedBack = 0.01;
    const speedRotation = 0.1;

    const height = 1.2125;
    const heads = 6.25;

    // The body
    const torsoHeight = height * ((heads - 1) / heads);
    const char = Bab.MeshBuilder.CreateCylinder('char', {
        tessellation: 3,
        height: (torsoHeight * 0.945) * 0.75,
        diameterTop: height / (heads / 1.325),
        diameterBottom: height / (heads / 3),
    }, scene);
    char.material = charMat;
    char.position.y = (torsoHeight * 1.20) / 2;
    char.checkCollisions = false;
    char.isPickable = false;

    const collider = Bab.MeshBuilder.CreateCylinder('charCollider', {
        tessellation: 3,
        height: (height * 3),
        diameter: 0.015,
    }, scene);
    collider.material = invisMat;
    collider.position.y = 0;
    collider.checkCollisions = true;

    // The Head
    const sphere = Bab.MeshBuilder.CreateSphere('sphere', { diameter: height * (1.25 / heads), segments: 32 }, scene);
    sphere.position.y = height;
    sphere.position.y -= (height * (1 / heads)) / 2;
    sphere.material = charMat;
    // sphere.position.y += hheads;
    // sphere.material = PixelateShader(scene);
    sphere.setParent(char);
    sphere.checkCollisions = false;
    sphere.isPickable = false;

    const camMarker = Bab.MeshBuilder.CreatePlane('camHead', { width: 0.01, height: 0.01 }, scene);
    camMarker.setParent(char);
    camMarker.position.y = height;
    camMarker.position.y += 0.65;
    camMarker.rotation.y = Math.PI / 2;
    camMarker.checkCollisions = false;
    camMarker.isPickable = false;
    // camMarker.material = invisMat;
    camMarker.setEnabled(false); // Hide it!
    (window as any).camMarker = camMarker;

    const markerSize = yalmsToM(1.25);
    const markerMat = createMarkerMat(scene, charMat.diffuseColor);
    const marker = Bab.MeshBuilder.CreatePlane('charMarker', { height: markerSize, width: markerSize }, scene);
    marker.material = markerMat;
    marker.rotation.x = Math.PI / 2;

    collider.setParent(marker);
    char.setParent(marker);
    marker.rotation.z = Math.PI / 2;
    marker.position.y += 0.05;
    marker.bakeCurrentTransformIntoVertices();
    marker.checkCollisions = true;
    marker.isPickable = false;
    marker.position.y += 0.05;

    const steering = new Steering(marker, game);
    marker.position.z -= yalmsToM(15);

    return {
        collider,
        steering,
        body: char,
        head: sphere,
        marker,
        camMarker,

        speed,
        speedBack,
        speedRotation,
    }
}

function makeScene(game: Engine) {
    const scene = new Scene(game);
    scene.environmentTexture = Bab.CubeTexture.CreateFromPrefilteredData('/tex/basic-sky.env', scene);

    const inputMap: Partial<Record<string, boolean>> = {};
    scene.actionManager = new Bab.ActionManager(scene);
    scene.actionManager.registerAction(new Bab.ExecuteCodeAction(Bab.ActionManager.OnKeyDownTrigger, (evt) => {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
    }));
    scene.actionManager.registerAction(new Bab.ExecuteCodeAction(Bab.ActionManager.OnKeyUpTrigger, (evt) => {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
    }));

    const skydome = Bab.MeshBuilder.CreateBox('sky', { size: 5000, sideOrientation: Bab.Mesh.BACKSIDE }, scene);
    skydome.position.y = 100;
    skydome.isPickable = false;
    skydome.receiveShadows = true;

    const sky = new Bab.BackgroundMaterial('skyMaterial', scene);
    sky.reflectionTexture = scene.environmentTexture.clone();
    sky.reflectionTexture!.coordinatesMode = Bab.Texture.SKYBOX_MODE;
    sky.enableGroundProjection = true
    sky.projectedGroundRadius = 1000;
    // sky.projectedGroundHeight = 150;
    sky.projectedGroundHeight = 10;
    skydome.material = sky;

    const camera = new Bab.ArcRotateCamera('cam1', 0, 0, 15.5, new Vector3(0, -7.5, -1.15 - yalmsToM(15)), scene);
    (window as any).cam = camera;
    // camera.radius = -30;
    // camera.heightOffset = 11;
    // camera.rotationOffset = 38;
    // camera.cameraAcceleration = 0.05;
    // camera.maxCameraSpeed = 15;
    // camera.lowerHeightOffsetLimit = 1;
    // camera.upperRadiusLimit = 12;
    // camera.setTarget(Vector3.Zero());
    // camera.setTarget(new Vector3(0, 50, 0));
    // camera.setPosition(new Vector3(0, 50, 20));
    // camera.lockedTarget = new Vector3(0, 20, 0);
    camera.upperBetaLimit = Math.PI / 1.5;
    camera.lowerRadiusLimit = 1.5;
    camera.checkCollisions = true;
    camera.collisionRadius = new Vector3(0.05, 0.05, 0.05);
    // camera.setTarget(new Vector3(0, 3, 0));
    (camera as any).attachControl(null, true, true, 1);

    const inputManager = camera.inputs;
    (inputManager.attached as any).mousewheel.wheelPrecision = 25;
    // inputManager.attached.pointers.buttons = [0,1,2];
    (window as any).inputManager = inputManager;

    scene.activeCamera = camera;

    const light = new Bab.HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;



    const aoe = makeAoe(scene);
    scene.collisionsEnabled = true;
    const character = makeCharacter(scene, game);
    camera.setTarget(character.camMarker.position.clone());
    camera.lockedTarget = character.camMarker;

    function setMarkerHeight() {
        const maxHeight = 2.95;
        // const minDist = 14.65;
        const minDist = 17.65;
        const maxDist = 35 - minDist;
        const distance = Math.max(0, camera.position.subtract(character.camMarker.position).length() - minDist);
        character.camMarker.position.y = character.head.position.y;
        character.camMarker.position.y += maxHeight * (distance / maxDist);
    }

    scene.onPointerObservable.add(() => {
        // setMarkerHeight();
    });

    character.marker.onCollideObservable.add(function (otherMesh) {
        debug('marker collided with: ', otherMesh.name, arguments);
    });

    character.collider.onCollideObservable.add(function (otherMesh) {
        debug('collider collided with: ', otherMesh.name, arguments);
    });

    let isColliding = false;
    let collisionTime = Date.now();
    scene.onBeforeRenderObservable.add(() => {
        let keydown = false;
        const movement = new Bab.Vector3(0, 0, 0);
        const delta = game.getDeltaTime();
        setMarkerHeight();

        if (inputMap['w']) {
            // character.marker.moveWithCollisions(character.marker.forward.scaleInPlace(character.speed));
            const direction = camera.getDirection(new Bab.Vector3(0, 0, 1))
            direction.y = 0;
            movement.addInPlace(direction.scaleInPlace(character.speed));
            // character.marker.position.addInPlace(direction.scaleInPlace(character.speed));
            keydown = true;
        } else if (inputMap['s']) {
            // character.marker.moveWithCollisions(character.marker.forward.scaleInPlace(-character.speedBack));
            const direction = camera.getDirection(new Bab.Vector3(0, 0, -1))
            direction.y = 0;
            movement.addInPlace(direction.scaleInPlace(character.speed));
            // character.marker.position.addInPlace(direction.scaleInPlace(-character.speedBack));
            keydown = true;
        }

        if (inputMap['a']) {
            // character.marker.rotate(Bab.Vector3.Up(), -character.speedRotation);

            const direction = camera.getDirection(new Bab.Vector3(-1, 0, 0))
            direction.y = 0;
            movement.addInPlace(direction.scaleInPlace(character.speed));
            // character.marker.position.addInPlace(direction.scaleInPlace(character.speed));
            keydown = true;
        } else if (inputMap['d']) {
            // character.marker.rotate(Bab.Vector3.Up(), character.speed);

            const direction = camera.getDirection(new Bab.Vector3(1, 0, 0))
            direction.y = 0;
            movement.addInPlace(direction.scaleInPlace(character.speed));
            // character.marker.position.addInPlace(direction.scaleInPlace(character.speed));
            keydown = true;
        }

        if (keydown) {
            movement.normalize();
            const currentDirection = character.marker.getDirection(Bab.Vector3.Forward());
            currentDirection.y = 0;
            currentDirection.normalize();

            // debug('delta: ', delta, character.speed * delta);
            character.marker.position.addInPlace(movement.scale(character.speed * delta));
            // character.marker.moveWithCollisions(movement.scale(character.speed * delta));

            character.steering.velocity = movement;
            character.steering.lookWhereGoing(true);
            if (character.collider.intersectsMesh(aoe.disc, false)) {
                if (!isColliding) {
                    isColliding = true;
                    collisionTime = Date.now();
                    debug('colission started!', collisionTime);
                }
            } else {
                if (isColliding) {
                    isColliding = false;
                    const now = Date.now();
                    debug('colission ended!', collisionTime, now, now - collisionTime);
                }
            }
        } else {
            const currentDirection = character.marker.getDirection(Bab.Vector3.Forward());
            currentDirection.y = 0;
            character.steering.velocity = movement.add(currentDirection);
            character.steering.lookWhereGoing(true);
        }
    });

    const height = 1.67;
    const heads = 6;
    const torsoHeight = height * ((heads - 1) / heads);
    const char2 = Bab.MeshBuilder.CreateCylinder('char2', {
        tessellation: 3,
        height: (torsoHeight * 0.945) * 0.75,
        diameterTop: height / (heads / 1.35),
        diameterBottom: height / (heads / 3),
    }, scene);
    char2.position.z = yalmsToM(25);
    char2.position.y = (torsoHeight * 1.20) / 2;

    const arena = makeArena(scene);

    return {
        scene, camera, light, character, arena
    }
}

onMounted(async () => {
    window.addEventListener('resize', onResize);
    nextTick(() => {
        debug('mount: ', canvas.value);
        if (canvas.value) {
            game = new Engine(canvas.value, true);
            debug('game: ', game);
            game.setHardwareScalingLevel(1.0);

            const { scene, aoe } = makeScene(game);
            game.runRenderLoop(() => {
                scene.render();
            });
        }
    });
});

onBeforeUnmount(async () => {
    window.removeEventListener('resize', onResize);
});
</script>

<template>
    <div id="game" class="relative max-w-screen max-h-screen game --babylon">
        <h1>Hello!</h1>
        <div class="absolute top-0 left-0 -z-10">
            <slot>
                <canvas class="bg-sky-100 w-screen h-screen" ref="canvas" id="gamecanvas"></canvas>
            </slot>
        </div>
    </div>
</template>

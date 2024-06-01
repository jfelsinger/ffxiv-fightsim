<script setup lang="ts">
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import { Engine, Scene, Vector3 } from '@babylonjs/core';
import * as Bab from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import createMarkerMat from '../materials/marker';
import { Steering } from '../utils/steering';
import { yalmsToM } from '../utils/conversions';
import { Arena } from '../utils/arena';
import { Character } from '../utils/character';
import { Clock } from '../utils/clock';
import { FightCollection } from '../utils/fight-collection';
import { effectsCollection } from '../utils/fight-effects/index';
import {
    TestAoeEffect,
} from '../utils/fight-effects/testaoe';
import {
    Fight,
    FightSection,
    Mechanic,
} from '../utils/effects';

(window as any).Bab = Bab;

function vectorAngle(v: Bab.Vector3) {
    let angle = Math.atan2(v.x, v.z);
    angle = 180 * angle / Math.PI;
    angle = (360 + (Math.round(angle * 10) / 10)) % 360;
    return angle;
}

import Debug from 'debug';
const debug = Debug('game');

const playerTimeScaling = ref(1.0);
const playerClock = new Clock({ scaling: playerTimeScaling.value });
const playerTime = useState<number>('playerTime', () => playerClock.time || 0);
playerClock.on('tick', (time) => { playerTime.value = time });
watch(playerTimeScaling, (scaling) => { playerClock.scaling = scaling });

const worldPaused = ref(false);
const worldTimeScaling = ref(1.0);
const worldClock = new Clock({ paused: worldPaused.value, scaling: worldTimeScaling.value });
const worldTime = useState<number>('worldTime', () => worldClock.time || 0);
worldClock.on('tick', (time) => { worldTime.value = time });
worldClock.start();
watch(worldTimeScaling, (scaling) => { worldClock.scaling = scaling });
watch(worldPaused, (isPaused) => {
    if (isPaused) {
        worldClock.pause();
    } else {
        worldClock.start();
    }
});

const canvas = ref<HTMLCanvasElement>();
let game: Engine | undefined;
const cameraDirection = ref(0);
const characterDirection = ref(0);

function onResize() {
    if (game) {
        game.resize();
    }
}

function createFight(collection: FightCollection) {

    // TODO: use a real effect
    const testEffect = new effectsCollection['aoe-disc']({
        position: new Bab.Vector3(0, 0, 0),
        duration: 1500,
        collection,
    });
    testEffect.on('start', () => { debug('effect:start'); });
    testEffect.on('end', () => { debug('effect:end'); });


    let startDelay = 0;
    let endDelay = 1500;
    let duration = 4500;
    const checkboard1: any[] = [];
    const checkboard2: any[] = [];

    const limit = 8 * 2;
    for (let i = 0; i < limit; i++) {
        for (let j = 0; j < limit; j++) {

            if (
                (i % 2 === 0 && j % 2 === 1) ||
                (i % 2 === 1 && j % 2 === 0)
            ) {
                const x = yalmsToM(2.5 + 5 * (i - limit / 2));
                const z = yalmsToM(2.5 + 5 * (j - limit / 2));
                checkboard1.push({
                    startDelay: 0,
                    endDelay,
                    item: new effectsCollection['aoe-square']({
                        duration,
                        yalms: 5,
                        position: new Bab.Vector3(x, 0, z),
                        collection,
                    } as any),
                });
            } else {
                const x = yalmsToM(2.5 + 5 * (i - limit / 2));
                const z = yalmsToM(2.5 + 5 * (j - limit / 2));
                checkboard2.push({
                    startDelay: duration - 1000,
                    endDelay,
                    item: new effectsCollection['aoe-square']({
                        duration,
                        yalms: 5,
                        position: new Bab.Vector3(x, 0, z),
                        collection,
                    } as any),
                });
            }
        }
    }

    const testMechanic = new Mechanic({
        name: 'test-mechanic',
        collection,
        effects: [
            ...checkboard1,
            ...checkboard2,
            {
                repeat: 1,
                startDelay: 2500,
                endDelay: 500,
                // TODO: use a real effect
                item: testEffect,
            },
        ],
    });
    testMechanic.on('start-execute', () => { debug('mechanic:start'); });
    testMechanic.on('end-execute', () => { debug('mechanic:end'); });
    testMechanic.on('start-effect', ({ effect }) => { debug('mechanic:start-effect', effect); });
    testMechanic.on('end-effect', ({ effect }) => { debug('mechanic:end-effect', effect); });

    const testSection = new FightSection({
        name: 'test-section',
        collection,
        mechanics: [{
            item: testMechanic,
        }],
    });
    testSection.on('start-execute', () => { debug('section:start'); });
    testSection.on('end-execute', () => { debug('section:end'); });

    const fight = new Fight({
        name: 'test-fight',
        collection,
        sections: [{
            item: testSection,
        }],
    });
    fight.on('start-execute', () => { debug('fight:start'); });
    fight.on('end-execute', () => { debug('fight:end'); });

    debug('get fight!', fight);
    debug('FIGHT TIME: ', fight.getDuration());
    return fight;
}

function makeArena(scene: Scene, character: Character, yalms = 90) {

    const arena = new Arena('arena', { yalms, character }, scene);

    const gridMat = new GridMaterial('arenaMat', scene);
    let c = 0.83;
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

    return {
        arena,
        globalFloor: gridFloor,
    }
}

const currentFight = ref<Fight | undefined>();

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
    camera.inertia = 0.835;
    camera.lowerBetaLimit = Math.PI * 0.025;
    camera.upperBetaLimit = Math.PI / 1.8;
    camera.lowerRadiusLimit = 1.5;
    camera.upperRadiusLimit = 24;
    camera.checkCollisions = false;
    camera.collisionRadius = new Vector3(0.5, .5, .5);
    camera.onCollide = (e) => {
        (window as any).onCollide = e;
        console.log(e);
    }
    (camera as any).attachControl(null, true, true, 1);

    const inputManager = camera.inputs;
    (inputManager.attached as any).mousewheel.wheelPrecision = 25;
    (window as any).inputManager = inputManager;

    scene.activeCamera = camera;

    const light = new Bab.HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;



    scene.collisionsEnabled = true;
    const character = new Character('player', {}, scene, playerClock);
    camera.setTarget(character.camMarker.position.clone());
    camera.lockedTarget = character.camMarker;

    character.setCamera(camera);

    character.marker.onCollideObservable.add(function (otherMesh) {
        debug('marker collided with: ', otherMesh.name, arguments);
    });

    character.collider.onCollideObservable.add(function (otherMesh) {
        debug('collider collided with: ', otherMesh.name, arguments);
    });

    let isColliding = false;
    let collisionTime = Date.now();
    let arena: Arena | undefined;

    scene.onBeforeRenderObservable.add(() => {
        let keydown = false;
        let movement = new Bab.Vector3(0, 0, 0);
        const delta = game.getDeltaTime();
        worldClock.tick(delta);
        playerClock.tick(delta);
        character.setMarkerHeight();

        if (inputMap['w']) {
            const direction = camera.getDirection(new Bab.Vector3(0, 0, 1))
            direction.y = 0;
            movement.addInPlace(direction.scaleInPlace(character.speed));
            keydown = true;
        } else if (inputMap['s']) {
            const direction = camera.getDirection(new Bab.Vector3(0, 0, -1))
            direction.y = 0;
            movement.addInPlace(direction.scaleInPlace(character.speed));
            keydown = true;
        }

        if (inputMap['a']) {
            const direction = camera.getDirection(new Bab.Vector3(-1, 0, 0))
            direction.y = 0;
            movement.addInPlace(direction.scaleInPlace(character.speed));
            keydown = true;
        } else if (inputMap['d']) {
            const direction = camera.getDirection(new Bab.Vector3(1, 0, 0))
            direction.y = 0;
            movement.addInPlace(direction.scaleInPlace(character.speed));
            keydown = true;
        }

        if (keydown) {
            movement.normalize();
            const turnAdjustment = character.speedRotation;

            if (arena?.boundary) {
                if (!arena.isPositionWithinBoundary(character.position)) {
                    const boundaryPosition = arena.boundary.position.clone();
                    const currentPos = boundaryPosition.addInPlace(character.position).length();
                    const newPos = boundaryPosition.addInPlace(movement).length();

                    if (newPos >= currentPos) {
                        movement = Bab.Vector3.Zero();
                    }
                }
            }

            if (movement.length()) {
                character.position.addInPlace(movement.scale(character.speed * playerClock.lastDelta * turnAdjustment));
                character.steering.velocity = movement;
                character.steering.lookWhereGoing(true);

                const currentDirection = character.getDirection(Bab.Vector3.Forward());
                currentDirection.y = 0;
                currentDirection.normalize();
                character.position.addInPlace(currentDirection.scale(character.speed * playerClock.lastDelta * (1.0 - turnAdjustment)));
            }

            // TODO: Replace AOE collider with that from the fight aoe.
            // if (character.collider.intersectsMesh(aoe.disc, false)) {
            //     if (!isColliding) {
            //         isColliding = true;
            //         collisionTime = Date.now();
            //         debug('colission started!', collisionTime);
            //     }
            // } else {
            //     if (isColliding) {
            //         isColliding = false;
            //         const now = Date.now();
            //         debug('colission ended!', collisionTime, now, now - collisionTime);
            //     }
            // }
        } else {
            const currentDirection = character.getDirection(Bab.Vector3.Forward());
            currentDirection.y = 0;
            character.velocity = movement.add(currentDirection);
            character.steering.lookWhereGoing(true);
        }

        characterDirection.value = vectorAngle(character.getDirection(Bab.Vector3.Forward()));
        cameraDirection.value = vectorAngle(camera.getDirection(Bab.Vector3.Forward()));
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
    char2.position.z = yalmsToM(0);
    char2.position.y = (torsoHeight * 1.20) / 2;

    const arenaResult = makeArena(scene, character);
    arena = arenaResult?.arena;

    const collection = new FightCollection({
        scene,
        worldClock,
        playerClock,
        arena,
    });

    const fight = createFight(collection);
    fight.execute();
    currentFight.value = fight;

    (window as any).__scenery = {
        collection,
        scene,
        character,
        arenaResult,
    };

    return {
        scene, camera, light, character, arena: arenaResult,
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

            const { scene } = makeScene(game);
            game.runRenderLoop(() => {
                scene.render();
            });
        }
    });
});

onBeforeUnmount(async () => {
    window.removeEventListener('resize', onResize);
});

function onFightUpdate(updatedFight: Fight) {
    console.log('UPDATE FIGHT!');
    currentFight.value = updatedFight;
    updatedFight.collection.worldClock.time = 0;
    (window as any).__fight = updatedFight;
    updatedFight.execute();
}
</script>

<template>
    <div id="game" class="relative max-w-screen max-h-screen overflow-hidden h-screen game --babylon">
        <FightUi @update="onFightUpdate" v-if="currentFight" :fight="currentFight" />

        <div class="minimap relative-north absolute top-10 right-10 z-10 bg-slate-700 p-[2px] rounded-full" :style="{
            '--cam-rotation': `${cameraDirection}deg`,
            '--char-rotation': `${characterDirection}deg`,
        }">
            <div class="minimap__floor w-24 h-24 bg-slate-100 overflow-hidden rounded-full relative">
            </div>
        </div>

        <div class="absolute top-0 left-0 z-10">
            <slot>
                <canvas class="bg-sky-100 w-screen h-screen" ref="canvas" id="gamecanvas"></canvas>
            </slot>
        </div>
    </div>
</template>

<style lang="scss">
:root {
    --char-rotation: 0deg;
    --cam-rotation: 0deg;
}

.minimap {
    z-index: 11;

    &::before {
        content: "N";
        display: block;
        position: absolute;
        left: 50%;
        top: -22%;
        z-index: 10;
        transform: translateX(-50%);
        text-shadow:
            0 0 1px #ffffffea,
            0 0 4px #ffffffaa,
            0 0 2px #ffffff5a;
    }

    &.relative-north {
        transform: rotate(calc(var(--cam-rotation) * -1));

        &::before {
            transform: translateX(-50%) rotate(calc(var(--cam-rotation) * 1));
        }
    }
}

.minimap__floor {
    background-size: 15px 15px;
    background-image:
        linear-gradient(to right, rgba(0, 0, 0, 0.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.12) 1px, transparent 1px);

    // transform: rotate(var(--cam-rotation));

    &::before {
        content: "";
        display: block;
        width: 0;
        height: 0;
        border: 5.5em solid transparent;
        border-top-width: 6em;
        border-bottom-width: 6em;
        border-top-color: rgb(159 235 235 / 52%);

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transform: translate(-50%, -50%) rotate(var(--cam-rotation));
        filter: blur(3px);
        filter: drop-shadow(0 0 5px #ffffff6a) blur(3px);

        .relative-north & {
            transform: translate(-50%, -50%);
            transform: translate(-50%, -50%) rotate(calc(var(--cam-rotation) * 1));
        }
    }

    &::after {
        content: "";
        display: block;
        width: 0;
        height: 0;
        border: 0.35em solid transparent;
        border-top-width: 0;
        border-bottom-width: 1em;
        border-bottom-color: rgba(23, 37, 84, 1);

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -65%);
        transform: translate(-50%, -65%) rotate(var(--char-rotation));
    }
}
</style>

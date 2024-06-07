<script setup lang="ts">
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import { Engine, Scene, Vector3 } from '@babylonjs/core';
import * as Bab from '@babylonjs/core';
import * as Tex from '@babylonjs/procedural-textures';
import { GridMaterial } from '@babylonjs/materials';
import createMarkerMat from '../materials/marker';
import { Steering } from '../utils/steering';
import { yalmsToM, mToYalms } from '../utils/conversions';
import { Arena } from '../utils/arenas/arena';
import { Character } from '../utils/character';
import { Clock } from '../utils/clock';
import { FightCollection } from '../utils/fight-collection';
import { effectsCollection } from '../utils/fight-effects/index';
import { createRingMesh } from '#imports';
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
const playerClock = new Clock({ name: 'player', scaling: playerTimeScaling.value });
const playerTime = useState<number>('playerTime', () => playerClock.time || 0);
playerClock.on('tick', (time) => { playerTime.value = time });
watch(playerTimeScaling, (scaling) => { playerClock.scaling = scaling });

const worldTimeScaling = ref(1.0);
const worldClock = new Clock({ name: 'world', paused: true, scaling: worldTimeScaling.value });
const worldTime = useState<number>('worldTime', () => worldClock.time || 0);
worldClock.on('tick', (time) => { worldTime.value = time });
watch(worldTimeScaling, (scaling) => { worldClock.scaling = scaling });

const canvas = ref<HTMLCanvasElement>();
let game: Engine | undefined;
const cameraDirection = ref(0);
const characterDirection = ref(0);
const hits = ref(0);

function onResize() {
    if (game) {
        game.resize();
    }
}

function registerFight(fight: Fight) {
    fight.on('effect-hit', ({ effect }) => {
        console.log('hit by: ', effect.name, effect);
        hits.value++;
    });
}

function createFight(collection: FightCollection, yalms = 60) {

    // TODO: use a real effect
    const testEffect = new effectsCollection['aoe-disc']({
        position: new Bab.Vector3(0, 0, -1.5),
        duration: 2500,
        collection,
    });
    testEffect.on('start', () => { debug('effect:start'); });
    testEffect.on('end', () => { debug('effect:end'); });


    let startDelay = 0;
    let endDelay = 1500;
    let duration = 1500;
    const checkboard1: any[] = [];

    // TODO: Create a checkerboard effect class using instances
    let repDuration = 1325;
    let repDelay = repDuration * 0.85;
    let repOffset = (repDelay + repDuration) / 2;
    let startAfter = 0;
    let repeat = 11;

    checkboard1.push({
        repeat,
        preStartDelay: repOffset * (0 + startAfter),
        startDelay: repDelay,
        endDelay: 0,
        item: new effectsCollection['aoe-square-grid']({
            duration: repDuration,
            yalms: 5,
            size: 12,
            pattern: 'checkered',
            collection,
        } as any),
    });

    checkboard1.push({
        repeat,
        preStartDelay: repOffset * (1 + startAfter),
        startDelay: repDelay,
        endDelay: 0,
        item: new effectsCollection['aoe-square-grid']({
            duration: repDuration,
            yalms: 5,
            size: 12,
            pattern: 'checkered-alt',
            collection,
        } as any),
    });

    repDuration = 1250;
    repDelay = repDuration * 0.5;
    repOffset = (repDelay + repDuration) / 3;
    startAfter = 4;
    repeat = 10;
    const eYalms = 4;

    const testMechanic = new Mechanic({
        name: 'test-mechanic',
        collection,
        effects: [
            {
                // IFRIT 1
                repeat: 5,
                endDelay: 500,
                // TODO: use a real effect
                item: new effectsCollection['aoe-ring']({
                    outerRadius: 33.35 * 0.8687,
                    innerRadius: 0,
                    // thetaLength: Math.PI / 2,
                    thetaLength: 'pi / 2',
                    angle: 152,
                    direction: -90,
                    duration: 2000,
                    collection,
                }),
            },
            {
                // IFRIT 2
                repeat: 5,
                endDelay: 500,
                // TODO: use a real effect
                item: new effectsCollection['aoe-ring']({
                    outerRadius: 33.35 * 0.8687,
                    innerRadius: 0,
                    thetaLength: 'pi / 2',
                    angle: 152,
                    direction: 90,
                    duration: 2000,
                    collection,
                }),
            },
            {
                // GARUDA 1 (of 4)
                repeat: 5,
                endDelay: 500,
                // TODO: use a real effect
                item: new effectsCollection['aoe-ring']({
                    outerRadius: 33.35 * 0.8687,
                    innerRadius: 0,
                    thetaLength: 'pi / 2',
                    angle: 45,
                    direction: -90,
                    duration: 2000,
                    collection,
                }),
            },
            {
                // RAMUH
                repeat: 5,
                endDelay: 500,
                // TODO: use a real effect
                item: new effectsCollection['aoe-disc']({
                    yalms: 14.325,
                    duration: 2000,
                    collection,
                }),
            },
            {
                // leviathan 1 (of 2)
                repeat: 5,
                endDelay: 500,
                // TODO: use a real effect
                item: new effectsCollection['aoe-ring']({
                    outerRadius: 33.35 * 0.8687,
                    innerRadius: 0,
                    thetaLength: 'pi / 2',
                    angle: 180,
                    direction: 0,
                    position: [6.25, 0],
                    duration: 2000,
                    collection,
                }),
            },
            {
                // leviathan 2 (of 2)
                repeat: 5,
                endDelay: 500,
                // TODO: use a real effect
                item: new effectsCollection['aoe-ring']({
                    outerRadius: 33.35 * 0.8687,
                    innerRadius: 0,
                    thetaLength: 'pi / 2',
                    angle: 180,
                    direction: 180,
                    position: [-6.25, 0],
                    duration: 2000,
                    collection,
                }),
            },
            // ...checkboard1,
            // // ...checkboard2,
            // // {
            // //     repeat: 1,
            // //     startDelay: 2500,
            // //     endDelay: 500,
            // //     // TODO: use a real effect
            // //     item: testEffect,
            // // },

            // {
            //     repeat,
            //     preStartDelay: repOffset * (1 + startAfter),
            //     startDelay: repDelay,
            //     endDelay: 0,
            //     // TODO: use a real effect
            //     item: new effectsCollection['aoe-disc']({
            //         yalms,
            //         position: 'player',
            //         positionType: 'character',
            //         duration: repDuration,
            //         collection,
            //     }),
            // },
            // {
            //     repeat,
            //     preStartDelay: repOffset * (2 + startAfter),
            //     startDelay: repDelay,
            //     endDelay: 0,
            //     // TODO: use a real effect
            //     item: new effectsCollection['aoe-disc']({
            //         yalms,
            //         position: 'player',
            //         positionType: 'character',
            //         duration: repDuration,
            //         collection,
            //     }),
            // },
            // {
            //     repeat,
            //     preStartDelay: repOffset * (3 + startAfter),
            //     startDelay: repDelay,
            //     endDelay: 0,
            //     // TODO: use a real effect
            //     item: new effectsCollection['aoe-disc']({
            //         yalms,
            //         position: 'player',
            //         positionType: 'character',
            //         duration: repDuration,
            //         collection,
            //     }),
            // },
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
        arena: {
            yalms,
            collection,
            floorType: 'e12s',
        },
    });
    fight.on('start-execute', () => { debug('fight:start'); });
    fight.on('end-execute', () => { debug('fight:end'); });

    debug('get fight!', fight);
    debug('FIGHT TIME: ', fight.getDuration());
    return fight;
}

// function makeArena(scene: Scene, character: Character, yalms = 90) {
// function makeArena(scene: Scene, collection: FightCollection, yalms = 60) {
//     return new Arena(
//         'arena',
//         {
//             yalms,
//             collection,
//             globalFloor: true,
//             floorType: 'e12s',
//         },
//         scene);
// }

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

    const e12sArenaRadius = 33.35 * 0.86868;
    const collection = new FightCollection({
        scene,
        worldClock,
        playerClock,
    });
    const fight = createFight(collection, e12sArenaRadius * 2);
    const arena = fight.arena;


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

    // const testArenaDisc = Bab.MeshBuilder.CreateDisc('test-floor', { radius: yalmsToM(e12sArenaRadius) }, scene);
    // // const testArenaDisc = Bab.MeshBuilder.CreateDisc('test-floor', { radius: 33 }, scene);
    // testArenaDisc.position = Bab.Vector3.Zero();
    // testArenaDisc.position.y = 0.002;
    // testArenaDisc.rotation.x = Math.PI / 2;
    // const e12sMat = new Bab.StandardMaterial('e12sarena', scene);
    // e12sMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/arena.png', scene, undefined, false);
    // e12sMat.diffuseTexture.hasAlpha = true;
    // e12sMat.specularColor = new Bab.Color3(0, 0, 0.05);
    // testArenaDisc.material = e12sMat;

    const bossSize = yalmsToM(5);
    const boss = Bab.MeshBuilder.CreatePlane('test-boss', { size: bossSize * 2 }, scene, true, Bab.Mesh.DOUBLESIDE);
    // boss.position.z = yalmsToM(15);
    boss.position.y = bossSize;
    const bossMat = new Bab.StandardMaterial('e12s-boss', scene);
    bossMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/boss.png');
    bossMat.diffuseTexture.hasAlpha = true;
    bossMat.specularColor = new Bab.Color3(0, 0, 0);
    bossMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
    boss.material = bossMat;
    boss.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;

    const crystalSize = yalmsToM(12);

    const ifritSize = crystalSize
    const ifrit = Bab.MeshBuilder.CreatePlane('test-ifrit', { height: ifritSize * 2, width: ifritSize * 1.2 }, scene);
    ifrit.position.z = yalmsToM(26);
    ifrit.position.x = ifritSize * 1.2 * 1.8;
    ifrit.position.y = ifritSize * 0.8;
    const ifritMat = new Bab.StandardMaterial('e12s-ifrit', scene);
    ifritMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/ifrit.png');
    ifritMat.diffuseTexture.hasAlpha = true;
    ifritMat.specularColor = new Bab.Color3(0, 0, 0);
    ifritMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
    ifrit.material = ifritMat;
    ifrit.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;

    // const path: Vector3[] = [ifrit.position.clone()];
    // const beamSegments = 10;
    // const dist = Bab.Vector3.Distance(boss.position, ifrit.position) / beamSegments;
    // for (var i = 1; i < beamSegments - 1; i++) {
    //     // const lastPosition = i && path[i - 1] ? path[i - 1] : ifrit.position.clone();
    //     // const newPos = lastPosition.subtract(boss.position.clone());
    //     const mult = (beamSegments - i) / beamSegments;
    //     const newPos = boss.position.add(ifrit.position).multiply(new Bab.Vector3(mult, mult, mult));
    //     newPos.x += (Math.random() - 0.5) * 5;
    //     newPos.z += (Math.random() - 0.5) * 5;
    //     path.push(newPos);
    // }
    // path.push(boss.position.clone());
    // const ifritBeam = Bab.MeshBuilder.CreateTube('beam-ifrit', {
    //     path: [
    //         ...path,
    //     ],
    //     tessellation: 3,
    //     radius: 0.10,
    // }, scene);
    // const ifritBeamMat = new Bab.StandardMaterial('ifrit-beam', scene);
    // ifritBeamMat.emissiveColor = new Bab.Color3(189 / 255, 25 / 255, 28 / 255);
    // ifritBeam.material = ifritBeamMat;
    // (window as any).ifritBeam = ifritBeam;
    // const gl = new Bab.GlowLayer('beam', scene);
    // gl.addIncludedOnlyMesh(ifritBeam);

    const ifritEmitter = new Bab.CustomParticleEmitter();
    let id = 0;
    ifritEmitter.particlePositionGenerator = (_index, _particle, out) => {
        // const idx = Math.round((_particle?.id ?? id + 1)) % (path.length - 1);
        // const idx = Math.floor(Math.random() * path.length);
        // const pos = path[idx] // .subtract(ifrit.position);
        const pos = ifrit.position // .subtract(ifrit.position);
        // console.log(id, idx);
        out.x = pos.x + Math.sin(Math.random() * 10) * 2;
        out.y = pos.y + Math.cos(Math.random() * 10) * 1.5;
        out.z = pos.z + Math.sin(Math.random() * 10) * 2.5;

        id += 1;
    };

    ifritEmitter.particleDestinationGenerator = (_index, _particle, out) => {
        // const idx = Math.round((_particle?.id ?? id + 1)) % (path.length - 1);
        // const pos = path[idx + 1] // .subtract(ifrit.position);
        // out.x = pos.x;
        // out.y = pos.y;
        // out.z = pos.z;
        out.x = boss.position.x;
        out.y = boss.position.y;
        out.z = boss.position.z;
    };

    // const ifritParticles = Bab.ParticleHelper.CreateDefault(ifritBeam);
    const ifritParticles = Bab.ParticleHelper.CreateDefault(ifrit);
    ifritParticles.emitter = Bab.Vector3.Zero();
    ifritParticles.particleEmitterType = ifritEmitter;
    // ifritParticles.particleEmitterType = new Bab.MeshParticleEmitter(ifritBeam);
    ifritParticles.maxSize = 2.5;
    ifritParticles.minSize = 0.25;
    ifritParticles.maxEmitPower = 0.95;
    ifritParticles.minEmitPower = 0.70;
    ifritParticles.updateSpeed = 0.25;
    ifritParticles.maxLifeTime = 15.45;
    ifritParticles.minLifeTime = 15.20;
    ifritParticles.color1 = new Bab.Color4(211 / 255, 108 / 255, 79 / 255, 1.0);
    ifritParticles.color2 = new Bab.Color4(189 / 255, 25 / 255, 28 / 255, 1.0);
    ifritParticles.colorDead = new Bab.Color4(189 / 255, 25 / 255, 28 / 255, 0.5);
    // ifritParticles.gravity = boss.position.subtract(ifrit.position).normalize().multiply(new Bab.Vector3(.1, .1, .1));
    ifritParticles.billboardMode = Bab.ParticleSystem.BILLBOARDMODE_STRETCHED;
    ifritParticles.start();

    const noiseTex = new Bab.NoiseProceduralTexture('perlin', 256, scene);
    noiseTex.animationSpeedFactor = 8;
    noiseTex.persistence = 2;
    noiseTex.brightness = 0.5;
    noiseTex.octaves = 2;

    ifritParticles.noiseTexture = noiseTex;
    ifritParticles.noiseStrength = new Bab.Vector3(.03, .03, .03);

    const ramuhSize = crystalSize
    const ramuh = Bab.MeshBuilder.CreatePlane('test-ramuh', { height: ramuhSize * 2, width: ramuhSize * 1.2 }, scene);
    ramuh.position.z = yalmsToM(35);
    ramuh.position.x = ramuhSize * 1.2 * 0.625;
    ramuh.position.y = ramuhSize * 0.8;
    const ramuhMat = new Bab.StandardMaterial('e12s-ramuh', scene);
    ramuhMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/ramuh.png');
    ramuhMat.diffuseTexture.hasAlpha = true;
    ramuhMat.specularColor = new Bab.Color3(0, 0, 0);
    ramuhMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
    ramuh.material = ramuhMat;
    ramuh.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;

    const garudaSize = crystalSize
    const garuda = Bab.MeshBuilder.CreatePlane('test-garuda', { height: garudaSize * 2, width: garudaSize * 1.2 }, scene);
    garuda.position.z = yalmsToM(35);
    garuda.position.x = garudaSize * 1.2 * -0.625;
    garuda.position.y = garudaSize * 0.8;
    const garudaMat = new Bab.StandardMaterial('e12s-garuda', scene);
    garudaMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/garuda.png');
    garudaMat.diffuseTexture.hasAlpha = true;
    garudaMat.specularColor = new Bab.Color3(0, 0, 0);
    garudaMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
    garuda.material = garudaMat;
    garuda.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;

    const leviathanSize = crystalSize
    const leviathan = Bab.MeshBuilder.CreatePlane('test-leviathan', { height: leviathanSize * 2, width: leviathanSize * 1.2 }, scene);
    leviathan.position.z = yalmsToM(26);
    leviathan.position.x = leviathanSize * 1.2 * -1.8;
    leviathan.position.y = leviathanSize * 0.8;
    const leviathanMat = new Bab.StandardMaterial('e12s-leviathan', scene);
    leviathanMat.diffuseTexture = new Bab.Texture('/images/fights/e12s/leviathan.png');
    leviathanMat.diffuseTexture.hasAlpha = true;
    leviathanMat.specularColor = new Bab.Color3(0, 0, 0);
    leviathanMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
    leviathan.material = leviathanMat;
    leviathan.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;


    // const particles = Bab.ParticleHelper.CreateDefault(boss.position.clone())
    const particles = Bab.ParticleHelper.CreateDefault(boss.position.clone())
    // const particles = new Bab.ParticleSystem('boss-particles', 100, scene);
    // particles.particleTexture = new Tex.FireProceduralTexture('fiah', 128, scene);
    // particles.emitter = boss.position.clone();
    particles.emitter = character.position;
    particles.start();

    const ring = createRingMesh('rang', {
        innerRadius: 0.5,
        outerRadius: 5,
        thetaSegments: 1,
        thetaLength: Math.PI / 1,
    }, scene);
    ring.position.z -= 5;
    ring.position.y += 5;

    collection.addCharacter(character);

    registerFight(fight);
    fight.execute();
    currentFight.value = fight;

    (window as any).__scenery = {
        collection,
        scene,
        character,
        arena,
    };

    return {
        scene, camera, light, character, arena,
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

async function onFightUpdate(updatedFight: Fight) {
    console.log('UPDATE FIGHT!');
    await currentFight.value?.dispose();

    currentFight.value = updatedFight;
    updatedFight.collection.worldClock.time = 0;
    worldTime.value = 0;
    (window as any).__fight = updatedFight;
    registerFight(updatedFight);
    hits.value = 0;
    updatedFight.execute();
}

function onResetPosition() {
    const player = currentFight.value?.collection?.player;
    if (player) {
        player.position = new Bab.Vector3(0, 0, yalmsToM(-27));
    }
}

</script>

<template>
    <div id="game" class="relative max-w-screen max-h-screen overflow-hidden h-screen game --babylon">
        <FightUi @reset-position="onResetPosition" @update="onFightUpdate" v-if="currentFight" :fight="currentFight" />

        <div class="minimap relative-north absolute top-10 right-10 z-10 bg-slate-700 p-[2px] rounded-full" :style="{
            '--cam-rotation': `${cameraDirection}deg`,
            '--char-rotation': `${characterDirection}deg`,
        }">
            <div class="minimap__floor w-24 h-24 bg-slate-100 overflow-hidden rounded-full relative">
            </div>
        </div>

        <div class="ui-extras absolute top-6 flex justify-center items-center p-2 px-4 rounded bg-slate-100/50">
            <p>Hits: {{ hits }}</p>
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

.ui-extras {
    left: 50%;
    transform: translateX(-50%);
    z-index: 99;
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

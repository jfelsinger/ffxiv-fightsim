<script setup lang="ts">
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import { Engine, Scene, Vector3 } from '@babylonjs/core';
import * as Bab from '@babylonjs/core';
import { yalmsToM } from '../utils/conversions';
import { Character } from '../utils/character';
import { Clock } from '../utils/clock';
import { FightCollection } from '../utils/fight-collection';
import { effectsCollection } from '../utils/effects';
import { createRingMesh } from '#imports';
import { Fight } from '../utils/fights';
import { FightSection, } from '../utils/sections';
import { Mechanic, } from '../utils/mechanics';
import { decodeFight } from '../utils/decode-fight';
import { degToRads, vectorAngle } from '../utils/vector-helpers';
import { getInterpolatedPosition } from '~/utils/positioning';

import { Waymark } from '~/utils/waymark';

(window as any).Bab = Bab;

const props = defineProps<{
    fightData?: any,
    infoData?: any,
    showUi?: boolean,
    skipCharacter?: boolean,
}>();

import Debug from 'debug';
const debug = Debug('game');

const playerTimeScaling = ref(1.0);
const playerClock = new Clock({ name: 'player', scaling: playerTimeScaling.value });
const playerTime = useState<number>('playerTime', () => playerClock.time || 0);
playerClock.on('tick', (time) => { playerTime.value = time });
watch(playerTimeScaling, (scaling) => { playerClock.scaling = scaling });

const {
    worldTime,
    worldTimeScaling,
    worldClock,
} = useWorldClock();

const canvas = ref<HTMLCanvasElement>();
let game: Engine | undefined;
const cameraDirection = useState<number>('cameraDirection', () => 0);
const characterDirection = useState<number>('characterDirection', () => 0);

const { isTutorial } = useTutorialMode();
const isHit = useState<boolean>('isHit', () => false);
const hits = useState<number>('hits', () => 0);
let hitTimeoutKey: ReturnType<typeof setTimeout> | undefined;
watch(hits, (value: number, oldValue: number) => {
    if (value > oldValue) {
        isHit.value = true;
        clearTimeout(hitTimeoutKey);
        hitTimeoutKey = setTimeout(() => isHit.value = false, 725);
    }
});

const castState = useCastState();
(window as any).castState = castState;

const { statuses } = useStatuses();

function onResize() {
    game?.resize();
}

function registerFight(fight: Fight) {
    currentFight.value = fight;
    (window as any).__fight = fight;
    fight.on('effect-hit', ({ effect }) => {
        debug('hit by: ', effect.name, effect);
        hits.value++;
    });
}

function getFight(collection: FightCollection) {
    if (props.fightData) {
        return decodeFight(props.fightData, {
            collection,
            clock: worldClock,
        });
    }
}

const currentFight = ref<Fight | undefined>();

const inputMap = ref<Record<string, boolean>>({});
const {
    leftStickVector,
    rightStickVector,
    leftStickInvertX,
    leftStickInvertY,
    rightStickInvertX,
    rightStickInvertY,
    rightStickSensitivityX,
    rightStickSensitivityY,
} = useController();

function makeScene(game: Engine) {
    const scene = new Scene(game);
    scene.environmentTexture = Bab.CubeTexture.CreateFromPrefilteredData('/tex/basic-sky.env', scene);

    inputMap.value = {};
    scene.actionManager = new Bab.ActionManager(scene);
    scene.actionManager.registerAction(new Bab.ExecuteCodeAction(Bab.ActionManager.OnKeyDownTrigger, (evt) => {
        inputMap.value[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
    }));
    scene.actionManager.registerAction(new Bab.ExecuteCodeAction(Bab.ActionManager.OnKeyUpTrigger, (evt) => {
        inputMap.value[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
    }));

    scene.onPrePointerObservable.add((pointerInfo) => {
        if (pointerInfo.event.type === 'pointerup') {
            console.log('POINTER UP: ', pointerInfo.event.button, pointerInfo.event);
            delete inputMap.value[`mb-${pointerInfo.event.button}`];
            (window as any).pu = pointerInfo;
        } else {
            inputMap.value[`mb-1`] = !!(pointerInfo.event.buttons & 1);
            inputMap.value[`mb-2`] = !!(pointerInfo.event.buttons & 2);
        }
    });

    const skydome = Bab.MeshBuilder.CreateBox('sky', { size: 5000, sideOrientation: Bab.Mesh.BACKSIDE }, scene);
    skydome.position.y = 100;
    skydome.isPickable = false;
    skydome.receiveShadows = true;

    const sky = new Bab.BackgroundMaterial('skyMaterial', scene);
    sky.reflectionTexture = scene.environmentTexture.clone();
    sky.reflectionTexture!.coordinatesMode = Bab.Texture.SKYBOX_MODE;
    sky.enableGroundProjection = true
    sky.projectedGroundRadius = 1000;
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
    (camera as any).attachControl(null, true, true, 1);

    const gamepadManager = new Bab.GamepadManager();
    gamepadManager.onGamepadConnectedObservable.add((gamepad, _state) => {
        (window as any).gamepad = gamepad;
        (window as any).gamepadState = _state;
        (window as any).gamepadManager = gamepadManager;
        // camera.inputs.addGamepad();
        // if ((camera as any).inputs?.attached?.gamepad?.gamepadRotationSensibility) {
        //     (camera as any).inputs.attached.gamepad.gamepadRotationSensibility = 150;
        // }

        gamepad.onleftstickchanged((values) => {
            const vec = new Bab.Vector3(values.x * (leftStickInvertX.value ? -1 : 1), 0, values.y * (leftStickInvertY.value ? 1 : -1));
            if (vec.length() >= 0.05) {
                inputMap.value['left-stick'] = true;
                leftStickVector.value = vec;
            } else {
                inputMap.value['left-stick'] = false;
                leftStickVector.value = Bab.Vector3.Zero();
            }

        });

        gamepad.onrightstickchanged((values) => {
            const vec = new Bab.Vector3(
                values.x * rightStickSensitivityX.value * (rightStickInvertX.value ? -1 : 1),
                0,
                values.y * rightStickSensitivityY.value * (rightStickInvertY.value ? -1 : 1)
            );
            if (vec.length() >= 0.05) {
                inputMap.value['right-stick'] = true;
                rightStickVector.value = vec;
            } else {
                inputMap.value['right-stick'] = false;
                rightStickVector.value = Bab.Vector3.Zero();
            }

        });

    });

    const inputManager = camera.inputs;
    (inputManager.attached as any).mousewheel.wheelPrecision = 25;
    (window as any).inputManager = inputManager;

    scene.activeCamera = camera;

    const light = new Bab.HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    const collection = new FightCollection({
        scene,
        worldClock,
        playerClock,
    });
    (window as any).getInterpolatedPosition = (p: any, pt: any, st: any, val: any) => {
        return getInterpolatedPosition(p, pt, st, val, collection);
    };


    const fight = getFight(collection);
    const arena = fight?.arena;

    if (props.skipCharacter) {
        return {
            scene, camera, light, arena, fight
        }
    } // else:

    const character = new Character('player', {
        startPosition: fight?.getStartPosition(),
    }, scene, playerClock);
    character.tags.add('player');
    collection.addCharacter(character);

    camera.setTarget(character.camMarker.position.clone());
    camera.lockedTarget = character.camMarker;
    character.setCamera(camera);

    scene.collisionsEnabled = true;
    scene.onBeforeRenderObservable.add(() => {
        let keydown = false;
        let movement = new Bab.Vector3(0, 0, 0);
        const delta = game.getDeltaTime();
        worldClock.tick(delta);
        playerClock.tick(delta);
        character.setMarkerHeight();

        if (inputMap.value['right-stick']) {
            camera.alpha += degToRads(rightStickVector.value.x);
            camera.beta += degToRads(rightStickVector.value.z);
        } else {
        }

        if (inputMap.value['left-stick']) {
            const stickVector = leftStickVector.value;
            const direction = camera.getDirection(stickVector);
            direction.y = 0;
            movement.addInPlace(direction.scaleInPlace(character.speed));
            keydown = true;
        } else {
            if (inputMap.value['w'] || (inputMap.value['mb-1'] && inputMap.value['mb-2'])) {
                const direction = camera.getDirection(new Bab.Vector3(0, 0, 1))
                direction.y = 0;
                movement.addInPlace(direction.scaleInPlace(character.speed));
                keydown = true;
            } else if (inputMap.value['s']) {
                const direction = camera.getDirection(new Bab.Vector3(0, 0, -1))
                direction.y = 0;
                movement.addInPlace(direction.scaleInPlace(character.speed));
                keydown = true;
            }

            if (inputMap.value['a']) {
                const direction = camera.getDirection(new Bab.Vector3(-1, 0, 0))
                direction.y = 0;
                movement.addInPlace(direction.scaleInPlace(character.speed));
                keydown = true;
            } else if (inputMap.value['d']) {
                const direction = camera.getDirection(new Bab.Vector3(1, 0, 0))
                direction.y = 0;
                movement.addInPlace(direction.scaleInPlace(character.speed));
                keydown = true;
            }
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
        } else {
            const currentDirection = character.getDirection(Bab.Vector3.Forward());
            currentDirection.y = 0;
            character.velocity = movement.add(currentDirection);
            character.steering.lookWhereGoing(true);
        }

        characterDirection.value = vectorAngle(character.getDirection(Bab.Vector3.Forward()));
        cameraDirection.value = vectorAngle(camera.getDirection(Bab.Vector3.Forward()));
    });


    if (fight) {
        registerFight(fight);
        fight.execute();

        // TODO: Move positioning to be on the fight
        // const spacing = 0.2;
        // new Waymark(fight, { name: 'a', position: [(-0.25 + -1.5) * spacing, -1 * spacing], positionType: 'arena' });
        // new Waymark(fight, { name: 'b', position: [(-0.25 + -0.5) * spacing, -1 * spacing], positionType: 'arena' });
        // new Waymark(fight, { name: 'c', position: [(-0.25 + 0.5) * spacing, -1 * spacing], positionType: 'arena' });
        // new Waymark(fight, { name: 'd', position: [(-0.25 + 1.5) * spacing, -1 * spacing], positionType: 'arena' });
        // new Waymark(fight, { name: '1', position: [(-0.25 + -1.0) * spacing, -2 * spacing], positionType: 'arena' });
        // new Waymark(fight, { name: '2', position: [(-0.25 + 0) * spacing, -2 * spacing], positionType: 'arena' });
        // new Waymark(fight, { name: '3', position: [(-0.25 + 1.0) * spacing, -2 * spacing], positionType: 'arena' });
        // new Waymark(fight, { name: '4', position: [(-0.25 + 2.0) * spacing, -2 * spacing], positionType: 'arena' });
    }

    (window as any).__scenery = {
        collection,
        scene,
        character,
        arena,
    };

    return {
        scene, camera, light, character, arena, fight
    }
}

function onVisibilityChange() {
    if (document.hidden || document.visibilityState === 'hidden') {
        inputMap.value = {};
    }
}

function onBlur() {
    inputMap.value = {};
}

// TODO
function onKeyDown(e: any) {
    if (e?.key && !e?.target?.matches('input, textbox, select, textarea')) {
        inputMap.value[e.key] = true;
    }
}

function onKeyUp(e: any) {
    if (e?.key && inputMap.value[e.key]) {
        delete inputMap.value[e.key];
    }
}

onMounted(async () => {
    canvas.value?.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);

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
    canvas.value?.removeEventListener('blur', onBlur);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('blur', onBlur);
    document.removeEventListener('visibilitychange', onVisibilityChange);
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
    player?.resetPosition();
}

function onScaleTime(value: number) {
    worldTimeScaling.value = value;
}

</script>

<template>
    <div id="game" class="relative max-w-screen max-h-screen overflow-hidden h-screen game --babylon"
        :class="{ '--is-hit': isHit }">
        <FightUi @scale-time="onScaleTime" @reset-position="onResetPosition" @update="onFightUpdate" :info="infoData"
            v-if="showUi && currentFight" :fight="currentFight" />

        <Minimap v-if="showUi" />

        <div v-if="showUi && !isTutorial"
            class="ui-extras absolute top-6 flex justify-center items-center p-2 px-4 bg-blur rounded bg-slate-100/50">
            <p>
                Hits:
                <span class="countdown font-mono">
                    <span :style="{ '--value': hits }"></span>
                </span>
            </p>
        </div>

        <div class="absolute top-0 left-0 z-10">
            <slot>
                <canvas class="bg-sky-100 w-screen h-screen" ref="canvas" id="gamecanvas"></canvas>
            </slot>
        </div>

        <UiCastBar v-if="castState?.name" />
        <UiRolePicker />

        <UiStatusGroup name="player" xstatuses="statuses" />
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
    z-index: 30;

    .--is-hit & {
        background-color: #e7493bcf;
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms
    }
}

#inspector-host {
    position: fixed !important;
    right: 0 !important;
    z-index: 99999 !important;
    max-height: 100vh !important;
}

div:is(div #scene-explorer-host) {
    max-height: 100vh !important;
}

div:has(~ div #scene-explorer-host) {
    display: none !important;
}
</style>

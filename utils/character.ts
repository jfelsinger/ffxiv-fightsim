import * as Bab from '@babylonjs/core';
import { Steering } from './steering';
import { EventEmitter } from 'eventemitter3';
import { yalmsToM } from './conversions';
import { clamp, lerp } from './interpolation';
import createMarkerMat from '../materials/marker';
import { Clock } from './clock';
import {
    type Status,
    makeStatus,
    addStatus,
    removeStatus,
    getStatus,
    addStacks,
    removeStacks,
    clearStacks,
} from './status';
import {
    useState,
    useWorldClock,
    type Ref,
} from '#imports';

import Debug from 'debug';
const debug = Debug('game:utils:character');

export type CharacterOptions = {
    height: number
    heads: number
    diffuseColor: Bab.Color3
    specularColor: Bab.Color3

    speed: number
    speedRotation: number
    role?: 'dps' | 'tank' | 'healer'
    tags?: string[]
    startPosition?: Bab.Vector3
}

export const MinPlayerHeight = 0.525;
export const MaxPlayerHeight = 1.675;
export const DefaultCharacterOptions: CharacterOptions = {
    height: 0.59785, // ~1.2125
    heads: 6.25,

    diffuseColor: new Bab.Color3(0.2, 0.6, 1.0),
    specularColor: new Bab.Color3(0.2, 0.1, 0.7),

    speed: 1.0,
    speedRotation: 0.88,
    startPosition: new Bab.Vector3(0, 0, -25),
} as const

export class Character extends EventEmitter {
    name: string;
    role?: string;
    clock: Clock;
    scene: Bab.Scene;
    height: number;
    heads: number;
    diffuseColor: Bab.Color3;
    specularColor: Bab.Color3;
    tags: Set<string> = new Set();
    statuses: Ref<Status[]>;

    camera?: Bab.ArcRotateCamera;

    speed: number;
    speedRotation: number;

    head: Bab.Mesh;
    body: Bab.Mesh;
    camMarker: Bab.Mesh;
    collider: Bab.Mesh;
    marker: Bab.Mesh;
    steering: Steering;
    startPosition: Bab.Vector3;

    getStatus(status: Parameters<typeof getStatus>[1]) {
        return getStatus(this.statuses.value, status);
    }

    addStatus(statusToAdd: Parameters<typeof addStatus>[1]) {
        const { status, list } = addStatus(this.statuses.value, statusToAdd);

        this.statuses.value = list;
        this.emit('status:add', { status, list });
    }

    removeStatus(statusToRemove: Parameters<typeof removeStatus>[1]) {
        const { status, list } = removeStatus(this.statuses.value, statusToRemove);
        this.statuses.value = list;
        this.emit('status:remove', { status, list });
    }

    addStacks(name: string, count = 1) {
        const statuses = this.statuses.value;
        const status = getStatus(statuses, name);
        if (status) {
            const prevStacks = status.stacks;
            addStacks(status, count);
            this.emit('stacks:add', { status, count, prevStacks });
            this.statuses.value = statuses;
            return status.stacks;
        }
    }

    removeStacks(name: string, count = 1) {
        const statuses = this.statuses.value;
        const status = getStatus(statuses, name);
        if (status) {
            const prevStacks = status.stacks;
            removeStacks(status, count);
            this.emit('stacks:remove', { status, count, prevStacks });
            this.statuses.value = statuses;
            return status.stacks;
        }
    }

    clearStacks(name: string) {
        const statuses = this.statuses.value;
        const status = getStatus(statuses, name);
        if (status) {
            const prevStacks = status.stacks;
            clearStacks(status);
            this.emit('stacks:clear', { status, count: 0, prevStacks });
            this.statuses.value = statuses;
            return status.stacks;
        }
    }

    get position(): Bab.Vector3 {
        return this.marker?.position;
    }

    get uniqueId() {
        return this.marker?.uniqueId;
    }

    set position(pos: Bab.Vector3) {
        if (this.marker) {
            this.marker.position = pos;
        }
    }

    get velocity(): Bab.Vector3 {
        return this.steering?.velocity;
    }

    set velocity(v: Bab.Vector3) {
        if (this.steering) {
            this.steering.velocity = v;
        }
    }


    tickStatuses(delta: number) {
        const finishedIds: string[] = [];

        const statuses = this.statuses.value;
        const len = statuses.length;
        for (let i = 0; i < len; i++) {
            if (statuses[i]) {
                let timeout = statuses[i].timeout;
                if (timeout !== undefined) {
                    timeout -= delta;
                    statuses[i].timeout = timeout;
                    if (!timeout || timeout <= 0) {
                        this.emit('status:done', { statuses, delta, status: statuses[i] });
                        finishedIds.push(statuses[i].id);
                    }
                }
            }
        }

        this.statuses.value = statuses;
        this.emit('status:tick', { statuses, delta });

        for (const id of finishedIds) {
            this.removeStatus(id);
        }
    }

    constructor(name: string, options: Partial<CharacterOptions>, scene: Bab.Scene, clock: Clock) {
        super();
        this.name = name;
        this.clock = clock;
        this.scene = scene;

        this.statuses = useState<Status[]>(`statuses-${this.name}`, () => []);

        const { worldClock } = useWorldClock();
        worldClock?.on('tick', (_time: number, delta: number) => {
            this.tickStatuses(delta);
        });

        const opts: CharacterOptions = {
            ...DefaultCharacterOptions,
            ...options,
        }

        // const yalmsPerMs = opts.speed / (5034 / 30);
        const yalmsPerMs = opts.speed / (5034 / 31);
        this.speed = yalmsToM(yalmsPerMs);
        this.speedRotation = clamp(opts.speedRotation);
        this.startPosition = opts.startPosition || Bab.Vector3.Zero();

        this.heads = opts.heads;
        this.diffuseColor = opts.diffuseColor;
        this.specularColor = opts.specularColor;
        this.role = opts.role;

        if (options.tags) {
            for (const tag of options.tags) {
                if (tag) {
                    this.tags.add(tag);
                }
            }
        }

        // 0.6 | 1.2125
        this.height = lerp(MinPlayerHeight, MaxPlayerHeight, opts.height);

        const { charMat, invisMat } = this.getMaterials();

        this.body = this.makeBody(charMat);

        this.collider = this.makeCollider(invisMat);

        this.head = this.makeHead(charMat);
        this.head.setParent(this.body);

        this.camMarker = this.makeCamMarker();
        this.camMarker.setParent(this.body)

        this.marker = this.makeMarker(charMat);
        this.steering = new Steering(this.marker, this.clock, {
            maxForce: this.speed,
        });
        this.position = this.startPosition.clone();
    }

    resetPosition() {
        this.position = this.startPosition.clone();
    }

    setCamera(camera: Bab.ArcRotateCamera) {
        this.camera = camera;
        camera.setTarget(this.camMarker.position.clone());
        camera.lockedTarget = this.camMarker;
    }

    setMarkerHeight() {
        if (!this.camera)
            return;
        // else:

        const maxHeight = 2.95;
        // const minDist = 14.65;
        const minDist = 17.65;
        const maxDist = 35 - minDist;

        const camPosition = this.camera.position.clone();
        camPosition.y = 0;

        const bounding = this.camMarker.getBoundingInfo();
        const markerPosition = bounding.boundingBox.centerWorld.clone();
        markerPosition.y = 0;


        const distance = camPosition.subtract(markerPosition).length();
        this.camMarker.position.y = this.head.position.y;
        this.camMarker.position.y += lerp(0, maxHeight, distance / maxDist);
    }

    getDirection(v: Bab.Vector3) {
        return this.marker.getDirection(v);
    }

    makeMarker(charMat: Bab.StandardMaterial) {
        const markerSize = yalmsToM(1.25);
        const markerMat = createMarkerMat(this.scene, charMat.diffuseColor);
        const marker = Bab.MeshBuilder.CreatePlane(`${this.name}-marker`, { height: markerSize, width: markerSize }, this.scene);
        marker.metadata = {
            ...marker.metadata,
            character: this,
            label: this.name,
        };
        marker.material = markerMat;
        marker.rotation.x = Math.PI / 2;

        this.collider.setParent(marker);
        this.body.setParent(marker);
        marker.rotation.z = Math.PI / 2;
        marker.position.y += 0.05;
        marker.bakeCurrentTransformIntoVertices();
        marker.checkCollisions = true;
        marker.isPickable = false;
        marker.position.y += 0.05;
        return marker;
    }

    makeBody(charMat: Bab.Material) {
        const torsoHeight = this.height * ((this.heads - 1) / this.heads);
        const body = Bab.MeshBuilder.CreateCylinder(`${this.name}-body`, {
            tessellation: 3,
            height: (torsoHeight * 0.945) * 0.75,
            diameterTop: this.height / (this.heads / 1.325),
            diameterBottom: this.height / (this.heads / 3),
        }, this.scene);
        body.material = charMat;
        body.position.y = (torsoHeight * 1.20) / 2;
        body.checkCollisions = false;
        body.isPickable = false;
        return body;
    }

    makeCollider(invisMat: Bab.Material) {
        const collider = Bab.MeshBuilder.CreateCylinder(`${this.name}-collider`, {
            tessellation: 3,
            height: (this.height * 3),
            diameter: 0.015,
        }, this.scene);
        collider.material = invisMat;
        collider.position.y = 0;
        collider.checkCollisions = true;
        return collider;
    }

    makeHead(charMat: Bab.Material) {
        // The Head
        const sphere = Bab.MeshBuilder.CreateSphere(`${this.name}-head`, { diameter: this.height * (1.25 / this.heads), segments: 32 }, this.scene);
        sphere.position.y = this.height;
        sphere.position.y -= (this.height * (1 / this.heads)) / 2;
        sphere.material = charMat;
        sphere.checkCollisions = false;
        sphere.isPickable = false;
        return sphere;
    }

    makeCamMarker() {
        const camMarker = Bab.MeshBuilder.CreatePlane(`${this.name}-cam-marker`, { width: 0.01, height: 0.01 }, this.scene);
        camMarker.position.y = this.height;
        camMarker.position.y += 0.65;
        camMarker.rotation.y = Math.PI / 2;
        camMarker.checkCollisions = false;
        camMarker.isPickable = false;
        camMarker.setEnabled(false); // Hide it!
        return camMarker;
    }

    getMaterials() {
        const charMat = new Bab.StandardMaterial(`${this.name}-char-mat`, this.scene);
        charMat.diffuseColor = this.diffuseColor;
        charMat.specularColor = this.specularColor;

        const invisMat = new Bab.StandardMaterial(`${this.name}-mat`, this.scene);
        invisMat.alpha = 0;

        return {
            charMat,
            invisMat,
        };
    }

    dispose() {
        this.head.dispose()
        this.body.dispose()
        this.marker.dispose()
        this.camMarker.dispose()
        this.collider.dispose()
    }
}

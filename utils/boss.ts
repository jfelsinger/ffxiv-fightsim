import * as Bab from '@babylonjs/core';
import { Steering } from './steering';
import { clamp, lerp } from './interpolation';
import { getPosition } from './positioning';
import { yalmsToM } from './conversions';
import createMarkerMat from '../materials/enemy-marker';
import { FightCollection } from './fight-collection';

import Debug from 'debug';
const debug = Debug('game:utils:boss');

export type BossOptions = {
    size: number
    image: string
    width?: number
    height?: number

    speed: number
    speedRotation: number
    tags?: string[]
    startPosition?: Bab.Vector3
};

export const DefaultBossOptions: BossOptions = {
    size: 5.5,
    image: '',

    speed: 1,
    speedRotation: 0.85,

    startPosition: Bab.Vector3.Zero(),
};

export class Boss {
    name: string;
    image: string;
    size: number;
    width: number;
    height: number;

    tags: Set<string> = new Set();
    stacks: Partial<Record<string, number>> = {};

    speed: number;
    speedRotation: number;

    body: Bab.Mesh;
    marker: Bab.Mesh;
    steering: Steering;
    startPosition: Bab.Vector3;
    collection: FightCollection;

    get uniqueId() {
        return this.marker?.uniqueId;
    }

    get position(): Bab.Vector3 {
        return this.marker?.position;
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

    get clock() { return this.collection.worldClock; }
    get scene() { return this.collection.scene; }

    constructor(name: string, options: Partial<BossOptions>, collection: FightCollection) {
        this.name = name;
        this.collection = collection;
        const opts: BossOptions = {
            ...DefaultBossOptions,
            ...options
        };

        this.image = opts.image || `/images/fights/m2s/boss.png`;

        const yalmsPerMs = opts.speed / (5034 / 31);
        this.speed = yalmsToM(yalmsPerMs);
        this.speedRotation = clamp(opts.speedRotation);
        this.startPosition = opts.startPosition || Bab.Vector3.Zero();

        if (opts.tags) {
            for (const tag of opts.tags) {
                if (tag) {
                    this.tags.add(tag);
                }
            }
        }

        this.size = opts.size;
        this.width = opts.width || this.size;
        this.height = opts.height || this.size;

        this.body = this.makeBody();
        this.marker = this.makeMarker();
        this.steering = new Steering(this.marker, this.clock, {
            maxForce: this.speed,
        });
    }

    addStacks(name: string, count = 1) {
        this.stacks[name] = (this.stacks[name] || 0) + count;
        return this.stacks[name];
    }

    removeStacks(name: string, count = 1) {
        this.stacks[name] = Math.max(0, (this.stacks[name] || 0) - count);
        return this.stacks[name];
    }

    clearStacks(name: string) {
        this.stacks[name] = 0;
    }

    makeMarker(): Bab.Mesh {
        const bossMarkerMat = createMarkerMat(this.collection.scene);

        const size = yalmsToM(this.size * 2);
        const bossMarker = Bab.MeshBuilder.CreatePlane('boss-marker', {
            size,
        }, this.collection.scene);
        bossMarker.rotation.x = Math.PI / 2;
        bossMarker.position.y = 0.02;
        bossMarker.material = bossMarkerMat;
        bossMarker.rotation.z = -Math.PI / 2;
        bossMarker.position.y += 0.05;
        bossMarker.bakeCurrentTransformIntoVertices();
        this.body.setParent(bossMarker);

        return bossMarker;
    }

    makeBody(): Bab.Mesh {
        const bodyMat = new Bab.StandardMaterial('boss-body-mat', this.collection.scene);
        bodyMat.diffuseTexture = new Bab.Texture(this.image);
        bodyMat.diffuseTexture.hasAlpha = true;
        bodyMat.emissiveColor = new Bab.Color3(0.65, 0.65, 0.65);
        bodyMat.useAlphaFromDiffuseTexture = true;

        const width = yalmsToM(this.width);
        const height = yalmsToM(this.height);
        const body = Bab.MeshBuilder.CreatePlane('boss-body', { width, height }, this.collection.scene);
        body.material = bodyMat;
        body.billboardMode = Bab.Mesh.BILLBOARDMODE_Y;


        return body;
    }

    dispose() {
        this.body.dispose();
        this.marker.dispose();
    }
}

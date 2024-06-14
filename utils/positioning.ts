import * as Bab from '@babylonjs/core';
import { FightCollection } from './fight-collection';

export type PositionType =
    | 'arena'
    | 'global'
    | 'mesh'
    | 'character';

export type PositionOption =
    | Bab.Vector3
    | (string[])
    | (number[])
    | string
    | (() => Bab.Vector3 | (string[]) | (number[]) | string)

export function getPositionVector(position: PositionOption | undefined, positionType: PositionType | undefined, collection: FightCollection) {
    let positionValue = typeof (position) === 'function' ? position() : position;

    if (typeof positionValue === 'string') {
        if (positionType === 'mesh') {
            const mesh = collection.scene.getMeshByName(positionValue);
            if (mesh) { return mesh.position.clone(); }

            const character = collection.characters[positionValue as any];
            if (character?.position) { return character.position.clone(); }
        } else if (positionType === 'character') {
            const character = collection.characters[positionValue as any];
            if (character?.position) { return character.position.clone(); }

            const mesh = collection.scene.getMeshByName(positionValue);
            if (mesh) { return mesh.position.clone(); }
        }

        // Convert to number value
        positionValue = positionValue.split(',').map((value) => +value);
    }

    if (Array.isArray(positionValue)) {
        const split = positionValue.map(v => parseNumber(v));
        if (
            split.length >= 2 &&
            split.length <= 3 &&
            split.every(val => !isNaN(val))
        ) {
            if (split.length === 2) {
                // Assume that we want the x,y on the arena plane: z is what we would think as the y plane kinda...
                return new Bab.Vector3(split[0], 0, split[1]);
            } else {
                // A regular Vector3
                return new Bab.Vector3(split[0], split[1], split[2]);
            }
        }

        return Bab.Vector3.Zero();
    }

    return positionValue?.clone() || Bab.Vector3.Zero();
}

export function getPosition(position: PositionOption | undefined, positionType: PositionType | undefined, collection: FightCollection) {
    let vec = getPositionVector(position, positionType, collection);

    if (positionType === 'arena') {
        vec = getArenaPosition(vec, collection);
    }

    return vec;
}

export function getArenaPosition(vec: Bab.Vector3, collection: FightCollection) {
    if (collection.arena) {
        vec = collection.arena.getPosition(vec);
    }

    return vec;
}

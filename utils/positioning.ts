import * as Bab from '@babylonjs/core';
import { FightCollection } from './fight-collection';
import { rangex1 } from './interpolation';

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

export function getInterpolatedPosition(
    positions: PositionOption[] | undefined,
    positionTypes: PositionType[] | undefined,
    steps: number[] | undefined,
    value: number,
    collection: FightCollection
) {
    if (!positions || positions?.length <= 1) {
        console.log('Nothing to interpolate, return default positioning');
        return getPosition(
            positions && positions[0],
            positionTypes && positionTypes[0],
            collection
        )
    }


    if (!steps || !steps.length) {
        const stepsLength = positions.length - 1;
        steps = Array(stepsLength)
            .fill(1.0 / stepsLength)
            .map((v, i) => v * (i + 1));
    }

    let currentStepIndex = steps.findIndex((v) => v >= value);
    if (currentStepIndex === -1) currentStepIndex = steps.length - 1;
    // console.log('steps: ', steps, currentStepIndex);

    const startValue = steps[currentStepIndex - 1] || 0;
    const startPosition = positions[currentStepIndex];
    const startPositionType = positionTypes && positionTypes[currentStepIndex];
    const start = getPosition(startPosition, startPositionType, collection)
    // console.log('start: ', startPosition, startPositionType);

    const endValue = steps[currentStepIndex];
    const endPosition = positions[currentStepIndex + 1];
    const endPositionType = positionTypes && positionTypes[currentStepIndex + 1];
    const end = getPosition(endPosition, endPositionType, collection)
    // console.log('end: ', endPosition, endPositionType);

    // console.log(`interpolate: from ${startValue} to ${endValue}: `, startValue, value);
    // console.log(`interpolate: x ${start.x} to ${end.x}`);
    // console.log(`interpolate: y ${start.y} to ${end.y}`);
    // console.log(`interpolate: z ${start.z} to ${end.z}`);

    // (window as any).rangex1 = rangex1;
    return new Bab.Vector3(
        rangex1(startValue, endValue, start.x, end.x, value),
        rangex1(startValue, endValue, start.y, end.y, value),
        rangex1(startValue, endValue, start.z, end.z, value),
    )
}

export function getArenaPosition(vec: Bab.Vector3, collection: FightCollection) {
    if (collection.arena) {
        vec = collection.arena.getPosition(vec);
    }

    return vec;
}

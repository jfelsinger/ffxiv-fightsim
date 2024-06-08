import * as Bab from '@babylonjs/core';

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

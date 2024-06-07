import * as Bab from '@babylonjs/core';

export function degToRads(deg: number) {
    return deg * (Math.PI / 180);
}
export function radToDegs(rad: number) {
    return rad / (Math.PI / 180);
}

export function isWithinRadius(x: number, y: number, radius: number, prec = 0) {
    const length = prec ? Math.round((x * x + y * y) * prec) : (x * x + y * y);
    const radiusLength = prec ? Math.round((radius * radius) * prec) : (radius * radius);
    return length <= radiusLength;
}

export function getVectorThetaLength(x: number, y: number) {
    const radians = Math.atan2(y, x);
    if (radians < 0) {
        return radians + Math.PI * 2;
    }
    return radians;
}

// Ugh, the order might be wrong who knows
export function vectorAngle(v: Bab.Vector3) {
    let angle = Math.atan2(v.x, v.z);
    angle = 180 * angle / Math.PI;
    angle = (360 + (Math.round(angle * 10) / 10)) % 360;
    return angle;
}

// export function getVectorAngle(v: Bab.Vector3) {
//     return vectorAngle(v.z, v.x);
// }
//
// export function vectorAngle(y: number, x: number) {
//     let angle = Math.atan2(y, x);
//     angle = 180 * angle / Math.PI;
//     angle = (360 + (Math.round(angle * 10) / 10)) % 360;
//     return angle;
// }

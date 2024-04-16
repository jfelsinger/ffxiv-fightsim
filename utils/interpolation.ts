export function lerp(x: number, y: number, a: number) {
    return x * (1 - a) + y * a;
}

export function clamp(a: number, min: number = 0, max: number = 1) {
    return Math.min(max, Math.max(min, a));
}

export function invlerp(x: number, y: number, a: number) {
    return clamp((a - x) / (y - x));
}

export function rangex1(x1: number, y1: number, x2: number, y2: number, a: number) {
    return lerp(x2, y2, invlerp(x1, y1, a));
}

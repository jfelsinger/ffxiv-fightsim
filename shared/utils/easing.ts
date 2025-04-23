export type EasingFunc = (x: number) => number;

export const linear = (x: number) => x;

export const easeInCirc = (x: number) => 1 - Math.sqrt(1 - (x ** 2));
export const easeOutCirc = (x: number) => easeInCirc(1 - x);

export const easeInQuad = (x: number) => x * x;
export const easeOutQuad = (x: number) => easeInQuad(1 - x);
export const easeInOutQuad = (x: number) =>
    x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2

export const easeInCubic = (x: number) => x * x * x;
export const easeOutCubic = (x: number) => easeInCubic(x - 1);
export const easeInOutCubic = (x: number) =>
    x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2;

export const easeInQuart = (x: number) => x * x * x * x;
export const easeOutQuart = (x: number) => easeInQuart(x - 1);
export const easeInOutQuart = (x: number) =>
    x < 0.5 ? 8 * x * x * x : 1 - ((-2 * x + 2) ** 4) / 2;

export const easeInExpo = (x: number) => x === 0 ? 0 : (2 ** (10 * x - 10));
export const easeOutExpo = (x: number) => x === 1 ? 1 : 1 - (2 ** (-10 * x));
export const easeInOutExpo = (x: number) =>
    x === 0 ? 0 :
        x === 1 ? 1 :
            x < 0.5 ? (2 ** (20 * x - 10)) / 2 :
                (2 - (2 ** (-20 * x + 10))) / 2;

export const easeInElastic = (x: number) => {
    const c4 = (2 * Math.PI) / 3;
    return (
        x === 0 ? 0 :
            x === 1 ? 1 :
                -(2 ** (10 * x - 10)) * Math.sin((x * 10 - 10.75) * c4)
    );
}
export const easeOutElastic = (x: number) => {
    const c4 = (2 * Math.PI) / 3;
    return (
        x === 0 ? 0 :
            x === 1 ? 1 :
                (2 ** (-10 * x)) * Math.sin((x * 10 - 0.75) * c4) + 1
    );
}
export const easeInOutElastic = (x: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return (
        x === 0 ? 0 :
            x === 1 ? 1 :
                x < 0.5 ? -((2 ** (20 * x - 10)) * Math.sin((20 * x - 11.125) * c5)) / 2 :
                    ((2 ** (-20 * x + 10)) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1
    );
}

export const easingFunctions: Partial<Record<string, EasingFunc>> = {
    default: linear,
    ease: easeInOutExpo,

    linear,
    easeInCirc,
    easeOutCirc,

    easeInQuad,
    easeInCubic,
    easeInQuart,
    easeInExpo,
    easeInElastic,

    easeOutQuad,
    easeOutCubic,
    easeOutQuart,
    easeOutExpo,
    easeOutElastic,

    easeInOutQuad,
    easeInOutCubic,
    easeInOutQuart,
    easeInOutExpo,
    easeInOutElastic,
} as const;

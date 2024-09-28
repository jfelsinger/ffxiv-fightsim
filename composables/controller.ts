import * as Bab from '@babylonjs/core';

export function useController() {
    const leftStickVector = useState<Bab.Vector3>('left-stick-vector', () => Bab.Vector3.Zero());
    const rightStickVector = useState<Bab.Vector3>('right-stick-vector', () => Bab.Vector3.Zero());

    const leftStickInvertX = useLocalStorage<boolean>('left-stick-invert-x', () => false);
    const leftStickInvertY = useLocalStorage<boolean>('left-stick-invert-y', () => false);
    const rightStickSensitivityX = useLocalStorage<number>('right-stick-x-sensitivity', () => 1.0);
    const rightStickSensitivityY = useLocalStorage<number>('right-stick-y-sensitivity', () => 1.15);
    const rightStickInvertX = useLocalStorage<boolean>('right-stick-invert-x', () => false);
    const rightStickInvertY = useLocalStorage<boolean>('right-stick-invert-y', () => false);

    const zoomInputActive = useLocalStorage<boolean>('controller-zoom-active', () => false);
    const zoomInputInverted = useLocalStorage<boolean>('controller-zoom-inverted', () => false);

    return {
        leftStickVector,
        rightStickVector,

        leftStickInvertX,
        leftStickInvertY,
        rightStickInvertX,
        rightStickInvertY,
        rightStickSensitivityX,
        rightStickSensitivityY,

        zoomInputActive,
        zoomInputInverted,
    }
}

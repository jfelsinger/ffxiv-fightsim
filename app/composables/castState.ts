export type CastState = {
    name?: string
    percent?: number
}

const defaultCastValue = undefined;

export function useCastState() {
    const cast = useState<CastState | undefined>('current-cast', () => defaultCastValue);
    (window as any).__castState = cast;

    function reset() {
        cast.value = defaultCastValue;
    }

    return {
        cast,
        reset,
    }
}

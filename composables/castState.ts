export type CastState = {
    name?: string
    percent?: number
}

export function useCastState() {
    const castState = useState<CastState | undefined>('current-cast', () => undefined);
    return castState;
}

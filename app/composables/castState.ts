export type CastState = {
    name?: string
    percent?: number
}

export function useCastState() {
    const castState = useState<CastState | undefined>('current-cast', () => undefined);
    (window as any).__castState = castState;
    return castState;
}

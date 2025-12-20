export function useReset() {
    const recorder = useRecorder();

    const { reset: resetWorldClock } = useWorldClock();
    const { reset: resetStick } = useController();
    const { reset: resetCast } = useCastState();

    function reset() {
        recorder.restart();
        resetWorldClock();
        resetStick();
        resetCast();

        clearNuxtState([
            // 'playerTime',
            // 'hits',
            // 'isHit',
            // 'isHit',
        ]);
    }

    return {
        reset,
    }
}

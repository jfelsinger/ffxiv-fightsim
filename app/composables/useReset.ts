export function useReset() {
    const recorder = useRecorder();

    function reset() {
        recorder.restart();
        clearNuxtState([
            // 'worldTime',
            // 'playerTime',
            // 'left-stick-vector',
            // 'right-stick-vector',
            // 'hits',
            // 'isHit',
            // 'current-cast',
            // 'isHit',
        ]);
    }

    return {
        reset,
    }
}

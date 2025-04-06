export function useWorldClock() {

    const worldTimeScaling = useState<number>('worldTimeScaling', () => 1.0);


    const windowClock: Clock | undefined = (window as any).__worldClock;
    const windowClockSet = !!windowClock;
    const worldClock = windowClock || new Clock({ name: 'world', paused: true, scaling: worldTimeScaling.value });
    (window as any).__worldClock = worldClock;

    const worldTime = useState<number>('worldTime', () => worldClock.time || 0);

    if (!windowClockSet) {
        worldClock.on('time-change', (time) => { worldTime.value = time });
        watch(worldTimeScaling, (scaling) => { worldClock.scaling = scaling });
    }

    return {
        worldTimeScaling,
        worldClock,
        worldTime,
    };
}

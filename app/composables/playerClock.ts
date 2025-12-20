export function usePlayerClock() {

    const playerTimeScaling = useState<number>('playerTimeScaling', () => 1.0);
    const playerClock = new Clock({ name: 'player', scaling: playerTimeScaling.value });
    (window as any).__playerClock = playerClock;

    const playerTime = useState<number>('playerTime', () => playerClock.time || 0);

    playerClock.on('tick', (time) => { playerTime.value = time });
    watch(playerTimeScaling, (scaling) => { playerClock.scaling = scaling });

    function reset() {
        playerClock.setTime(0);
    }

    return {
        playerTimeScaling,
        playerClock,
        playerTime,
        reset,
    };
}

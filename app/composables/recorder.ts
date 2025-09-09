const recordingGap = 1200;
export function useRecorder() {
    const snapshots = useState<([number, any])[]>('snapshots', () => []);
    const currentIndex = useState('snapshots-index', () => -1);
    const { worldClock } = useWorldClock();

    const latestTime = computed(() => {
        return snapshots.value[currentIndex.value]?.[0] || 0;
    })

    function restart() {
        if (snapshots.value.length) {
            snapshots.value = snapshots.value.slice(0, 1);
            currentIndex.value = 0;
        }
    }

    function recordCurrentSnapshot(time?: number) {
        time = time || worldClock.time;
        const snap = (window as any).__fight.toJSONSnapshot();
        if (snap) {
            recordSnapshot(
                time,
                snap
            )
        }
    }

    function recordSnapshot(time: number, snapshot: any) {
        if (!snapshot) { return; }
        if (currentIndex.value < (snapshots.value.length - 1)) {
            snapshots.value = snapshots.value.slice(0, Math.max(1, currentIndex.value));
            currentIndex.value = snapshots.value.length - 1;
        };

        snapshots.value.push([time, snapshot]);
        currentIndex.value++;
    }

    function onTick(time: number) {
        // if (time % 150) {
        if (time >= latestTime.value + recordingGap) {
            recordCurrentSnapshot(time);
        }
    }

    function register() {
        worldClock.on('tick', onTick);
    }

    function unregister() {
        worldClock.on('tick', onTick);
    }

    function windToTime(time: number) {
        if (snapshots.value.length <= 0) { return; }
        const _latestTime = latestTime.value;
        const lastIndex = snapshots.value.length - 1;
        const lastEntry = snapshots.value[lastIndex];
        let currentTime = _latestTime;
        let _currentIndex = currentIndex.value;
        let entry = snapshots.value[_currentIndex];


        if (time <= (_latestTime - recordingGap * 0.5)) {
            while (currentTime > time && _currentIndex > 0) {
                _currentIndex--;
                const currentEntry = snapshots.value[_currentIndex];
                if (currentEntry) {
                    entry = currentEntry;
                    currentTime = entry[0];
                }
            }
        } else if (_currentIndex < snapshots.value.length - 1 && time >= (_latestTime + recordingGap * 0.5)) {
            const lastIndex = snapshots.value.length - 1;
            const lastEntry = snapshots.value[lastIndex];
            if (lastEntry) {
                const lastTime = lastEntry[0];
                if (currentTime >= lastTime) {
                    currentIndex.value = lastIndex;
                    return lastEntry;
                }

                while (currentTime < time && _currentIndex < lastIndex) {
                    _currentIndex++;
                    const currentEntry = snapshots.value[_currentIndex];
                    if (currentEntry) {
                        entry = currentEntry;
                        currentTime = entry[0];
                    }
                }
            }
        } else if (time <= 0) {
            currentIndex.value = 0;
            return snapshots.value[0];
        } else if (time >= (lastEntry?.[0] ?? Infinity)) {
            currentIndex.value = lastIndex;
            return lastEntry;
        } else {
            console.log('windToTime() - weird:', time, currentTime, currentIndex, snapshots.value.length);
        }

        currentIndex.value = _currentIndex;
        return entry;
    }

    function loadSnapshotAt(time: number, clock?: Clock) {
        clock = clock || worldClock;
        let snapshot = windToTime(time);
        if (snapshot) {
            clock.setTime(snapshot[0]);
            (window as any).__fight.loadJSONSnapshot(snapshot[1]);
        }

        return snapshot;
    }

    return {
        snapshots,
        currentIndex,
        latestTime,

        recordCurrentSnapshot,
        recordSnapshot,
        windToTime,
        loadSnapshotAt,

        register,
        unregister,
        restart,
    };
}

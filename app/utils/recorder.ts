export class Recorder<T> {
    snapshots: ([number, T])[] = [];
    currentIndex: number = -1;

    get latestTime() {
        return this.snapshots[this.currentIndex]?.[0] || 0;
    }

    recordSnapshot(time: number, snapshot: T) {
        if (this.currentIndex < (this.snapshots.length - 1)) {
            this.snapshots = this.snapshots.slice(0, this.currentIndex);
            this.currentIndex--;
        };

        this.snapshots.push([time, snapshot]);
        this.currentIndex++;
    }

    windToTime(time: number) {
        if (this.snapshots.length < 0) { return; }
        const latestTime = this.latestTime;
        let currentTime = latestTime;
        let currentIndex = this.currentIndex;
        let entry = this.snapshots[currentIndex];


        if (time <= latestTime) {
            console.log('windBackToTime', { time, currentTime, currentIndex, latestTime, entry });

            while (currentTime > time && currentIndex > 0) {
                currentIndex--;
                const currentEntry = this.snapshots[currentIndex];
                if (currentEntry) {
                    entry = currentEntry;
                    currentTime = entry[0];
                }
            }
        } else if (currentIndex < this.snapshots.length - 1) {
            const lastIndex = this.snapshots.length - 1;
            const lastEntry = this.snapshots[lastIndex];
            console.log('windForwardToTime', { time, currentTime, currentIndex, latestTime, entry, lastIndex });
            if (lastEntry) {
                const lastTime = lastEntry[0];
                if (currentTime >= lastTime) {
                    this.currentIndex = lastIndex;
                    return lastEntry;
                }

                while (currentTime < time && currentIndex < lastIndex) {
                    currentIndex++;
                    const currentEntry = this.snapshots[currentIndex];
                    if (currentEntry) {
                        entry = currentEntry;
                        currentTime = entry[0];
                    }
                }
            }
        } else {
            console.log('windUHHHHhhh:', time, currentTime, currentIndex, this.snapshots.length);
        }

        this.currentIndex = currentIndex;
        return entry;
    }
}

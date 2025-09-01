import { useStorage } from '@vueuse/core';

export function useHits() {
    const hits = useState<number>('hits', () => 0);
    const route = useRoute();
    const hitsRecord = useStorage<number[]>(`hits-record-${route.path}`, () => []);

    const isHit = useState<boolean>('isHit', () => false);
    let hitTimeoutKey: ReturnType<typeof setTimeout> | undefined;

    const currentStreak = computed(() => {
        const record = hitsRecord.value;
        const len = record.length;
        if (!len) return 0;
        let streak = 0;
        for (let i = len; i > 0; i--) {
            if (record[i - 1] === 0) {
                streak++;
            } else {
                return streak;
            }
        }

        return streak;
    })

    const longestStreak = computed(() => {
        const record = hitsRecord.value;
        const len = record.length;
        if (!len) return 0;
        let longestStreak = 0;
        let streak = 0;
        for (let i = len; i > 0; i--) {
            if (record[i - 1] === 0) {
                streak++;
            } else {
                streak = 0;
            }

            if (streak > longestStreak) {
                longestStreak = streak;
            }
        }
        return longestStreak;
    })

    function recordHits(val?: number) {
        if (val === undefined) val = hits.value;
        hitsRecord.value.push(val);
    }

    function resetRecord() {
        hitsRecord.value = [];
    }

    callOnce(() => {
        watch(hits, (value: number, oldValue: number) => {
            if (value > oldValue) {
                isHit.value = true;
                clearTimeout(hitTimeoutKey);
                hitTimeoutKey = setTimeout(() => isHit.value = false, 725);
            }
        });
        watch(hits, (newHits, oldHits) => {
            if (newHits === 0 && oldHits !== 0) {
                recordHits(oldHits);
            }
            console.log('==== watch:hits ==== ==== | ', newHits, oldHits, hitsRecord.value, currentStreak.value, longestStreak.value);
        });
    });

    return {
        hits,
        hitsRecord,
        recordHits,
        resetRecord,
        currentStreak,
        longestStreak,
        isHit,
    }
}

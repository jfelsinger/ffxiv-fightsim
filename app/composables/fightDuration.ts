export function useFightDuration(fight: Fight) {

    const { worldTime } = useWorldClock();
    const duration = computed(() => fight?.getDuration?.() || 0);
    const elapsed = computed(() => Math.min(duration.value, worldTime.value));
    const elapsedPercent = computed(() => (elapsed.value || 0) / (duration.value || 1) * 100);

    return {
        duration,
        elapsed,
        elapsedPercent,
    }
}

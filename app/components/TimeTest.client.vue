<script setup lang="ts">
const {
    worldTime,
    worldTimeScaling,
    worldClock,
} = useWorldClock();
const duration = 1000 * 10;

worldClock.at((_, delta) => {
    console.log('100, forward', delta);
}, 100);

worldClock.at((_, delta) => {
    console.log('200, forward', delta);
}, 200, {
    undo(_, delta) {
        console.log('200, backwards', delta);
    }
});

// worldClock.on('time-change', (time, delta) => {
//     console.log('time-change: ', time, delta);
// });

let run = ref(false);
let zero = (document.timeline.currentTime as number) || 0;
let delta = 0;
requestAnimationFrame(runClock);
function runClock(timestamp: number) {
    delta = timestamp - zero;

    if (run.value) {
        worldClock.tick(delta);
        zero = timestamp;
        requestAnimationFrame(runClock);
    }
}

onMounted(() => {
    run.value = true;
})

onBeforeUnmount(() => {
    run.value = false;
})
</script>

<template>
    <div class="w-full relative h-screen p-4 bg-slate-900">
        <TimeBar :override-duration="duration" class="left-1/2 -translate-x-1/2 -translate-y-32" />
    </div>
</template>

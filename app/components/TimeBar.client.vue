<script setup lang="ts">
const emit = defineEmits<{
    (e: 'start'): void,
    (e: 'pause'): void,
    (e: 'reset'): void,
    (e: 'scale-time', val: number): void,
}>();

const props = defineProps<{
    fight: Fight,
}>();

const isPaused = ref(true);

const globalTelegraph = useState<number>('telegraph', () => 1.0);
const telegraph = computed({
    get() {
        return globalTelegraph.value * 100;
    },
    set(value: number) {
        value = Math.max(5, Math.min(100, value));
        globalTelegraph.value = value / 100;
    }
});

function togglePause() {
    if (isPaused.value) {
        if (props.fight?.clock) {
            props.fight.clock.start();
            emit('start');
        }
    } else {
        if (props.fight?.clock) {
            props.fight.clock.pause();
            emit('pause');
        }
    }
}

function toggleTelegraph() {
    if (telegraph.value > 50) {
        telegraph.value = 5;
    } else {
        telegraph.value = 100;
    }
}

const { worldClock, worldTime } = useWorldClock();
const currentMinutes = computed(() => ('00' + (Math.floor(worldTime.value / 1000 / 60) % 99)).slice(-2));
const currentSeconds = computed(() => ('00' + (Math.floor(worldTime.value / 1000) % 60)).slice(-2));
const {
    duration,
    elapsedPercent
} = useFightDuration(props.fight);

const inputElapsedPercent = computed({
    get() { return elapsedPercent.value; },
    set(value: number) {
        worldClock.setTime(duration.value * (value / 100))
    }
});

const worldTimeScaling = useState<number>('worldTimeScaling', () => 1.0);

function updateTime(val: number) {
    emit('scale-time', val);
}

function reset() {
    emit('reset');
}
</script>

<template>
    <div class="fight-bot-center flex flex-col absolute bottom-12 z-50">
        <div class="flex p-2 bg-slate-100/45 rounded-box bg-blur min-w-96 gap-2 items-center">
            <div class="tooltip tooltip-bottom" data-tip="Start/Pause <Space>">
                <label @click="togglePause()"
                    class="swap swap-rotate btn btn-sm bg-transparent border-transparent shadow-none px-2"
                    :class="{ 'swap-active': isPaused }">
                    <Icon class="swap-on" name="solar:play-circle-linear" />
                    <Icon class="swap-off" name="solar:pause-circle-linear" />
                </label>
            </div>
            <div class="flex flex-col w-full">
                <!--
                <progress class="progress w-full" :value="elapsedPercent" max="100"></progress>
                -->
                <input type="range" min="0" max="100" v-model="inputElapsedPercent" class="range range-xs" />
            </div>
            <div class="pr-1 text-xs flex items-center">
                <span class="countdown font-mono">
                    <span :style="{ '--value': currentMinutes }"></span>:
                    <span :style="{ '--value': currentSeconds }"></span>
                </span>
            </div>
            <div class="dropdown dropdown-hover dropdown-top tooltip tooltip-bottom" data-tip="Game Speed">
                <div tabindex="0" role="button" class="btn btn-sm bg-transparent border-transparent shadow-none px-2">
                    <Icon name="solar:stopwatch-linear" />
                </div>
                <ul tabindex="0" class="dropdown-content z-[51] menu p-2 shadow bg-base-100 rounded-box text-xs">
                    <li v-for="val in ['2.0', '1.0', 0.75, 0.50]" :class="{ 'opacity-50': worldTimeScaling == val }">
                        <a @click.stop.prevent="updateTime(+val)">{{ val }}</a>
                    </li>
                </ul>
            </div>
            <div class="dropdown dropdown-hover dropdown-top tooltip tooltip-bottom" data-tip="Attack Telegraphing">
                <div tabindex="0" role="button" class="btn btn-sm bg-transparent border-transparent shadow-none px-2">
                    <label @click="toggleTelegraph" class="swap" :class="{ 'swap-active': telegraph > 50 }">
                        <Icon class="swap-on" name="solar:eye-broken" />
                        <Icon class="swap-off" name="solar:eye-closed-bold-duotone" />
                    </label>
                </div>
                <div tabindex="0" class="dropdown-content z-[51] menu p-2 shadow bg-base-100 rounded-box text-xs
                    min-w-24">
                    <input type="range" min="0" max="100" v-model="telegraph" class="range range-xs" />
                </div>
            </div>
            <button @click="reset()"
                class="tooltip tooltip-bottom px-2 btn btn-sm bg-transparent border-transparent shadow-none"
                data-tip="Restart Fight">
                <Icon name="solar:refresh-bold" />
            </button>
        </div>
    </div>
</template>

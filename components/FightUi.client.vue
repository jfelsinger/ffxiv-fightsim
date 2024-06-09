<script setup lang="ts">
import * as YAML from 'yaml';
import {
    type Scheduled,
} from '../utils/scheduled';
import { Fight, } from '../utils/fights';
import { FightSection } from '../utils/sections';
import { decodeFight } from '../utils/decode-fight';
import type { NuxtLink } from '#build/components';

const emit = defineEmits<{
    (e: 'update', value: Fight): void,
    (e: 'reset-position'): void,
    (e: 'start'): void,
    (e: 'pause'): void,
    (e: 'scale-time', val: number): void,
}>();

const props = defineProps({
    fight: Fight,
});

const isPaused = ref(true);

const name = computed(() => props.fight?.name || 'Unnamed');
const sections = computed(() => props.fight?.sections || []);

const duration = computed(() => props.fight?.getDuration() || 0);
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

function toggleTelegraph() {
    if (telegraph.value > 50) {
        telegraph.value = 5;
    } else {
        telegraph.value = 100;
    }
}

const currentTime = useState<number>('worldTime', () => 0);
const currentMinutes = computed(() => ('00' + (Math.floor(currentTime.value / 1000 / 60) % 99)).slice(-2));
const currentSeconds = computed(() => ('00' + (Math.floor(currentTime.value / 1000) % 60)).slice(-2));
// const currentTime = ref(props.fight?.clock?.time || 0);
const elapsed = computed(() => Math.min(duration.value, currentTime.value));
const elapsedPercent = computed(() => (elapsed.value || 0) / (duration.value || 1) * 100);

const worldTimeScaling = useState<number>('worldTimeScaling', () => 1.0);

// props.fight?.clock.on('tick', () => {
//     currentTime.value = props.fight?.clock.time || 0;
// });

const language = ref('yaml');
const encoded = ref(YAML.stringify(props.fight).trim());

function isEncodedChanged() {
    if (language.value === 'yaml') {
        const encodeCurrent = YAML.stringify(props.fight).trim();
        return YAML.stringify(YAML.parse(encoded.value))?.trim() !== encodeCurrent;
    } else {
        const encodeCurrent = JSON.stringify(props.fight).trim();
        return JSON.stringify(JSON.parse(encoded.value))?.trim() !== encodeCurrent;
    }
}

function resetEncoded(force = false) {
    if (language.value === 'yaml') {
        const resetValue = YAML.stringify(props.fight).trim();
        if (force) {
            encoded.value = resetValue;
            return;
        }

        try {
            if (isEncodedChanged()) {
                console.log('reset encoded!');
                encoded.value = resetValue;
            }
        } catch (err) {
            console.log('reset encoded!', err);
            encoded.value = resetValue;
        }
    } else if (language.value === 'json') {
        const resetValue = JSON.stringify(props.fight, null, 2).trim();
        if (force) {
            encoded.value = resetValue;
            return;
        }

        try {
            if (isEncodedChanged()) {
                encoded.value = resetValue;
            }
        } catch (err) {
            encoded.value = resetValue;
        }
    }
}

function onSave() {
    if (isEncodedChanged() && encoded.value && props.fight) {
        try {
            const updatedFight = decodeFight(encoded.value, {
                collection: props.fight.collection,
                clock: props.fight?.clock,
            });

            console.log('Save: ', updatedFight);
            emit('update', updatedFight);
        } catch (err) {
            console.error('Save fail: ', err);
        }
    }
}

watch(language, (newValue: string, oldValue: string) => {
    if (newValue !== oldValue) {
        if (newValue === 'json' && oldValue === 'yaml') {
            encoded.value = JSON.stringify(YAML.parse(encoded.value), null, 2).trim();
        } else if (newValue === 'yaml' && oldValue === 'json') {
            encoded.value = YAML.stringify(JSON.parse(encoded.value)).trim();
        }
    }
});

function updateSection(section: Scheduled<FightSection>, i: number) {
    console.log('update section: ', section, i);
    const fight = props.fight;
    if (fight) {
        fight.sections[i] = section;
        emit('update', fight);
    }
}

const openSide = ref('');

function open(side: string) {
    if (openSide.value === side) {
        openSide.value = '';
    } else {
        if (side === 'code') {
            resetEncoded(true);
        }

        openSide.value = side;
    }
}

function reset() {
    open('');
    if (props.fight) {
        emit('update', props.fight.clone());
    }
}

function resetPosition() {
    emit('reset-position');
}

if (props.fight?.clock) {
    props.fight.clock.on('start', () => {
        console.log('CLOCK START!');
        isPaused.value = false;
    });
    props.fight.clock.on('pause', () => {
        console.log('CLOCK PAUSE!');
        isPaused.value = true;
    });
}
function togglePause() {
    if (isPaused.value) {
        if (props.fight?.clock) {
            props.fight.clock.start();
        }
    } else {
        if (props.fight?.clock) {
            props.fight.clock.pause();
        }
    }
}

function handleKeyPress(event: KeyboardEvent) {
    if (event.target && (event.target as HTMLElement).matches('input,textarea,[role=textbox],[role=input]')) {
        return;
    }

    if (event.code === 'Space') {
        console.log('event: ', event, event.target);
        event.preventDefault();
        event.stopPropagation();
        togglePause();
        return false;
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeyPress);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyPress);
});

function updateTime(val: number) {
    emit('scale-time', val);
}
</script>

<template>
    <div>
        <div class="fight-bot-center flex flex-col absolute bottom-12 z-50">

            <div class="flex p-2 bg-slate-100/45 rounded-box bg-blur min-w-96 gap-2 items-center">
                <label @click="togglePause()"
                    class="swap swap-rotate btn btn-sm bg-transparent border-transparent shadow-none px-2 "
                    :class="{ 'swap-active': isPaused }">
                    <Icon class="swap-on" name="solar:play-circle-linear" />
                    <Icon class="swap-off" name="solar:pause-circle-linear" />
                </label>
                <progress class="progress flex-shrink" :value="elapsedPercent" max="100"></progress>
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
                        <li v-for="val in ['1.0', 0.75, 0.50]" :class="{ 'opacity-50': worldTimeScaling == val }">
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

        <div class="fight__sidebar z-50">
            <div class="fight__sidebar-content p-2 z-70">
                <ul class="menu bg-slate-100/45  rounded-box">
                    <li>
                        <button @click="open('ui')" class="tooltip tooltip-right px-2" data-tip="Open UI">
                            <Icon name="solar:round-alt-arrow-right-broken" />
                        </button>
                    </li>
                    <li>
                        <button @click="open('code')" class="tooltip tooltip-right px-2" data-tip="Edit Fight Code">
                            <Icon name="solar:code-square-broken" />
                        </button>
                    </li>
                    <li>
                        <button @click="resetPosition()" class="tooltip tooltip-right px-2" data-tip="Reset Position">
                            <Icon name="solar:map-point-broken" />
                        </button>
                    </li>
                    <li>
                        <button @click="reset()" class="tooltip tooltip-right px-2" data-tip="Restart Fight">
                            <Icon name="solar:refresh-bold" />
                        </button>
                    </li>
                    <li>
                        <NuxtLink to="/" class="tooltip tooltip-right px-2" data-tip="Home">
                            <Icon name="solar:home-2-broken" />
                        </NuxtLink>
                    </li>
                </ul>
            </div>

            <div class="fight__drawer-side mt-2 ml-[4.125rem] max-w-md min-w-[20rem]"
                :class="{ '--open': openSide === 'ui' }">
                <div
                    class="fight-ui p-2 bg-slate-100/45 rounded collapse clip-collapse collapse-arrow w-full max-w-md min-w-[20rem]">
                    <input type="checkbox" />

                    <div class="collapse-title flex items-center gap-4">
                        <h2 class="flex-grow-2 min-w-fit">{{ name }}</h2>
                        <!--
                        <div class="radial-progress" :style="{
                            '--value': elapsedPercent,
                            '--size': '1rem',
                            '--thickness': '0.25rem',
                        }" role="progressbar"></div>
                        -->
                        <progress class="progress flex-shrink" :value="elapsedPercent" max="100"></progress>
                        <CodeButton @open="() => resetEncoded(true)" class="dropdown-right float-right relative z-[60]">
                            <CodeArea @save="onSave" @update:lang="(l: string) => language = l" :lang="language"
                                v-model="encoded" />
                        </CodeButton>
                    </div>

                    <div class="collapse-content">
                        <p>Duration: {{ duration / 1000 }}s</p>
                        <p>Elapsed: {{ Math.round(elapsed / 100) / 10 }}s</p>

                        <h4>Fight Sections:</h4>
                        <div v-if="fight" class="fight__sections join join-vertical w-full">
                            <ScheduledFightSection @update="(value) => updateSection(value, i)"
                                v-for="(section, i) in sections" :index="i" :fight="fight" :scheduled="section" />
                        </div>

                    </div>
                </div>
            </div>

            <div class="fight__drawer-side mt-2 ml-[4.125rem] max-w-xl min-w-[20rem]"
                :class="{ '--open': openSide === 'code' }">
                <CodeArea class="max-h-[80vh]" @save="() => { onSave(); openSide = ''; }"
                    @update:lang="(l: string) => language = l" :lang="language" v-model="encoded" />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.fight-ui {
    position: relative;
    z-index: 50;
    // top: 0rem;
    // left: 1rem;
    backdrop-filter: blur(5px) brightness(1.15);
}

.fight-bot-center {
    left: 50%;
    transform: translateX(-50%);
}

.fight__sidebar {
    position: relative;
    flex-direction: column;
}

.fight__sidebar-content {
    position: absolute;
    z-index: 55;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;

    >.menu {
        backdrop-filter: blur(5px) brightness(1.15);
    }
}

.fight__drawer-side {
    position: absolute;
    top: 0;
    left: 0;
    width: 45%;

    transition: transform 220ms ease;

    &,
    &.--close {
        transform: translateX(-200%);
    }

    &.--open {
        transform: translateX(0);
    }
}

// .fight__sections {
//     // display: flex;
//     // flex-direction: column;
//     // margin-top: 1rem;
//     // gap: 1rem;
// }
</style>

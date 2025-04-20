<script setup lang="ts">
import * as YAML from 'yaml';

const emit = defineEmits<{
    (e: 'update', value: Fight): void,
    (e: 'reset-position'): void,
    (e: 'start'): void,
    (e: 'pause'): void,
    (e: 'scale-time', val: number): void,
}>();

const props = defineProps<{
    fight: Fight,
    info?: any,
}>();

const isPaused = ref(true);
const { isTutorial } = useTutorialMode();

const name = computed(() => props.fight?.name || 'Unnamed');
const sections = computed(() => props.fight?.sections || []);

const {
    duration,
    elapsed,
    elapsedPercent,
} = useFightDuration(props.fight);

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
                encoded.value = resetValue;
            }
        } catch (err) {
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


const { toggleEditMode } = useEditMode();
const { currentSideSection: openSide, openSection } = useSidebar();
function open(side: string) {
    if (openSection(side as any) === 'code') {
        resetEncoded(true);
    }
}

function reset() {
    open('');
    if (props.fight) {
        const fight = props.fight;
        fight.clock.pause();
        emit('update', fight.clone());
        fight.dispose();
    }
}

function resetPosition() {
    emit('reset-position');
}

if (props.fight?.clock) {
    props.fight.clock.on('start', () => {
        isPaused.value = false;
    });
    props.fight.clock.on('pause', () => {
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
</script>

<template>
    <div class="fight-ui__container">
        <ControllerSettings />
        <TimeBar :fight="fight" @reset="reset" />

        <div class="fight__sidebar z-50">
            <div class="fight__sidebar-content p-2 z-70">
                <ul class="menu bg-slate-100/45  rounded-box">
                    <li v-if="!isTutorial">
                        <button @click="open('ui')" class="tooltip tooltip-right px-2" data-tip="Open UI">
                            <Icon name="solar:round-alt-arrow-right-broken" />
                        </button>
                    </li>
                    <li v-if="!isTutorial">
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
                    <li v-if="info">
                        <button @click="open('info')" class="tooltip tooltip-right px-2" data-tip="Fight Info">
                            <Icon name="solar:info-circle-linear" />
                        </button>
                    </li>
                    <li>
                        <NuxtLink @click="toggleEditMode" class="tooltip tooltip-right px-2"
                            data-tip="Edit Position of Some UI Items">
                            <Icon name="solar:ruler-pen-line-duotone" />
                        </NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/" class="tooltip tooltip-right px-2" data-tip="Home">
                            <Icon name="solar:home-2-broken" />
                        </NuxtLink>
                    </li>
                </ul>
            </div>

            <div class="fight__drawer-side mt-2 ml-[4.125rem] max-w-md min-w-[20rem]" v-if="info"
                :class="{ '--open': openSide === 'info' }">
                <div
                    class="rounded-box shadow-xl p-3 py-3 pr-0 bg-slate-100 collapse clip-collapse collapse-arrow w-full max-w-md min-w-[20rem] relative">
                    <button @click="open('')" class="absolute right-0 top-0 p-3 z-[1]">
                        <Icon name="solar:close-circle-line-duotone" />
                    </button>
                    <div class="prose text-sm m-1">
                        <h2 class="font-normal text-sm text-slate-600 opacity-90 pr-4 mb-1">{{ info.raid }}</h2>
                        <h1 class="font-normal text-2xl pr-4 mb-1">
                            <span v-if="info.category">{{ info.category }},</span>
                            {{ info.title }}
                        </h1>
                        <div class="max-h-[80vh] overflow-y-auto pr-3">
                            <ContentRenderer :value="info" />
                        </div>
                    </div>
                </div>
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

        <UiRolePicker @select="reset()" />
        <TutorialWindow :fight="fight" />
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
// }</style>

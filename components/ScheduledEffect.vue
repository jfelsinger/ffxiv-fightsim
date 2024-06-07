<script setup lang="ts">
import * as YAML from 'yaml';
import { decodeScheduledEffect } from '../utils/decode-fight';
import {
    type Scheduled,
    getScheduledDuration,
} from '../utils/scheduled';
import { Fight, } from '../utils/fight';
import { FightSection, } from '../utils/sections';
import { Mechanic } from '../utils/mechanics';
import { Effect, } from '../utils/effects';

const props = defineProps<{
    fight: Fight,
    section: FightSection,
    mechanic: Mechanic,
    scheduled: Scheduled<Effect>,
    index: number,
}>();

const emit = defineEmits<{
    (e: 'update', value: Scheduled<Effect>): void,
}>();

const effect = computed(() => props.scheduled.item);
const duration = computed(() => props.scheduled ? getScheduledDuration(props.scheduled, (i) => i.getDuration()) : 0 || 0);
const currentTime = useState<number>('worldTime', () => 0);
const elapsed = computed(() => Math.min(duration.value, currentTime.value));
const elapsedPercent = computed(() => (elapsed.value || 0) / (duration.value || 1) * 100);
const repeats = computed(() => props.scheduled.repeat || 0);

const language = ref('yaml');
const encoded = ref(YAML.stringify(props.scheduled).trim());

function isEncodedChanged() {
    if (language.value === 'yaml') {
        const encodeCurrent = YAML.stringify(props.scheduled).trim();
        return YAML.stringify(YAML.parse(encoded.value))?.trim() !== encodeCurrent;
    } else {
        const encodeCurrent = JSON.stringify(props.scheduled).trim();
        return JSON.stringify(JSON.parse(encoded.value))?.trim() !== encodeCurrent;
    }
}

function resetEncoded(force = false) {
    if (language.value === 'yaml') {
        const resetValue = YAML.stringify(props.scheduled).trim();
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
        const resetValue = JSON.stringify(props.scheduled, null, 2).trim();
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

watch(language, (newValue: string, oldValue: string) => {
    if (newValue !== oldValue) {
        if (newValue === 'json' && oldValue === 'yaml') {
            encoded.value = JSON.stringify(YAML.parse(encoded.value), null, 2).trim();
        } else if (newValue === 'yaml' && oldValue === 'json') {
            encoded.value = YAML.stringify(JSON.parse(encoded.value)).trim();
        }
    }
});

function onSave() {
    if (isEncodedChanged() && encoded.value && props.scheduled) {
        try {
            const updated = decodeScheduledEffect(encoded.value, {
                collection: props.fight.collection,
                clock: props.fight?.clock,
            });

            console.log('Save: ', updated);
            emit('update', updated);
        } catch (err) {
            console.error('Save fail: ', err);
        }
    }
}
</script>

<template>
    <div class="fight-effect">
        <div class="flex gap-2 items-center">
            <p class="min-w-fit">{{ effect?.name || 'Effect' }} {{ index + 1 }}</p>
            <div class="progress-marks h-3  w-full flex items-center" :style="{ '--runs': 1 + (repeats || 0) }">
                <div class="marks__container">
                    <i class="bg-slate-800" v-for="_ in (repeats || 0)"></i>
                </div>
                <progress class="progress" :value="elapsedPercent" max="100"></progress>
            </div>
            <CodeButton @open="() => resetEncoded(true)" class=" dropdown-right float-right relative z-30">
                <CodeArea @save="onSave" @update:lang="(l: string) => language = l" :lang="language" v-model="encoded" />
            </CodeButton>
        </div>
    </div>
</template>

<style lang="scss">
.progress-marks {

    position: relative;
    overflow: hidden;

    .marks__container {
        display: flex;
        align-items: center;
        position: absolute;
        z-index: 2;
        top: 50%;
        left: 0;
        width: 100%;
        height: 100%;
        transform: translateY(-50%);
        justify-content: space-evenly;

        i {
            display: block;
            width: 1px;
            height: 100%;
            opacity: 0.5;
        }
    }

    progress {
        position: relative;
    }
}
</style>

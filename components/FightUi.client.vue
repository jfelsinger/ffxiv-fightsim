<script setup lang="ts">
import { yaml as langYaml } from '@codemirror/lang-yaml';
import { json as langJson } from '@codemirror/lang-json';
import { oneDarkTheme } from '@codemirror/theme-one-dark';
import CodeMirror from 'vue-codemirror6';

import * as YAML from 'yaml';
// import hljs from 'highlight.js';
import {
    Fight,
    FightSection,
    Mechanic,
    Effect,
} from '../utils/effects';

const props = defineProps({
    fight: Fight,
});

const name = computed(() => props.fight?.name || 'Unnamed');
const sections = computed(() => props.fight?.sections || []);

const duration = computed(() => props.fight?.getDuration() || 0);
const currentTime = ref(props.fight?.clock?.time || 0);
const elapsed = computed(() => Math.min(duration.value, currentTime.value));
const elapsedPercent = computed(() => (elapsed.value || 0) / (duration.value || 1) * 100);

props.fight?.clock.on('tick', () => {
    currentTime.value = props.fight?.clock.time || 0;
});

const language = ref('yaml');
const encoded = ref(YAML.stringify(props.fight).trim());
const cmLanguage = computed(() => language.value === 'yaml' ? langYaml() : langJson());

watch(language, (newValue: string, oldValue: string) => {
    if (newValue !== oldValue) {
        if (newValue === 'json' && oldValue === 'yaml') {
            encoded.value = JSON.stringify(YAML.parse(encoded.value), null, 2).trim();
        } else if (newValue === 'yaml' && oldValue === 'json') {
            encoded.value = YAML.stringify(JSON.parse(encoded.value)).trim();
        }
    }
});

function updateLanguage(updatedLang: string) {
    console.log('Update Language: ', updatedLang);
    language.value = updatedLang;
}


// const json = computed({
//     get() {
//         if (language.value === 'json') {
//             return encoded.value
//         }
//         return JSON.stringify(YAML.parse(encoded.value), null, 2);
//     },
//
//     set(newValue) {
//         if (language.value === 'json') {
//             encoded.value = newValue;
//         }
//         encoded.value = JSON.stringify(YAML.parse(newValue), null, 2).trim();
//     },
// });

// const yaml = computed({
//     get() {
//         if (language.value === 'yaml') {
//             return encoded.value
//         }
//         return YAML.stringify(JSON.parse(encoded.value));
//     },
//
//     set(newValue) {
//         if (language.value === 'yaml') {
//             encoded.value = newValue.trim();
//         }
//         encoded.value = YAML.stringify(JSON.parse(newValue)).trim();
//     },
// });

</script>

<template>
    <div class="fight-ui">
        <h2>{{ name }}</h2>
        <p>Duration: {{ duration / 1000 }}s</p>
        <p>Elapsed: {{ Math.round(elapsed / 100) / 10 }}s</p>
        <div class="radial-progress" :style="{
            '--value': elapsedPercent,
            '--size': '1rem',
            '--thickness': '0.25rem',
        }" role="progressbar"></div>
        <progress class="progress" :value="elapsedPercent" max="100"></progress>

        <div v-if="fight" class="fight__sections join join-vertical w-36">
            <ScheduledFightSection v-for="(section, i) in sections" :index="i" :fight="fight" :scheduled="section"
                class="collapse collapse-arrow join-item border border-base-300" />
        </div>

        <div class="codemirror-container bg-slate-200 max-h-[200px] flex flex-column">
            <div class="p-1 border-b-[1px] border-b-slate-300">
                <select class="select select-bordered select-xs w-20 z-20 xabsolute top-1 right-5" v-model="language">
                    <option>yaml</option>
                    <option>json</option>
                </select>
            </div>
            <div class="overflow-y-scroll">
                <CodeMirror tab wrap basic :tab-size="2" :dark="false" v-model="encoded" :lang="cmLanguage" />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.fight-ui {
    position: absolute;
    z-index: 20;
    top: 1rem;
    left: 1rem;
}

.codemirror-container {
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    overflow: hidden;
    position: relative;

    .vue-codemirror {

        >.cm-editor {
            padding-right: 0.5rem;
        }
    }
}

// .fight__sections {
//     // display: flex;
//     // flex-direction: column;
//     // margin-top: 1rem;
//     // gap: 1rem;
// }
</style>

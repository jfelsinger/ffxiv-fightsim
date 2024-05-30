<script setup lang="ts">
import * as YAML from 'yaml';

import { yaml as langYaml } from '@codemirror/lang-yaml';
import { json as langJson } from '@codemirror/lang-json';

import CodeMirror from 'vue-codemirror6';

const props = withDefaults(defineProps<{
    modelValue: string,
    lang: string,
}>(), { lang: 'yaml' });

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void,
    (e: 'update:lang', value: string): void,
    (e: 'save', value: string): void,
}>();

const code = computed<string>({
    get() {
        return props.modelValue;
    },

    set(newValue: string) {
        emit('update:modelValue', newValue);
    },
});


const language = computed<string>({
    get() {
        return props.lang || 'yaml';
    },

    set(newValue: string) {
        emit('update:lang', newValue);
    },
});

const cmLanguage = computed(() => language.value === 'yaml' ? langYaml() : langJson());

const saveButton = ref<HTMLElement>();
function save() {
    emit('save', code.value);
    saveButton.value?.blur();
}

watch(language, (newValue: string, oldValue: string) => {
    if (newValue !== oldValue) {
        if (newValue === 'json' && oldValue === 'yaml') {
            try {
                code.value = JSON.stringify(YAML.parse(code.value), null, 2).trim();
            } catch (err) {
                console.error(err);
            }
        } else if (newValue === 'yaml' && oldValue === 'json') {
            try {
                code.value = YAML.stringify(JSON.parse(code.value)).trim();
            } catch (err) {
                console.error(err);
            }
        }
    }
});
</script>

<template>
    <div class="codemirror-container bg-slate-200 max-h-[480px] flex flex-column">
        <div class="p-1 border-b-[1px] border-b-slate-300 gap-2 flex items-center justify-between">
            <select class="select select-bordered select-xs w-20 z-20 xabsolute top-1 right-5" v-model="language">
                <option>yaml</option>
                <option>json</option>
            </select>
            <button ref="saveButton" class="btn btn-sm" @click.stop.prevent="save">save</button>
        </div>
        <div class="overflow-y-scroll">
            <CodeMirror tab wrap basic :tab-size="2" :dark="false" v-model="code" :lang="cmLanguage" />
        </div>
    </div>
</template>

<style lang="scss">
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
</style>

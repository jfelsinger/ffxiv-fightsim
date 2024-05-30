<script setup lang="ts">
import * as YAML from 'yaml';
import { Fight } from '../utils/effects';
import { decodeFight } from '../utils/decode-fight';

const emit = defineEmits<{
    (e: 'update', value: Fight): void,
}>();

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

const encodedChanged = computed(() => {
    if (language.value === 'yaml') {
        const encodeCurrent = YAML.stringify(props.fight).trim();
        return YAML.stringify(YAML.parse(encoded.value))?.trim() !== encodeCurrent;
    } else {
        const encodeCurrent = JSON.stringify(props.fight).trim();
        return JSON.stringify(JSON.parse(encoded.value))?.trim() !== encodeCurrent;
    }
});

function onSave() {
    if (encodedChanged.value && encoded.value && props.fight) {
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

</script>

<template>
    <div class="fight-ui p-2 bg-slate-100/25 rounded collapse clip-collapse collapse-arrow max-w-md">
        <input type="checkbox" />

        <div class="collapse-title relative flex items-center gap-4">
            <h2 class="flex-grow-2 min-w-fit">{{ name }}</h2>
            <!--
            <div class="radial-progress" :style="{
                '--value': elapsedPercent,
                '--size': '1rem',
                '--thickness': '0.25rem',
            }" role="progressbar"></div>
            -->
            <progress class="progress flex-shrink" :value="elapsedPercent" max="100"></progress>
            <CodeButton class=" dropdown-right float-right relative z-30">
                <CodeArea @save="onSave" @update:lang="(l: string) => language = l" :lang="language" v-model="encoded" />
            </CodeButton>
        </div>

        <div class="collapse-content">
            <CodeButton class=" dropdown-right float-right">
                <CodeArea @save="onSave" @update:lang="(l: string) => language = l" :lang="language" v-model="encoded" />
            </CodeButton>

            <p>Duration: {{ duration / 1000 }}s</p>
            <p>Elapsed: {{ Math.round(elapsed / 100) / 10 }}s</p>

            <h4>Fight Sections:</h4>
            <div v-if="fight" class="fight__sections join join-vertical w-full">
                <ScheduledFightSection v-for="(section, i) in sections" :index="i" :fight="fight" :scheduled="section"
                    class="w-full join-item border border-base-300" />
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
    backdrop-filter: blur(5px) brightness(1.15);
}


// .fight__sections {
//     // display: flex;
//     // flex-direction: column;
//     // margin-top: 1rem;
//     // gap: 1rem;
// }
</style>

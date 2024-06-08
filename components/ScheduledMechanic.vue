<script setup lang="ts">
import * as YAML from 'yaml';
import { decodeScheduledMechanic } from '../utils/decode-fight';
import {
    type Scheduled,
    getScheduledDuration,
} from '../utils/scheduled';
import { Fight, } from '../utils/fights';
import { FightSection, } from '../utils/sections';
import { Mechanic } from '../utils/mechanics';

const props = defineProps<{
    fight: Fight,
    section: FightSection,
    scheduled: Scheduled<Mechanic>,
    index: number,
}>();

const emit = defineEmits<{
    (e: 'update', value: Scheduled<Mechanic>): void,
}>();

const mechanic = computed(() => props.scheduled.item);
const effects = computed(() => mechanic.value.effects || []);

const duration = computed(() => props.scheduled ? getScheduledDuration(props.scheduled, (i) => i.getDuration()) : 0 || 0);
const currentTime = useState<number>('worldTime', () => 0);
const elapsed = computed(() => Math.min(duration.value, currentTime.value));
const elapsedPercent = computed(() => (elapsed.value || 0) / (duration.value || 1) * 100);

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
            const updated = decodeScheduledMechanic(encoded.value, {
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

function updateEffect(effect: Scheduled<Effect>, i: number) {
    console.log('update effect: ', effect, i);
    const scheduled = props.scheduled;
    if (scheduled?.item?.effects) {
        scheduled.item.effects[i] = effect;
        emit('update', scheduled);
    }
}
</script>

<template>
    <div class="fight-mechanic collapse clip-collapse collapse-arrow join-item border border-base-300 w-full">
        <input type="checkbox" />
        <div class="collapse-title flex gap-2 items-center">
            <h3 class="min-w-fit">Mechanic {{ index + 1 }}.</h3>
            <progress class="progress flex-shrink" :value="elapsedPercent" max="100"></progress>
            <CodeButton @open="() => resetEncoded(true)" class=" dropdown-right float-right relative z-30">
                <CodeArea @save="onSave" @update:lang="(l: string) => language = l" :lang="language" v-model="encoded" />
            </CodeButton>
        </div>

        <div class="collapse-content">
            <div v-if="section && effects" class="mechanic__effects">
                <div v-for="(effect, i) in effects">
                    <ScheduledEffect @update="(effect) => updateEffect(effect, i)" :index="i" :fight="fight"
                        :section="section" :mechanic="mechanic" :scheduled="effect as any" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.mechanic__effects {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
}
</style>

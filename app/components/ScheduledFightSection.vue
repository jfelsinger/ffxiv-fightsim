<script setup lang="ts">
import * as YAML from 'yaml';

const props = defineProps<{
    fight: Fight,
    scheduled: Scheduled<FightSection>,
    index: number,
}>();

const emit = defineEmits<{
    (e: 'update', value: Scheduled<FightSection>): void,
}>();

const section = computed(() => props.scheduled.item);
const mechanics = computed(() => section.value.mechanics || []);

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
            const updated = decodeScheduledFightSection(encoded.value, {
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

function updateMechanic(effect: Scheduled<Mechanic>, i: number) {
    console.log('update mechanic: ', effect, i);
    const scheduled = props.scheduled;
    if (scheduled?.item?.mechanics) {
        scheduled.item.mechanics[i] = effect;
        emit('update', scheduled);
    }
}
</script>

<template>
    <div class="fight-section collapse clip-collapse collapse-arrow join-item border border-base-300 w-full">
        <input type="checkbox" />
        <div class="collapse-title flex gap-2 items-center">
            <!--
            <div class="radial-progress text-[#1f2937] xbg-slate-200 shadow-[0_0_0_6px_rgb(199,202,214)_inset] border-[rgb(199,202,214)] border-2"
                :style="{
                    '--value': elapsedPercent,
                    '--size': '1.5rem',
                    '--thickness': '4px',
                }" role="progressbar"></div>
            -->
            <h2 class="min-w-fit">
                Fight Section ({{ index + 1 }})
            </h2>
            <progress class="progress flex-shrink" :value="elapsedPercent" max="100"></progress>
            <CodeButton @open="() => resetEncoded(true)" class=" dropdown-right float-right relative z-30">
                <CodeArea @save="onSave" @update:lang="(l: string) => language = l" :lang="language"
                    v-model="encoded" />
            </CodeButton>
        </div>

        <div class="collapse-content">
            <div v-if="section && mechanics" class="section__mechanics">
                <div v-for="(mechanic, i) in mechanics">
                    <ScheduledMechanic @update="(m) => updateMechanic(m, i)" :index="i" :fight="fight"
                        :section="section" :scheduled="mechanic" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.fight-section {
    // contain: content; // This will keep stuff contained, like overflow hidden
    container-name: fight-section;
}

.progress {
    position: relative;
    width: cqh;
}

.section__mechanics {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
}
</style>

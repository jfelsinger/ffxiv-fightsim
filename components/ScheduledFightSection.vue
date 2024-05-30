<script setup lang="ts">
import {
    Fight,
    FightSection,
    Mechanic,
    Effect,
    type Scheduled,
} from '../utils/effects';

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

const duration = computed(() => section.value?.getDuration() || 0);
const currentTime = ref(props.fight?.clock?.time || 0);
const elapsed = computed(() => Math.min(duration.value, currentTime.value));
const elapsedPercent = computed(() => (elapsed.value || 0) / (duration.value || 1) * 100);

props.fight?.clock.on('tick', () => {
    currentTime.value = props.fight?.clock.time || 0;
});
</script>

<template>
    <div class="fight-section collapse clip-collapse collapse-arrow join-item border-border-base-300 w-full">
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
            <progress class="progress flex-shrink" :value="elapsedPercent" max="150"></progress>
        </div>

        <div class="collapse-content">
            <div v-if="section && mechanics" class="section__mechanics">
                <div v-for="(mechanic, i) in mechanics">
                    <ScheduledMechanic :index="i" :fight="fight" :section="section" :scheduled="mechanic" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.fight-section {
    contain: content;
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

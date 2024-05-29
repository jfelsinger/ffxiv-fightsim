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

const section = computed(() => props.scheduled.item);
const mechanics = computed(() => section.value.mechanics || []);

const duration = computed(() => section.value?.getDuration() || 0);
const currentTime = ref(props.fight?.clock?.time || 0);
const elapsed = computed(() => Math.min(duration.value, currentTime.value));
const elapsedPercent = computed(() => (elapsed.value || 0) / (duration.value || 1) * 100);
</script>

<template>
    <div class="fight-section collapse collapse-arrow join-item border-border-base-300 w-full">
        <input type="checkbox" />
        <progress class="progress" :value="10" max="100"></progress>
        <div class="collapse-title">
            <div class="radial-progress" :style="{
                '--value': elapsedPercent,
                '--size': '1rem',
                '--thickness': '0.25rem',
            }" role="progressbar"></div>
            <h2>
                Fight Section ({{ index + 1 }})
            </h2>
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

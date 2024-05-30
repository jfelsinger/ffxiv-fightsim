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
    section: FightSection,
    scheduled: Scheduled<Mechanic>,
    index: number,
}>();

const emit = defineEmits<{
    (e: 'update', value: Scheduled<Mechanic>): void,
}>();

const mechanic = computed(() => props.scheduled.item);
const effects = computed(() => mechanic.value.effects || []);
</script>

<template>
    <div class="fight-mechanic">
        <p>Mechanic {{ index + 1 }}.</p>
        <div v-if="section && mechanic" class="mechanic__effects">
            <div v-for="(effect, i) in effects">
                <ScheduledEffect :index="i" :fight="fight" :section="section" :mechanic="mechanic" :scheduled="effect" />
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

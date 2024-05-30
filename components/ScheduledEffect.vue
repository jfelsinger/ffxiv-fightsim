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
    mechanic: Mechanic,
    scheduled: Scheduled<Effect>,
    index: number,
}>();

const emit = defineEmits<{
    (e: 'update', value: Scheduled<Effect>): void,
}>();

const effect = computed(() => props.scheduled.item);
</script>

<template>
    <div class="fight-effect">
        <p>effect {{ index + 1 }}.</p>
    </div>
</template>

<style lang="scss"></style>

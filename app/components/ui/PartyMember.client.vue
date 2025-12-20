<script setup lang="ts">
const props = defineProps<{
    name: string,
    hpPercent: number,
    shieldPercent: number,
    spPercent: number,
    castPercent: number,

    enmityPercent?: number,
    hasEnmity?: boolean,

    orderNumber?: number,
}>();

const name = computed(() => props.name || 'Player');
const hpPercent = computed(() => Math.max(0, Math.min(100, props.hpPercent || 0)));
const spPercent = computed(() => Math.max(0, Math.min(100, props.spPercent || 0)));
const castPercent = computed(() => Math.max(0, Math.min(100, props.castPercent || 0)));
const shieldPercent = computed(() => Math.max(0, Math.min(100, props.shieldPercent || 0)));

</script>

<template>
    <div class="party-member-container">
        <div v-if="orderNumber" class="member__order">{{ orderNumber }}</div>
        <div class="member__name">{{ name }}</div>

        <div>
            <div class="member__hpbar" :class="{ '--has-shield': shieldPercent }"
                :style="{ '--percent': `${hpPercent}`, '--shieldPercent': `${shieldPercent}`, }">
            </div>

            <div class="member__spbar" :style="{ '--percent': `${spPercent}`, }">
            </div>

            <div class="member__castbar" :style="{ '--percent': `${castPercent}`, }">
            </div>
        </div>
    </div>
</template>

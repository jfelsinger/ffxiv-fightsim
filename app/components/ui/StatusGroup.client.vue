<script setup lang="ts">
type Status = {
    id?: string
    name: string
    src?: string
    seconds?: string | number
}
const props = defineProps<{
    name: string,
    statuses?: Status[],
    large?: boolean,
}|{
    name?: string,
    statuses: Status[],
    large?: boolean,
}>();

const name = computed(() => `status-group-${props.name || 'default'}`);
const statuses = props.statuses || (useStatuses(props.name).statuses);
</script>

<template>
    <AdjustableUi v-if="statuses" :name="name" :x="323" :y="493">
        <div class="status-group-container flex gap-1 p-2">
            <UiStatus v-for="status in statuses" :key="status.id || status.name" :status="status" />
        </div>
    </AdjustableUi>
</template>

<style lang="scss">
</style>

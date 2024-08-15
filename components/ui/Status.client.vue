<script setup lang="ts">

type Status = {
    id?: string
    name: string
    src?: string
    seconds?: string|number
}

const props = defineProps<{
    status: Status
    name?: string

    src?: string
    seconds?: string|number
    large?: boolean
}|{
    name: string
    status?: Status

    src?: string
    seconds?: string|number
    large?: boolean
}>();

const name = computed(() => props.name || props.status.name);
const seconds = computed(() => props.seconds || props.status?.seconds);
const src = computed(() => props.src || props.status?.src);

const source = computed(() => src.value || `/images/status/${name.value}.png`);

</script>

<template>
    <div class="status-container flex flex-col justify-center items-center"
        :class="{ '--large': large }">
        <NuxtImg :src="source" class="status__image" :width="large ? 48 : 24" />
        <div v-if="seconds" class="status__time  font-light text-white relative"
            :class="{
                'bottom-5': large,
                'text-2xl': large,
                'text-sm':  !large,
                'bottom-2': !large,
            }">
            {{ seconds }}
        </div>
    </div>
</template>

<style lang="scss">

.status-container {
}

.status__image {
    filter: drop-shadow(-1px 1px 3px #00000022) drop-shadow(0 0 2px #00000033);
    .--large & {
        filter: drop-shadow(-1px 1px 3px #00000022) drop-shadow(0 0 2px #00000033);
    }
}

.status__time {
    filter: drop-shadow(-1px 1px 1px #00000055) drop-shadow(0 0 1px #00000066) drop-shadow(0 0 2px #00000099);
    .--large & {
        filter: drop-shadow(-1px 1px 1px #00000055) drop-shadow(0 0 1px #000) drop-shadow(0 0 2px #000);
    }
}

</style>

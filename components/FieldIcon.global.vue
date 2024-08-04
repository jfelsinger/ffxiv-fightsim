<script setup lang="ts">
const props = defineProps<{
    name: string,
    size?: any,
}>();
</script>
<template>
    <NuxtImg class="field-icon" :src="`/images/field-icons/${name}.png`" :width="size" :height="size" />
</template>

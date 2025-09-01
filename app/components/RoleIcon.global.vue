<script setup lang="ts">
const props = defineProps<{
    name: string,
    size?: any,
}>();
</script>
<template>
    <NuxtImg class="role-icon" :src="`/images/roles/${name}.png`" :width="size" :height="size" />
</template>

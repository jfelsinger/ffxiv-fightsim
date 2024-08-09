<script setup lang="ts">
const props = defineProps<{
    info?: any,
}>();
</script>

<template>
    <div class="prose text-sm m-1">
        <h2 class="font-normal text-sm text-slate-600 opacity-90 pr-4 mb-1">{{ info.raid }}</h2>
        <h1 class="font-normal text-2xl pr-4 mb-1">
            <span v-if="info.category">{{ info.category }},</span>
            {{ info.title }}
        </h1>
        <div class="max-h-[80vh] overflow-y-auto pr-3">
            <ContentRenderer :value="info" />
        </div>
    </div>
</template>

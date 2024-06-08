<script setup lang="ts">
const route = useRoute();
console.log('Route, [raid]/[section]: ', route.fullPath, route.params.raid, route.params.section);
const { data: fightData } = await useFightContent();
</script>
<template>
    <div class="overflow-hidden max-h-screen max-w-screen h-screen relative">
        <Babylon :fight-data="fightData" :show-ui="true" />
    </div>
</template>

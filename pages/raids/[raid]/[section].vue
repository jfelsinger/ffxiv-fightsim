<script setup lang="ts">
const route = useRoute();
console.log('Route, [raid]/[section]: ', route.fullPath, route.params.raid, route.params.section);
const { data } = await useFightContent();
const fightData = data.value?.fight;
console.log('info: ', fightData, data.value?.info);
</script>
<template>
    <div class="overflow-hidden max-h-screen max-w-screen h-screen relative">
        <Babylon :fight-data="fightData" :info-data="data?.info" :show-ui="true" />

        <div class="drawer drawer-end info-drawer z-[999] absolute top-0 right-0" v-if="data?.info">
            <input id="info-drawer" type="checkbox" class="drawer-toggle" />
            <div class="drawer-content">
                <label for="info-drawer"
                    class="drawer-button font-bold text-lg btn btn-ghost btn-sm absolute top-1 right-4">
                    <Icon name="solar:info-circle-broken" />
                </label>
            </div>
            <div class="drawer-side">

                <label for="info-drawer" class="drawer-overlay"></label>
                <div class="bg-base-100 shadow-xl bg-blur rounded-box p-4 py-2">
                    <div class="prose text-sm m-1">
                        <h2 class="font-normal text-sm">{{ data.info.raid }}</h2>
                        <h1 class="font-normal text-2xl">
                            <span v-if="data.info.category">{{ data.info.category }},</span>
                            {{ data.info.title }}
                        </h1>
                        <ContentRenderer :value="data.info" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

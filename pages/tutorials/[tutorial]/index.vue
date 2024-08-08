<script setup lang="ts">
const route = useRoute();
const { isTutorial } = useTutorialMode();
isTutorial.value = true;

const { data } = await useFightContent();
const fightData = data.value?.fight;
// console.log('info: ', fightData, data.value?.info);

const showInfo = ref(false);
if (route.query.info) {
    showInfo.value = true;
}
</script>
<template>
    <div class="overflow-hidden max-h-screen max-w-screen h-screen relative">
        <Babylon :fight-data="fightData" :info-data="data?.info" :show-ui="true" />

        <div class="drawer drawer-end info-drawer z-[999] absolute top-0 right-0" v-if="data?.info">
            <input id="info-drawer" type="checkbox" class="drawer-toggle" :checked="showInfo" />
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

        <div class="youtube">
            <!--
            <iframe width="560" height="315"
                src="https://www.youtube.com/embed/OqtPbLygc-A?si=_Oh97nZuSLW9v8Pw&amp;controls=0"
                title="YouTube video player" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            -->
        </div>
    </div>
</template>

<style lang="scss">
.youtube {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;

    iframe {}

    &,
    iframe {
        width: 100%;
        height: 100%;
        opacity: .85;
        filter: hue-rotate(0.4);
        pointer-events: none;

    }
}
</style>

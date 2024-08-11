<script setup lang="ts">
import type { QueryBuilderParams } from '@nuxt/content/types';
import { Fight } from '../utils/fights';

const route = useRoute();
const tutorial = route.params.tutorial;

const props = defineProps<{
    fight: Fight,
}>();

const {
    isTutorial: isTutorialModeOn,
    isTutorialVisible,
    tutorialStep,
    canContinueTutorial,
} = useTutorialMode();
tutorialStep.value = 1;

const query: QueryBuilderParams = {
    path: `/tutorials/${tutorial}-steps`,
    sort: [{ step: 1 }],
};

function hide() {
    isTutorialVisible.value = false;
    nextTick(() => {
        tutorialStep.value++;
    });
}

function next() {
    props.fight?.clock?.start();
    isTutorialVisible.value = false;
    nextTick(() => {
        tutorialStep.value++;
    });
}
</script>

<template>
    <div v-show="isTutorialModeOn && isTutorialVisible && tutorialStep" class="tutorial-window__container">
        <ContentList :query="query" v-slot="{ list }">

            <div v-for="step in list" class="card bg-base-100/45 glass" :key="step._path">
                <div v-if="isTutorialModeOn && isTutorialVisible && tutorialStep === step.step" class="card-body">
                    <h2 class="card-title">
                        {{ step.title }}
                    </h2>

                    <div class="prose text-sm">
                        <ContentRenderer :value="step">
                            <ContentRendererMarkdown :value="step" />
                        </ContentRenderer>
                    </div>

                    <div v-if="!canContinueTutorial">
                        <hr />
                        <div class="my-4 mb-2 text-center">
                            Waiting to get into position&hellip;
                        </div>
                    </div>

                    <div class="card-actions justify-end items-end">
                        <button @click.stop.prevent="hide" class="btn btn-ghost min-w-20">
                            Hide
                        </button>
                        <button :disabled="!canContinueTutorial" @click.stop.prevent="next" class="btn min-w-20">
                            <Icon class="swap-on" name="solar:play-circle-linear" />
                            Continue
                        </button>
                    </div>
                </div>
            </div>

        </ContentList>
    </div>
</template>

<style lang="scss">
.tutorial-window__container {
    position: fixed;
    top: 1rem;
    left: 1rem;

    z-index: 999;
}
</style>

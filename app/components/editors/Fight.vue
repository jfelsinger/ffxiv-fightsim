<script setup lang="ts">
import { vDraggable, VueDraggable } from 'vue-draggable-plus';
const model = defineModel<FightOptions>();

const workingCopy = ref<FightOptions>(JSON.parse(JSON.stringify(model.value)));
</script>

<template>
    <div class="w-full bg-base-100 rounded-md flex flex-col gap-2">
        <div class="p-2 bg-gray-50 rounded-md">
            <p>{{ workingCopy.name }}</p>

            <VueDraggable class="w-full flex flex-col gap-1"
                          v-model="workingCopy.sections"
                          handle=".section-handle"
                          group="sections"
            >
                <div class="rounded-sm p-1 bg-gray-100 flex flex-col gap-1" v-for="section in workingCopy.sections"
                    :key="section.item.name">
                    <EditorsSectionBase :data="section" />
                </div>
            </VueDraggable>
        </div>

        <div class="text-xs m-2">
            <pre><code>{{ JSON.stringify(model, null, 2) }}</code></pre>
        </div>
    </div>
</template>

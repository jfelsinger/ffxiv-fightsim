<script setup lang="ts">
import { vDraggable, VueDraggable } from 'vue-draggable-plus';
const model = defineModel<FightOptions>();

const workingCopy = ref<FightOptions>(JSON.parse(JSON.stringify(model.value)));
</script>

<template>
    <div class="w-full bg-base-100 rounded-md flex flex-col gap-2">
        <div class="p-2 bg-gray-50 rounded-md">
            <p>{{ workingCopy.name }}</p>

            <VueDraggable class="cursor-move w-full flex flex-col gap-1" v-model="workingCopy.sections"
                group="sections">
                <div class="rounded-sm p-1 bg-gray-100 flex flex-col gap-1" v-for="section in workingCopy.sections"
                    :key="section.item.name">
                    <div>{{ section.item.name }}</div>

                    <VueDraggable class="cursor-move w-full flex flex-col gap-1" v-model="section.item.mechanics"
                        group="mechanics">
                        <div class="rounded-sm p-1 bg-gray-200 flex flex-col gap-1"
                            v-for="mechanic in section.item.mechanics" :key="mechanic.item.name">
                            <div>{{ mechanic.item.name }}</div>

                            <VueDraggable class="cursor-move w-full flex flex-col gap-1" v-model="mechanic.item.effects"
                                group="effects">
                                <div class="rounded-sm p-1 bg-gray-100 flex flex-col gap-1"
                                    v-for="effect in mechanic.item.effects" :key="effect.item.name">
                                    <div>{{ effect.item.name }}</div>
                                </div>
                            </VueDraggable>

                        </div>
                    </VueDraggable>
                </div>
            </VueDraggable>
        </div>

        <div class="text-xs m-2">
            <pre><code>{{ JSON.stringify(model, null, 2) }}</code></pre>
        </div>
    </div>
</template>

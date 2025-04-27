<script setup lang="ts">
import { vDraggable, VueDraggable } from 'vue-draggable-plus';

const props = defineProps<{
    data: any,
}>();

const section = ref<any>(JSON.parse(JSON.stringify(props.data)));
</script>

<template>
    <div class="flex flex-col gap-1">
        <div class="flex items-center">
            <Icon class="section-handle cursor-move" name="radix-icons:drag-handle-dots-2" size="16px" />
            <div>{{ section.item.name }}</div>
        </div>

        <VueDraggable class="w-full flex flex-col gap-1"
                      v-model="section.item.mechanics"
                      handle=".mechanic-handle"
                      group="mechanics"
        >
            <div
                class="rounded-sm p-1 bg-gray-200 flex flex-col gap-1"
                v-for="mechanic in section.item.mechanics"
                :key="mechanic.item.name"
            >
                <EditorsMechanicBase :data="mechanic" />
            </div>
        </VueDraggable>
    </div>
</template>

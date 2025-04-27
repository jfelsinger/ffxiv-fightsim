<script setup lang="ts">
import { vDraggable, VueDraggable } from 'vue-draggable-plus';

const props = defineProps<{
    data: any,
}>();

const mechanic = ref<any>(JSON.parse(JSON.stringify(props.data)));
</script>

<template>
    <div class="flex flex-col gap-1">
        <div class="flex items-center">
            <Icon class="mechanic-handle cursor-move" name="radix-icons:drag-handle-dots-2" size="16px" />
            <div>{{ mechanic.item.name }}</div>
        </div>

        <VueDraggable
            class="w-full flex flex-col gap-1"
            v-model="mechanic.item.effects"
            handle=".effect-handle"
            group="effects"
        >
            <div class="rounded-sm p-1 bg-gray-100 flex flex-col gap-1"
                 v-for="effect in mechanic.item.effects" :key="effect.item.name">
                <EditorsEffectBase :data="effect" />
            </div>
        </VueDraggable>
    </div>
</template>

<script setup lang="ts">
import { vDraggable, VueDraggable } from 'vue-draggable-plus';

const props = defineProps<{
    data: any,
}>();

const effect = ref<any>(JSON.parse(JSON.stringify(props.data)));
</script>

<template>
    <div class="flex flex-col gap-1">
        <div class="flex items-center">
            <Icon class="effect-handle cursor-move" name="radix-icons:drag-handle-dots-2" size="16px" />
            <div>{{ effect.item.name }}</div>
        </div>
    </div>
</template>

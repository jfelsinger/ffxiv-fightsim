<script setup lang="ts">
import { UseDraggable as Draggable } from '@vueuse/components';
import { useStorage } from '@vueuse/core';

const props = defineProps<{
    name: string,
    storageKey?: string,
    x?: number,
    y?: number,
}>();

const storageKey = computed(() => props.storageKey || props.name);

const { isEditing } = useEditMode();
const isHidden = useStorage(`${storageKey.value}-hidden`, false);
const scale = useStorage(`${storageKey.value}-scale`, 100);
const position = useStorage(`${storageKey.value}-position`, { x: props.x ?? 10, y: props.y ?? 10 });

const el = ref<HTMLElement | null>(null);
const { x, y, style } = useDraggable(el, {
    initialValue: { x: position.value.x, y: position.value.y },
    onEnd: (endPosition) => {
        position.value = endPosition;
        console.log('end: ', endPosition);
    },
});

function zoomOut() {
    scale.value = Math.max(10, scale.value - 15);
}

function zoomIn() {
    scale.value = Math.min(500, scale.value + 15);
}

function resetSize() {
    scale.value = 100;
}

function toggleHidden() {
    isHidden.value = !isHidden.value;
}
</script>

<template>
    <div ref="el" :style="style" style="position: fixed" class="adjustable-ui-item fixed select-none cursor-move z-[45]"
        :class="{ '--hidden': isHidden, '--edit-mode': isEditing, }">
        <div class="relative p-4">
            <div class="adjustable-ui-item__content p-4 relative" :style="{ transform: `scale(${scale / 100})`, }">
                <slot>
                    Hello.
                </slot>
            </div>
            <div class="adjustable-ui-item__menu flex absolute">
                <ul class="menu bg-slate-100/65 menu-horizontal rounded-box">
                    <li>
                        <button @click="zoomIn" class="tooltip tooltip-right px-1" data-tip="Bigger">
                            <Icon name="solar:add-square-linear" />
                        </button>
                    </li>
                    <li>
                        <button @click="zoomOut" class="tooltip tooltip-right px-1" data-tip="Smaller">
                            <Icon name="solar:minus-square-linear" />
                        </button>
                    </li>
                    <li>
                        <button @click="resetSize" class="tooltip tooltip-right px-1" data-tip="Reset Size">
                            <Icon name="solar:restart-circle-line-duotone" />
                        </button>
                    </li>
                    <li>
                        <button @click="toggleHidden" class="tooltip tooltip-right px-1" data-tip="Toggle Hidden">
                            <Icon name="solar:eye-closed-bold-duotone" />
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.adjustable-ui-item {
    pointer-events: none;

    &.--hidden {
        opacity: 0;

        &.--edit-mode {
            .adjustable-ui-item__content {
                opacity: 0.5;
            }
        }
    }

    &.--edit-mode {
        pointer-events: initial;
        opacity: 1;
    }
}

.adjustable-ui-item__content {
    transition: opacity 180ms ease;
}

.adjustable-ui-item__menu {

    left: 80%;
    left: calc(100% - 2rem);
    top: -1rem;

    opacity: 0;
    transition: opacity 180ms ease;

    .adjustable-ui-item:hover &,
    .adjustable-ui-item:active &,
    .adjustable-ui-item:focus &,
    .adjustable-ui-item:focus-within &,
    .adjustable-ui-item:has(:hover, :active, :focus) &,
    {
    opacity: 1;
}

}
</style>

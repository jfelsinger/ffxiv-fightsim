<script setup lang="ts">

const dropdown = ref<HTMLElement | undefined>();
const button = ref<HTMLElement | undefined>();
const isOpen = ref(false);

const emit = defineEmits<{
    (e: 'open'): void,
}>();

function close() {
    dropdown.value?.blur();
    button.value?.blur();
    isOpen.value = false;
}

function handleHover() {
    if (dropdown.value?.matches(':focus-within, :focus')) {
        isOpen.value = true;
    } else {
        isOpen.value = false;
    }
}

function handleClick() {
    if (isOpen.value) {
        close();
    } else {
        isOpen.value = true;
        emit('open');
    }
}

function handleBlur() {
    if (!dropdown.value?.matches(':focus-within, :focus')) {
        isOpen.value = false;
    }
}
</script>

<template>
    <div ref="dropdown" class="dropdown" @blur="handleBlur">
        <div @mouseenter="handleHover" @click="handleClick" @blur="handleBlur" ref="button" tabindex="0" role="button"
            class="btn btn-xs m-1">
            <Icon name="solar:code-bold" />
        </div>

        <div tabindex="0" class="dropdown-content w-[30rem] z-40 p-2">
            <slot />
        </div>
    </div>
</template>

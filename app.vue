<script setup lang="ts">
import '~/assets/styles/app.css';
</script>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<style lang="scss">
@import '~/assets/styles/main.scss';

html,
body {
    background: #3c4450;
    min-height: 100vh;
}

.tabsMenu {

    input,
    select,
    textarea {
        color: #333;
    }
}
</style>

<script setup lang="ts">

const props = defineProps<{
    percent?: number,
    name?: string,
}>();

const castState = useCastState();
const percent = computed(() => Math.max(0, Math.min(100, props.percent ?? ((castState.value?.percent ?? 0) * 100))));
const name = computed(() => props.name || castState.value?.name || 'Cast');

</script>

<template>
    <AdjustableUi name="castbar" :x="672" :y="623">
        <div class="cast-container flex w-72 relative" :style="{ '--percent': `${percent}%`, }">
            <div class="cast__bar w-full h-3">
            </div>
            <h2 class="cast__name w-full font-normal text-xl absolute text-right top-0">
                <slot>
                    {{ name }}
                </slot>
            </h2>
        </div>
    </AdjustableUi>
</template>

<style lang="scss">
$c-bg: #34220b;
$c-text: #f8fef8;
$c-hl: #dea851;

.cast-container {
    --percent: 0;
    color: $c-text;
}

$h: 0.55rem;

.cast__bar {
    background: $c-bg;
    filter: drop-shadow(0 0 3px #dea851aa) drop-shadow(0 0 3px #f8fef830);
    border: 1px solid $c-hl;
    border-radius: 2px;
    position: relative;

    box-sizing: content-box;
    height: $h;
    box-shadow: 0 0 2px $c-hl inset;

    &::after {
        content: "";
        display: block;
        height: $h;
        background: $c-text;
        opacity: 0.95;
        box-shadow:
            0 2px 4px -2px #dea851cc inset,
            0 -2px 4px -2px #dea851cc inset;

        position: absolute;
        top: 0;
        left: 0;
        filter: drop-shadow(0 0 3px #dea851aa) drop-shadow(0 0 3px #f8fef830);
        width: var(--percent);
    }
}

.cast__name {
    color: $c-text;
    filter: drop-shadow(0 1px 3px #dea851aa) drop-shadow(0 0 3px #f8fef830) drop-shadow(0 0 2px #0008);
    font-size: 20px;
    top: 0;
    top: -0.285rem;
}
</style>

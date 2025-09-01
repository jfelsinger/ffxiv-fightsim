<script setup lang="ts">
const cameraDirection = useState<number>('cameraDirection', () => 0);
const characterDirection = useState<number>('characterDirection', () => 0);
</script>

<template>
    <div class="minimap relative-north absolute top-10 right-10 z-10 bg-slate-100/45 bg-blur p-[2px] rounded-full" :style="{
        '--cam-rotation': `${cameraDirection}deg`,
        '--char-rotation': `${characterDirection}deg`,
    }">
        <div class="minimap__floor w-24 h-24 bg-slate-100/75 overflow-hidden rounded-full relative">
        </div>
    </div>
</template>

<style lang="scss">
:root {
    --char-rotation: 0deg;
    --cam-rotation: 0deg;
}

.minimap {
    z-index: 11;

    &::before {
        content: "N";
        display: block;
        position: absolute;
        left: 50%;
        top: -22%;
        z-index: 10;
        transform: translateX(-50%);
        text-shadow:
            0 0 1px #ffffffea,
            0 0 4px #ffffffaa,
            0 0 2px #ffffff5a;
    }

    &.relative-north {
        transform: rotate(calc(var(--cam-rotation) * -1));

        &::before {
            transform: translateX(-50%) rotate(calc(var(--cam-rotation) * 1));
        }
    }
}

.minimap__floor {
    background-size: 15px 15px;
    background-image:
        linear-gradient(to right, rgba(0, 0, 0, 0.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.12) 1px, transparent 1px);

    // transform: rotate(var(--cam-rotation));

    &::before {
        content: "";
        display: block;
        width: 0;
        height: 0;
        border: 5.5em solid transparent;
        border-top-width: 6em;
        border-bottom-width: 6em;
        border-top-color: rgb(159 189 235 / 65%);

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transform: translate(-50%, -50%) rotate(var(--cam-rotation));
        filter: blur(5px);
        filter: drop-shadow(0 0 5px #ffffff6a) blur(5px);

        .relative-north & {
            transform: translate(-50%, -50%);
            transform: translate(-50%, -50%) rotate(calc(var(--cam-rotation) * 1));
        }
    }

    &::after {
        content: "";
        display: block;
        width: 0;
        height: 0;
        border: 0.35em solid transparent;
        border-top-width: 0;
        border-bottom-width: 1em;
        border-bottom-color: rgba(23, 37, 84, 1);

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -65%);
        transform: translate(-50%, -65%) rotate(var(--char-rotation));
    }
}
</style>

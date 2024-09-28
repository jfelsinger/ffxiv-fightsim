<script setup lang="ts">
import { lerp, rangex1 } from '../utils/interpolation';
const {
    leftStickInvertX,
    leftStickInvertY,

    rightStickInvertX,
    rightStickInvertY,

    rightStickSensitivityX,
    rightStickSensitivityY,
} = useController();

const minSensitivity = 0.2;
const maxSensitivity = 3.0;
const rangeToSens = (v) => rangex1(0, 100, minSensitivity, maxSensitivity, v);
const sensToRange = (v) => rangex1(minSensitivity, maxSensitivity, 0, 100, v);

const sensitivityRangeX = computed({
    get() { return sensToRange(rightStickSensitivityX.value); },
    set(val) { rightStickSensitivityX.value = rangeToSens(val); },
});
watch(sensitivityRangeX, (value) => {
    const sens = rangeToSens(value);
    const range = sensToRange(sens);
    console.log('sens x: ', value, sens, range);
});


const sensitivityRangeY = computed({
    get() { return sensToRange(rightStickSensitivityY.value); },
    set(val) { rightStickSensitivityY.value = rangeToSens(val); },
});
watch(sensitivityRangeY, (value) => {
    const sens = rangeToSens(value);
    const range = sensToRange(sens);
    console.log('sens y: ', value, sens, range);
});

const {
    isEditing,
} = useEditMode();

function resetSensitivityX() {
    rightStickSensitivityX.value = 1.15;
}

function resetSensitivityY() {
    rightStickSensitivityY.value = 1.0;
}

let xClickCounter = 0;
function resetSensitivityXClick() {
    xClickCounter++;
    if (xClickCounter < 2) {
        setTimeout(() => {
            xClickCounter = 0;
        }, 400);
    } else {
        resetSensitivityX();
        xClickCounter = 0;
    }
}

let yClickCounter = 0;
function resetSensitivityYClick() {
    yClickCounter++;
    if (yClickCounter < 2) {
        setTimeout(() => {
            yClickCounter = 0;
        }, 400);
    } else {
        resetSensitivityY();
        yClickCounter = 0;
    }
}

function resetSensitivity() {
    resetSensitivityX();
    resetSensitivityY();
}
</script>

<template>
    <div v-if="isEditing" class="flex flex-col absolute right-2 top-10 z-50">
        <div class="flex flex-col p-2 px-4 bg-slate-100/45 rounded-box bg-blur min-w-52 shadow-xl">
            <h3>Extra Settings</h3>


            <h3 class="font-semibold">Controller Settings</h3>

            <h3>Left Stick</h3>
            <div class="form-control">
                <label class="label cursor-pointer">
                    <span class="label-text">Invert X Axis</span>
                    <input type="checkbox" class="toggle" v-model="leftStickInvertX" />
                </label>
            </div>
            <div class="form-control">
                <label class="label cursor-pointer">
                    <span class="label-text">Invert Y Axis</span>
                    <input type="checkbox" class="toggle" v-model="leftStickInvertY" />
                </label>
            </div>

            <hr class="my-1 opacity-50">
            <h3>Right Stick</h3>
            <div class="form-control">
                <label class="label cursor-pointer">
                    <span class="label-text">Invert X Axis</span>
                    <input type="checkbox" class="toggle" v-model="rightStickInvertX" />
                </label>
            </div>
            <div class="form-control">
                <label class="label cursor-pointer">
                    <span class="label-text">Invert Y Axis</span>
                    <input type="checkbox" class="toggle" v-model="rightStickInvertY" />
                </label>
            </div>
            <div class="form-control">
                <label class="label cursor-pointer flex flex-col">
                    <span class="label-text" @click="resetSensitivityXClick">X Sensitivity</span>
                    <input type="range" class="range" min="0" max="100" v-model="sensitivityRangeX" />
                </label>
            </div>
            <div class="form-control">
                <label class="label cursor-pointer flex flex-col">
                    <span class="label-text" @click="resetSensitivityYClick">Y Sensitivity</span>
                    <input type="range" class="range" min="0" max="100" v-model="sensitivityRangeY" />
                </label>
            </div>
        </div>
    </div>
</template>

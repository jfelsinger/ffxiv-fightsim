<script setup lang="ts">
const { role: playerRole, roleType } = useRole();


const emit = defineEmits<{
    (e: 'select', value: string): void,
}>();

function selectRole(role: string) {
    playerRole.value = role;
    emit('select', role);
}
</script>

<template>
    <div class="z-[50] fixed top-1 right-8">
        <div class="role-picker-container font-normal dropdown dropdown-hover dropdown-end" :class="[`--${playerRole}`]">
            <div tabindex="0" role="button" class="btn btn-sm btn-ghost mb-1 uppercase" :class="[roleType]">
                {{ playerRole }}
            </div>
            <div tabindex="0" class="dropdown-content bg-base-100 rounded-box z-[1] p-1 shadow flex gap-1 uppercase">
                <ul class="menu text-center">
                    <li><a href="#" class="tank" @click="selectRole('mt')">mt</a></li>
                    <li><a href="#" class="healer" @click="selectRole('h1')">h1</a></li>
                    <li><a href="#" class="dps" @click="selectRole('m1')">m1</a></li>
                    <li><a href="#" class="dps" @click="selectRole('r1')">r1</a></li>
                </ul>

                <ul class="menu">
                    <li><a href="#" class="tank" @click="selectRole('ot')">ot</a></li>
                    <li><a href="#" class="healer" @click="selectRole('h2')">h2</a></li>
                    <li><a href="#" class="dps" @click="selectRole('m2')">m2</a></li>
                    <li><a href="#" class="dps" @click="selectRole('r2')">r2</a></li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
$c-tank: #465ece;
$c-healer: #477938;
$c-dps: #7b3839;

.role-picker-container {
    .btn {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    .btn.tank {
        // color: $c-tank;
        opacity: 0.85;
    }
}
</style>

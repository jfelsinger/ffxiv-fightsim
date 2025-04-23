<script setup lang="ts">
const {
    open,
    status,
    shortId,
    joinRoom,
    abort,
} = useClientPeerConnection('ws://localhost:3000/_ws');

onBeforeUnmount(() => {
    abort();
});
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1>WebRTC Testing</h1>
        <div>
            {{ status }} : {{ shortId }}
            <button v-if="status === 'CLOSED'" class="btn" @click="open">Reconnect</button>
        </div>

        <div v-if="status === 'OPEN'" class="flex flex-col gap-2">
            <div class="flex items-center justify-center">
                <input class="input input-sm" v-model="shortId" />
                <button class="btn btn-sm" @click="joinRoom">Join</button>
            </div>
        </div>
    </div>
</template>

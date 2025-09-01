<script setup lang="ts">
const {
    open,
    status,
    shortId,
    hostRoom,
    abort,
} = useHostPeerConnections('ws://localhost:3000/_ws');

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
            <button class="btn btn-sm" @click="hostRoom">Start Host</button>
        </div>
    </div>
</template>

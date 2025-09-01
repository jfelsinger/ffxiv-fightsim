<script setup lang="ts">

if (import.meta.client) {
    // const pc = new RTCPeerConnection();
    // const dc = pc.createDataChannel('my channel');

    // dc.addEventListener('message', (event) => {
    //     console.log(`received: ${event.data}`, event);
    // })

    // dc.addEventListener('open', (event) => {
    //     console.log(`datachannel open`, event);
    // })

    // dc.addEventListener('close', (event) => {
    //     console.log(`datachannel close`, event);
    // })
}
</script>

<template>
    <div class="flex flex-col items-center justify-center">

        <div class="bg-gray-100 p-12 m-12 rounded-xl">
            <RtcClient />
        </div>

    </div>
</template>

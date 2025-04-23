import { useWebSocket } from '@vueuse/core';
const configuration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },

        // { urls: "stun:stun1.l.google.com:3478" },
        // { urls: "stun:stun2.l.google.com:3478" },
        // { urls: "stun:stun3.l.google.com:3478" },

        // { urls: "stun:stun.l.google.com:5349" },
        // { urls: "stun:stun1.l.google.com:5349" },
        // { urls: "stun:stun2.l.google.com:5349" },
        // { urls: "stun:stun3.l.google.com:5349" },
        // { urls: "stun:stun4.l.google.com:5349" }
    ],
};

type PeerInfo = {
    connection: RTCPeerConnection;
    dataChannel?: RTCDataChannel;
    peerId?: string;
}

export function useClientPeerConnection(websocket: string | ReturnType<typeof useWebSocket>) {
    const ws = (typeof websocket === 'string') ? useWebSocket(websocket) : websocket;
    const { status, data, send, open, close } = ws;
    const shortId = ref((window as any).__shortId || '');

    let controller = new AbortController();
    let host = ref<PeerInfo>();

    watch(shortId, (val) => {
        if (val) (window as any).__shortId = val;
    });

    watch(data, (newValue) => {
        const newData = JSON.parse(newValue);
        console.log('newData: ', newData);

        if (newData.type === 'answer') {
            handleAnswer(newData);
        } else if (newData.type === 'candidate') {
            handleCandidate(newData);
        }
    });

    async function handleAnswer(data: any) {
        const { answer } = data;
        const peerInfo = host.value;
        if (answer && peerInfo) {
            await peerInfo.connection.setRemoteDescription(answer);
            console.log('handleAnswer()');
        }
    }

    async function handleCandidate(data: any) {
        const { candidate } = data;
        const peerInfo = host.value;
        if (candidate && peerInfo) {
            await peerInfo.connection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('handleCandidate()');
        }
    }

    async function joinRoom() {
        const connection = new RTCPeerConnection(configuration);
        const dataChannel = connection.createDataChannel('data');
        host.value = {
            connection,
            dataChannel,
        };

        dataChannel.addEventListener('open', (event) => {
            console.log('channel is open: ', event);
        }, { signal: controller.signal })

        dataChannel.addEventListener('message', (event) => {
            console.log('channel got message: ', event);
        }, { signal: controller.signal })

        // TO SEND DATA:
        // dataChannel.send(JSON.stringify({ message: 'blah' }));

        connection.addEventListener('icecandidate', (event) => {
            console.log('icecandidate:', event);

            const { candidate } = event;
            if (candidate) {
                send(JSON.stringify({
                    type: 'candidate',
                    shortId: shortId.value,
                    candidate,
                }));
            }
        }, { signal: controller.signal });

        connection.addEventListener('datachannel', (event) => {
            console.log('datachannel:', event);

            const { channel: receiveChannel } = event;
            host.value!.dataChannel = receiveChannel;

            receiveChannel.addEventListener('open', () => {
                console.log('channel is open: ', receiveChannel);
            }, { signal: controller.signal })

            receiveChannel.addEventListener('message', (event) => {
                console.log('channel got message: ', event);
            }, { signal: controller.signal })

        }, { signal: controller.signal });

        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        send(JSON.stringify({
            type: 'offer',
            shortId: shortId.value,
            offer: connection.localDescription,
        }));
    }

    return {
        host,
        shortId,
        joinRoom,

        status, data, send, open, close,

        get signal() { return controller.signal; },
        abort() { controller.abort(); },
    };
}

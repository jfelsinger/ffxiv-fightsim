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
    peerId: string;
    dataChannel?: RTCDataChannel;
}


export function useHostPeerConnections(websocket: string | ReturnType<typeof useWebSocket>) {
    const ws = (typeof websocket === 'string') ? useWebSocket(websocket) : websocket;
    const { status, data, send, open, close } = ws;
    const shortId = ref((window as any).__shortId || '');

    let controller = new AbortController();
    let peers: Partial<Record<string, PeerInfo>> = {};

    watch(shortId, (val) => {
        if (val) (window as any).__shortId = val;
    });

    watch(data, (newValue) => {
        const newData = JSON.parse(newValue);
        console.log('newData: ', newData);
        if (newData.shortId) {
            shortId.value = newData.shortId;
        }

        if (newData.type === 'offer') {
            handleOffer(newData);
        } else if (newData.type === 'answer') {
            handleAnswer(newData);
        } else if (newData.type === 'candidate') {
            handleCandidate(newData);
        }
    });

    async function handleAnswer(data: any) {
        const { answer, peerId } = data;
        const peerInfo = peers[peerId];
        if (answer && peerInfo) {
            await peerInfo.connection.setRemoteDescription(answer);
            console.log('handleAnswer()');
        }
    }

    async function handleCandidate(data: any) {
        const { candidate, peerId } = data;
        const peerInfo = peers[peerId];
        if (candidate && peerInfo) {
            await peerInfo.connection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('handleCandidate()');
        }
    }

    async function handleOffer(data: any) {
        const { offer, peerId } = data;
        console.log('handleOffer: ', data);
        if (offer && peerId) {
            const connection = new RTCPeerConnection(configuration);
            const peer: PeerInfo = {
                peerId,
                connection,
            };

            console.log('handleOffer, created connection');

            connection.addEventListener('icecandidate', (event) => {
                console.log('icecandidate:', event);

                const { candidate } = event;
                if (candidate) {
                    send(JSON.stringify({
                        type: 'candidate',
                        shortId: shortId.value,
                        peerId,
                        candidate,
                    }));
                }
            }, { signal: controller.signal });

            connection.addEventListener('datachannel', (event) => {
                console.log('datachannel:', event);

                const { channel: receiveChannel } = event;
                peer.dataChannel = receiveChannel;

                receiveChannel.addEventListener('open', (event) => {
                    console.log('channel is open: ', event);
                }, { signal: controller.signal })

                receiveChannel.addEventListener('message', (event) => {
                    console.log('channel got message: ', event);
                }, { signal: controller.signal })

                // TO SEND DATA:
                // dataChannel.send(JSON.stringify({ message: 'blah' }));

            }, { signal: controller.signal });

            await connection.setRemoteDescription(offer);
            console.log('handleOffer, set description');
            const answer = await connection.createAnswer();
            await connection.setLocalDescription(answer);
            console.log('handleOffer, created answer');
            send(JSON.stringify({
                type: 'answer',
                shortId: shortId.value,
                peerId: data.peerId,
                answer: connection.localDescription,
            }))
            console.log('handleOffer()', data.peerId, shortId.value);
        }
    }

    function hostRoom() {
        send(JSON.stringify({
            type: 'host',
        }));
    }

    return {
        peers,
        shortId,
        hostRoom,

        status, data, send, open, close,

        get signal() { return controller.signal; },
        abort() { controller.abort(); },
    };
}

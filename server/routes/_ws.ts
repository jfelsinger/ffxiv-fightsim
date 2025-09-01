import type { Peer, Message } from 'crossws';
import shortHash from '~~/shared/utils/short-hash';

// TODO:
// [ ] Handle Disconnects and Leaves
// [ ] Handle Reconnection
//      * User has a temporary user id,
//        uses that to re-identify on reconnect

type HostRequest = {
    type: 'host',
    pass?: string,
}

type OfferRequest = {
    type: 'offer',
    offer: any,
    shortId: string,
    pass?: string,
}

type AnswerRequest = {
    type: 'answer',
    answer: any,
    shortId: string,
    peerId: string,
}

type CandidateRequest = {
    type: 'candidate',
    candidate: any,
    shortId: string,
    peerId: string,
}

type MessageType = 'host' | 'offer' | 'answer' | 'error' | 'candidate';
type HandlerResponse<TResponse = any> = { response?: TResponse, success: boolean, error?: Error };
type Handler<TRequest = any, TResponse = any> = (peer: Peer, data: TRequest, message: Message) => Promise<HandlerResponse<TResponse>>;

type Room = {
    host: Peer,
    shortId: string,
    pass?: string,
    users: Partial<Record<string, Peer>>,
};

const rooms: Partial<Record<string, Room>> = {};

const handlers: Partial<Record<MessageType, Handler>> = {
    async host(peer, data: HostRequest, message) {
        const shortId = (await shortHash(peer.id)) || peer.id;
        const room = {
            host: peer,
            shortId, users: {
                [peer.id]: peer,
            }
        };
        rooms[shortId] = room;

        peer.subscribe(shortId);
        return {
            success: true,
            response: {
                type: 'host',
                message: 'Room started.',
                shortId,
            },
        };
    },

    async offer(peer, data: OfferRequest, message) {
        const room = rooms[data.shortId];
        if (!room) {
            return { success: false };
        }

        room.host.send(JSON.stringify({
            type: 'offer',
            shortId: data.shortId,
            peerId: peer.id,
            offer: data.offer,
        }));
        room.users[peer.id] = peer;

        return { success: true };
    },

    async answer(peer, data: AnswerRequest, message) {
        const room = rooms[data.shortId];
        if (!room) {
            return { success: false };
        }

        const recipient = room.users[data.peerId];
        if (!recipient) {
            return { success: false };
        }

        recipient.send(JSON.stringify({
            type: 'answer',
            answer: data.answer,
            shortId: data.shortId,
        }));

        return { success: true };
    },

    async candidate(peer, data: CandidateRequest, message) {
        const room = rooms[data.shortId];
        if (!room) {
            return { success: false };
        }

        const recipient = data.peerId ? room.users[data.peerId] : room.host;
        if (!recipient) {
            return { success: false };
        }

        recipient.send(JSON.stringify({
            type: 'candidate',
            candidate: data.candidate,
            peerId: data.peerId || peer.id,
        }));

        return { success: true };
    },
} as const;

export default defineWebSocketHandler({
    async open(peer: Peer) {
        console.log('peer connected.', peer.id);

        peer.send(JSON.stringify({ type: 'welcome', message: 'Welcome!' }));
    },

    async message(peer: Peer, message: Message) {
        const data = JSON.parse(message.toString());

        console.log('MESSAGE: ', data);
        const { type: messageType } = data;

        if (messageType) {
            const handler = handlers[messageType as MessageType];
            if (handler) {
                const { response, success, error } = await handler(peer, data, message);
                if (error) { console.error(error); }
                if (response) {
                    peer.send(JSON.stringify(response));
                } else if (!success) {
                    console.log('Not successfull. :(');
                }
            }
        }
    },

    async close(peer: Peer) {
        console.log('peer connection closed');
    },
});

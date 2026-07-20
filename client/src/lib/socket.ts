import { io, Socket } from 'socket.io-client';
import { API_URL } from './utils';

const URL = process.env.NODE_ENV === 'production' ? undefined : API_URL;

export const socketConnection = (roomId: string, clientId: string, sessionId: string, username: string): Socket => {

    const socket = io(URL, {
        path: "/watch-party",
        query: { roomId, clientId, sessionId, username },
        transports: ['websocket']
    })

    return socket
};
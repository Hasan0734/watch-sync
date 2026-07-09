import { io, Socket } from 'socket.io-client';
import { getOrCreateClientId, getOrCreateSessionId, getOrGenerateName } from './utils';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3001/';

export const socketConnection = (roomId: string): Socket => {

    const clientId = getOrCreateClientId()
    const sessionId = getOrCreateSessionId()
    const username = getOrGenerateName();

    const socket = io(URL, {
        path: "/watch-party",
        query: { roomId, clientId, sessionId, username }
    })

    return socket
};
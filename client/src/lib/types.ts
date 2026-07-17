export type MessageType = {
    text: string;
    clientId: string;
    username: string;
    createdAt: Date;
}


export interface User {
    id: string;
    name: string;
}

export interface PlayerState {
    playing: boolean;
    currentTime: number;
    playbackRate: number;
    sequence: number;
    updatedAt: number;
}
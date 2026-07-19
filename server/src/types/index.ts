export type MessageType = {
    message: string;
    clientId: string;
    username: string;
    createdAt: Date;
}


export interface PlayerUpdate {
    playing: boolean;
    currentTime: number;
    playbackRate: number;
}
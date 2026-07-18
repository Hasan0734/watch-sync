// export type MessageType = {
//     type: "message",
//     text: string;
//     clientId: string;
//     username: string;
//     createdAt: Date;
// }
export type SystemMessage = {
    type: "system",
    event: "join" | "leave";
    clientId: string;
    username: string;
    createdAt: number;
}

export type MessageType = {
    type: "chat" | "system",
    event?: "join" | "leave";
    text?: string,
    clientId: string;
    username: string;
    createdAt: number;
};

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
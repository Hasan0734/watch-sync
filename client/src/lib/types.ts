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
    videoUrl: string;
}

export interface MediaState {
    id: string;
    title: string;
    videoUrl: string;
    posterUrl: string;
    thumbnailUrl: string;
    duration: 0
}

export interface RoomState {
    player: PlayerState;
    media: MediaState
}



export interface PlaylistVideo {
    url: string;
    name: string;
    img?: string;
    channel?: string;
    duration: number;
    type: string;
}

export interface SearchResult extends PlaylistVideo {
    size?: string | number;
    seeders?: string;
    magnet?: string;
    type: "youtube" | "file" | "magnet";
    url: string;
    name: string;
    duration: number;
}
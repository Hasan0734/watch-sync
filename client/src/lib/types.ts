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
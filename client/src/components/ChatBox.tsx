import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "#/components/ui/input-group";
import {
    MessageSquareText,
    Send,
    Settings,
    Users,
} from "lucide-react";
import {useEffect, useState, type ChangeEvent, type FocusEventHandler} from "react";
import type {Socket} from "socket.io-client";
import {
    Message,
    MessageAvatar,
    MessageContent,
} from "#/components/ui/message";
import {Marker, MarkerContent} from "#/components/ui/marker";
import {Avatar, AvatarFallback, AvatarImage} from "#/components/ui/avatar";
import {
    Bubble,
    BubbleContent,

} from "#/components/ui/bubble";
import {getOrCreateClientId, getOrGenerateName} from "#/lib/utils.ts";
import type {MessageType} from "#/lib/types.ts";

interface PropsType {
    socket: Socket;
}

interface User {
    id: string;
    name: string;
}

interface Typing {
    clientId: string;
    username: string;
}


const ChatBox = ({socket}: PropsType) => {
    const [activeUsers, setActiveUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [message, setMessage] = useState("");
    const [chatTyping, setChatTyping] = useState<Typing | null>(null)
    const clientId = getOrCreateClientId();
    const username = getOrGenerateName();


    useEffect(() => {
        const handleUsersList = ({users}: { users: User[] }) => {
            setActiveUsers(users);
        };

        const handleChatMessage = (msg: MessageType) => {
            console.log(msg)
            setMessages((prev) => [...prev, msg]);
        };

        const handleTyping = (msg: Typing | null) => {
            setChatTyping(msg)
        }

        socket.on("room:users-list", handleUsersList);
        socket.on("chat:message", handleChatMessage);
        socket.on("chat:typing", handleTyping);

        return () => {
            socket.off("room:users-list", handleUsersList);
            socket.off("chat:message", handleChatMessage);
            socket.off("chat:typing", handleTyping);
        };
    }, []);

    const onSubmit = (e: any) => {
        e.preventDefault();
        if (!message) return;
        const msg = {
            clientId,
            username,
            message,
            createdAt: new Date(),
        }
        socket.emit("chat:message", msg);
        setMessages((prev) => [...prev, msg]);
        setMessage("");
        socket.emit("chat:typing", null);

    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)
        const msg = {
            clientId,
            username
        }
        socket.emit("chat:typing", msg)
    }

    const onBlur = () => {
        socket.emit("chat:typing", null);
    }
    return (
        <div className="w-full h-full flex flex-col border rounded-md bg-background">
            <div className="grid grid-cols-3 gap-2  shrink-0 p-3">
                <button className="flex items-center flex-col border py-2 px-2 gap-1 rounded-md text-sm">
                    <MessageSquareText size={20}/>
                    Chat
                </button>
                <button className="flex items-center flex-col border py-2 px-2 gap-1 rounded-md text-sm">
                    <Users size={20}/>
                    Participants {activeUsers.length}
                </button>
                <button className="flex items-center flex-col border py-2 px-2 gap-1 rounded-md text-sm">
                    <Settings size={20}/>
                    Settings
                </button>
            </div>
            <div className="flex-1 min-h-0 flex flex-col w-full  pb-3">
                <div className=" flex-1 flex flex-col   gap-6 px-3 overflow-y-auto scrollbar-none">
                    {messages.map((message, index) => {
                        const isMe = message.clientId === clientId;
                        return (
                            <Message key={message.message + index}
                                     align={isMe ? "end" : "start"}
                            >
                                <MessageAvatar>
                                    {isMe ? <Avatar>
                                        <AvatarImage src="/avatars/10.png" alt="@me"/>
                                        <AvatarFallback>ME</AvatarFallback>
                                    </Avatar> : <Avatar>
                                        <AvatarImage src="/avatars/02.png" alt="@rabbit"/>
                                        <AvatarFallback>{message.username.slice(0, 1)}</AvatarFallback>
                                    </Avatar>}
                                </MessageAvatar>
                                <MessageContent>
                                    <Bubble variant={isMe ? "default" : "muted"}>
                                        <BubbleContent>{message.message}</BubbleContent>
                                    </Bubble>
                                </MessageContent>
                            </Message>
                        )
                    })}

                    {chatTyping && chatTyping.clientId !== clientId && <Marker role="status" className={"mb-3"}>
                        <MarkerContent className="shimmer">
                            <span className="font-medium">{chatTyping.username}</span> is typing...
                        </MarkerContent>
                    </Marker>}
                </div>

                <form className="px-3 shrink-0 pt-2" onSubmit={onSubmit}>
                    <InputGroup>
                        <InputGroupInput
                            value={message}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                        <InputGroupAddon align={"inline-end"}>
                            <InputGroupButton type="submit">
                                <Send/>
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </form>
            </div>


        </div>
    );
};

export default ChatBox;

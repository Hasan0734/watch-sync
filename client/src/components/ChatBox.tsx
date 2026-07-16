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
import {useEffect, useState, type ChangeEvent, useRef} from "react";
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


const ChatBox = ({socket}: PropsType) => {
    const [activeUsers, setActiveUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [text, setText] = useState("");
    const [typingUser, setTypingUser] = useState<string | null>(null);

    const isTypingRef = useRef<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [unreadCount, setUnreadCount] = useState(0);

    const messagesRef = useRef<HTMLDivElement>(null);
    const [isNearBottom, setIsNearBottom] = useState(true);

    const clientId = getOrCreateClientId();
    const username = getOrGenerateName();


    useEffect(() => {
        const handleUsersList = ({users}: { users: User[] }) => {
            setActiveUsers(users);
        };

        const handleChatMessage = (msg: MessageType) => {
            setMessages((prev) => [...prev, msg]);
        };

        const handleTyping = (data: { user: string, isTyping: boolean }) => {
            if (data?.isTyping) {
                setTypingUser(data.user);
            } else {
                setTypingUser(null);
            }
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

    useEffect(() => {
        if (!messagesRef.current) return;

        if (isNearBottom) {
            messagesRef.current.scrollTo({
                top: messagesRef.current.scrollHeight,
                behavior: "smooth",
            });
            setUnreadCount(0);
        } else {
            setUnreadCount((c) => c + 1);
        }
    }, [messages]);


    const onSubmit = (e: any) => {
        e.preventDefault();
        if (!text) return;
        const msg = {
            clientId,
            username,
            text,
            createdAt: new Date(),
        }
        socket.emit("chat:message", msg);
        setMessages((prev) => [...prev, msg]);
        setText("");

    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value)
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socket.emit('chat:typing', {user: username, isTyping: true});
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            socket.emit("chat:typing", {user: username, isTyping: false});
        }, 1500)
    }

    const onBlur = () => {
        socket.emit("chat:typing", null);
    }

    const handleScroll = () => {
        const el = messagesRef.current;
        if (!el) return;
        const threshold = 50; // px
        const atBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
        setIsNearBottom(atBottom);
        if (atBottom) {
            setUnreadCount(0);
        }
    };


    return (
        <div className="w-full h-125 sm:h-full flex flex-col border rounded-md bg-background">
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
                <div

                    className="relative flex-1 flex flex-col min-h-0  gap-6 px-3 ">

                    <div
                        ref={messagesRef}
                        onScroll={handleScroll}
                        className={"flex flex-col gap-6 h-full overflow-y-auto scrollbar-none"}>
                        {messages.map((message, index) => {
                            const isMe = message.clientId === clientId;
                            return (
                                <Message
                                    key={message.text + index}
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
                                            <BubbleContent>{message.text}</BubbleContent>
                                        </Bubble>
                                    </MessageContent>
                                </Message>
                            )
                        })}
                        {typingUser && <Marker role="status" className={"mb-3"}>
                            <MarkerContent className="shimmer">
                                <span className="font-medium">{typingUser}</span> is typing...
                            </MarkerContent>
                        </Marker>}
                    </div>


                    {(unreadCount > 0 || typingUser) && !isNearBottom && (
                        <div

                            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-sm text-center"
                        >
                            {unreadCount > 0 && <p
                                onClick={() => {
                                    messagesRef.current?.scrollTo({
                                        top: messagesRef.current.scrollHeight,
                                        behavior: "smooth",
                                    });
                                    setUnreadCount(0);
                                }}
                            >↓ {unreadCount} New Messages</p>}

                            {typingUser && <p className={"text-muted-foreground"}> {typingUser} is typing...</p>}
                        </div>
                    )}
                </div>

                <form className="px-3 shrink-0 pt-2" onSubmit={onSubmit}>
                    <InputGroup>
                        <InputGroupInput
                            value={text}
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

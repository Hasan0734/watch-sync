import {type Ref} from 'react';
import {Message, MessageAvatar, MessageContent, MessageFooter} from "#/components/ui/message.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "#/components/ui/avatar.tsx";
import {Bubble, BubbleContent} from "#/components/ui/bubble.tsx";
import {Marker, MarkerContent} from "#/components/ui/marker.tsx";
import type {MessageType} from "#/lib/types.ts";
import {getOrCreateClientId} from "#/lib/utils.ts";
import {format} from 'date-fns'

interface MessageListProps {
    messages: MessageType[];
    typingUser: string | null;
    messagesRef: Ref<HTMLDivElement>;
    handleScroll: () => void;
}

const MessageLists = ({messages, typingUser, messagesRef, handleScroll}: MessageListProps) => {
    const clientId = getOrCreateClientId()

    return (
        <div
            ref={messagesRef}
            onScroll={handleScroll}
            className={"flex flex-col gap-6 h-full overflow-y-auto scrollbar-none"}>
            {messages.map((message, index) => {

                switch (message.type) {
                    case "chat":
                        return <MessageItem message={message}/>
                    case "system":
                        return <SystemMessage message={message}/>
                }

            })}

            {typingUser && <Marker role="status" className={"mb-3"}>
                <MarkerContent className="shimmer">
                    <span className="font-medium">{typingUser}</span> is typing...
                </MarkerContent>
            </Marker>}
        </div>
    );
};

export default MessageLists;


const MessageItem = ({message}: { message: MessageType }) => {
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
                <MessageFooter>
                    {format(new Date(message.createdAt), "h:mm:ss a")}
                </MessageFooter>
            </MessageContent>
        </Message>
    )
}

const SystemMessage = ({message}: { message: MessageType }) => {
    return (
        <div className={"flex justify-center"}>
            <p className={"text-xs font-medium text-muted-foreground"}>
                {message.event === "join"
                    ? `🎉 ${message.username} joined`
                    : `👋 ${message.username} left`}
            </p>
        </div>
    )
}
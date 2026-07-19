import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { MessageType, User } from "#/lib/types.ts";
import ChatHeaderTab from "#/components/chat/ChatHeaderTab.tsx";
import ChatForm from "#/components/chat/ChatForm.tsx";
import MessageLists from "#/components/chat/MessageLists.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "#/lib/utils";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";

interface PropsType {
  socket: Socket;
}

type Tab = "chat" | "participants" | "settings";

const ChatBox = ({ socket }: PropsType) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const [unreadCount, setUnreadCount] = useState(0);

  const messagesRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  useEffect(() => {
    const handleUsersList = ({ users }: { users: User[] }) => {
      setActiveUsers(users);
    };
    const handleChatMessage = (msg: MessageType) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = (data: { user: string; isTyping: boolean }) => {
      if (data?.isTyping) {
        setTypingUser(data.user);
      } else {
        setTypingUser(null);
      }
    };

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

  // message list scroll handle
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

  // when new message append
  const handleScrollToBottom = () => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
    setUnreadCount(0);
  };

  const handleTab = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full h-125 sm:h-full flex flex-col border rounded-md bg-background overflow-hidden">
      <ChatHeaderTab
        activeTab={activeTab}
        handleTab={handleTab}
        activeUsers={activeUsers}
      />
      <div className="flex-1 min-h-0 flex flex-col w-full pb-3 relative ">
        <div className="relative flex-1 flex flex-col min-h-0  gap-6 px-3 ">
          <MessageLists
            messages={messages}
            messagesRef={messagesRef}
            handleScroll={handleScroll}
            typingUser={typingUser}
          />
          {(unreadCount > 0 || typingUser) && !isNearBottom && (
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-sm text-center z-10">
              {unreadCount > 0 && (
                <button
                  className={"cursor-pointer bg-accent px-3 py-1 rounded-full"}
                  onClick={handleScrollToBottom}
                >
                  ↓ {unreadCount} New Messages
                </button>
              )}

              {typingUser && (
                <p
                  className={
                    "text-muted-foreground bg-background px-3 py-1 rounded-full"
                  }
                >
                  {" "}
                  {typingUser} is typing...
                </p>
              )}
            </div>
          )}
        </div>
        <ChatForm setMessages={setMessages} socket={socket} />
        {/* showing the all participants */}
        <div
          className={cn("absolute inset-0 bg-background p-2 h-0 hidden ", {
            "h-auto block": activeTab === "participants",
          })}
        >
          <ShowUserList participants={activeUsers} />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;

const ShowUserList = ({ participants }: { participants: User[] }) => {
  return (
    <>
      <div className="text-base font-medium flex justify-between items-center">
        <h2> All Participants ({participants.length})</h2>
        <Button variant={'secondary'} size={'sm'}>
           <UserPlus/> Invite
        </Button>
      </div>
      <div className="mt-3 min-h-0 overflow-y-auto flex flex-col gap-1.5">
        {participants.map((user) => (
          <div className="flex  gap-2 items-center bg-input p-1 rounded-lg">
            <Avatar>
              <AvatarImage src="/avatars/10.png" alt="@me" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <h3 className="text-sm">{user.name}</h3>
          </div>
        ))}
      </div>
    </>
  );
};

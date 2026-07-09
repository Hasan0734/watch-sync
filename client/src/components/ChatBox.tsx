import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group";
import {
  MessageCircleIcon,
  MessageSquareText,
  Send,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

interface PropsType {
  socket: Socket;
}

interface User {
  id: string;
  name: string;
}

const ChatBox = ({ socket }: PropsType) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  useEffect(() => {
    socket.on(
      "room:users-list",
      ({ users }: { users: Array<{ id: string; name: string }> }) => {
        setActiveUsers(users);
      },
    );
  }, [socket]);

  return (
    <div className="min-w-80 p-3 flex flex-col justify-between border rounded">
      <div className="flex gap-2 justify-center">
        <button className="flex items-center flex-col">
          <MessageSquareText />
          Chat
        </button>
        <button className="flex items-center flex-col">
          <Users />
          Participants
        </button>
        <button className="flex items-center flex-col">
          <Settings />
          Settings
        </button>
      </div>
      <div></div>
      <div>
        <InputGroup>
          <InputGroupInput />
          <InputGroupAddon align={"inline-end"}>
            <InputGroupButton>
              <Send />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};

export default ChatBox;

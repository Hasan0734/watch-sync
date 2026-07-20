import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useRef,
  useState,
} from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group.tsx";
import { getOrCreateClientId, getOrGenerateName } from "#/lib/utils.ts";
import type { Socket } from "socket.io-client";
import type { MessageType } from "#/lib/types.ts";
import { Send } from "lucide-react";

interface ChatFormProps {
  socket: Socket;
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
}

const ChatForm = ({ socket, setMessages }: ChatFormProps) => {
  const [text, setText] = useState("");

  const isTypingRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clientId = getOrCreateClientId();
  const username = getOrGenerateName();

  const onSubmit = (e: any) => {
    e.preventDefault();
    if (!text) return;
    const msg = {
      clientId,
      username,
      text,
      createdAt: new Date(),
    };
    socket.emit("chat:message", msg);
    // setMessages((prev) => [...prev, msg]);
    setText("");
    socket.emit("chat:typing", { user: username, isTyping: false });
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("chat:typing", { user: username, isTyping: true });
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("chat:typing", { user: username, isTyping: false });
    }, 1500);
  };

  const onBlur = () => {
    socket.emit("chat:typing", null);
  };

  return (
    <form className="px-3 shrink-0 pt-2" onSubmit={onSubmit}>
      <InputGroup>
        <InputGroupInput
          name="message"
          id="messsage"
          value={text}
          onChange={onChange}
          onBlur={onBlur}
        />
        <InputGroupAddon align={"inline-end"}>
          <InputGroupButton type="submit">
            <Send />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
};

export default ChatForm;

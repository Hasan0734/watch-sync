import type { User } from "#/lib/types.ts";
import { cn } from "#/lib/utils";
import { MessageSquareText, Settings, Users } from "lucide-react";

type Tab = "chat" | "participants" | "settings";

interface Props {
  activeUsers: User[];
  activeTab: Tab;
  handleTab: (tab: Tab) => void;
}

const ChatHeaderTab = ({ activeUsers, activeTab, handleTab }: Props) => {
  return (
    <div className="grid grid-cols-3 gap-2 shrink-0 p-3 border-b">
      <button
        onClick={() => handleTab("chat")}
        className={cn(
          "flex items-center flex-col border py-2 px-2 gap-1 rounded-md text-sm",
          { "bg-secondary": activeTab === "chat" },
        )}
      >
        <MessageSquareText size={20} />
        <span className="hidden xs:block sm:hidden lg:block">Chat</span>
      </button>
      <button
        onClick={() => handleTab("participants")}
        className={cn(
          "flex items-center flex-col border py-2 px-2 gap-1 rounded-md text-sm",
          { "bg-secondary": activeTab === "participants" },
        )}
      >
        <Users size={20} />
        <span className="hidden xs:block sm:hidden lg:block">
          Participants {activeUsers.length}
        </span>
      </button>
      <button
        onClick={() => handleTab("settings")}
        className={cn(
          "flex items-center flex-col border py-2 px-2 gap-1 rounded-md text-sm",
          { "bg-secondary": activeTab === "settings" },
        )}
      >
        <Settings size={20} />
        <span className="hidden xs:block sm:hidden lg:block">Settings</span>
      </button>
    </div>
  );
};

export default ChatHeaderTab;

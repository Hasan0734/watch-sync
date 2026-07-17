import React from 'react';
import type {User} from "#/lib/types.ts";
import {MessageSquareText, Settings, Users} from "lucide-react"

interface Props {
    activeUsers: User[]
}

const ChatHeaderTab = ({activeUsers}: Props) => {
    return (
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
    );
};

export default ChatHeaderTab;
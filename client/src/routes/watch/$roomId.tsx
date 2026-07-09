import ChatBox from "#/components/ChatBox";
import Player from "#/components/Player";
import { Spinner } from "#/components/ui/spinner";
import { socketConnection } from "#/lib/socket";
import {
  getOrCreateClientId,
  getOrCreateSessionId,
  getOrGenerateName,
} from "#/lib/utils";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/watch/$roomId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const socket = socketConnection(roomId);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [message, setMessage] = useState();

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("room:error", (ctx) => {
      switch (ctx.code) {
        case "ROOM_NOT_FOUND":
          setMessage(ctx.message);
          break;
        default:
          setMessage(ctx.message || "Something is wrong!");
          break;
      }
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    getOrCreateClientId();
    getOrCreateSessionId();
    getOrGenerateName();
  }, []);

  return (
    <div className="">
      {message && (
        <div className="min-h-[calc(100vh-300px)] sm:min-h-[calc(100vh-300px)] flex justify-center items-center">
          <div className="flex gap-1 items-center flex-col">
            {message}
            <button
              onClick={() => navigate({ to: "/" })}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
            >
              <ArrowLeft size={16} /> Back Home
            </button>
          </div>
        </div>
      )}
      {!message &&
        (isConnected && socket ? (
          <div className="p-4 flex  bg-(--header-bg) gap-1">
            <div className="flex justify-center items-center flex-1  overflow-hidden">
              <Player targetRoomId={roomId} socket={socket} />
            </div>
            <ChatBox socket={socket} />
          </div>
        ) : (
          <div className="min-h-[calc(100vh-300px)] sm:min-h-[calc(100vh-300px)] flex justify-center items-center">
            <div className="flex gap-1 items-center flex-col ">
              <Spinner className="size-5" /> Joining to room...
            </div>
          </div>
        ))}
    </div>
  );
}

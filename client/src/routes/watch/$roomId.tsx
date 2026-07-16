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
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const Route = createFileRoute("/watch/$roomId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { roomId } = Route.useParams();
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const clientId = getOrCreateClientId();
    const sessionId = getOrCreateSessionId();
    const username = getOrGenerateName();

    socketRef.current = socketConnection(roomId, clientId, sessionId, username);

    const socketInstance = socketRef.current;

    socketInstance.on("connect", () => {
      console.log("is connected");
      setIsConnected(true);
    });

    socketInstance.on("room:error", (err) => {
      console.log(err);
      setMessage(err.message);
    });

    // socketInstance.on("disconnect", (reason) => {
    //   setIsConnected(false);
    // });
  }, [roomId]);

  console.log(socketRef.current);
  console.log({ message });

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
      {!message && (
        <>
          {isConnected && socketRef.current ? (
            <div className="p-4 flex bg-(--header-bg) gap-4 h-[calc(100vh-171px)] items-stretch overflow-hidden">
              <div className=" flex-1  rounded-md  overflow-hidden">
                <Player targetRoomId={roomId} socket={socketRef.current} />
              </div>
              <div className="w-90 shrink-0 h-full">
                <ChatBox socket={socketRef.current} />
              </div>
            </div>
          ) : (
            <div className="min-h-[calc(100vh-300px)] sm:min-h-[calc(100vh-300px)] flex justify-center items-center">
              <div className="flex gap-1 items-center flex-col ">
                <Spinner className="size-5" /> Joining to room...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

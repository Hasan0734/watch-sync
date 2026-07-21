import ChatBox from "#/components/chat/ChatBox.tsx";
import Player from "#/components/Player";
import { Input } from "#/components/ui/input";
import { Spinner } from "#/components/ui/spinner";
import VideoInput from "#/components/VideoInput";
import { socketConnection } from "#/lib/socket";
import {
  formatTime,
  getOrCreateClientId,
  getOrCreateSessionId,
  getOrGenerateName,
} from "#/lib/utils";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, VideoOff } from "lucide-react";
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
  const [videoUrl, setVideoUrl] = useState<string>("");

  const clientId = getOrCreateClientId();
  const username = getOrGenerateName();

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

  const handleVideoUrl = (url: any) => {
    socketRef.current?.emit("room:change-video", { url });
    socketRef.current?.emit("chat:message", {
      clientId,
      username,
      text: `Video source changed to: ${url}`,
      createdAt: new Date(),
    });
    
  };
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
            <div className="p-4 flex flex-col sm:flex-row bg-(--header-bg) gap-4  sm:h-120 xl:h-[calc(100vh-171px)] items-stretch overflow-hidden">
              <div className=" flex-1 space-y-2  rounded-md border-b">
                <VideoInput
                  videoUrl={videoUrl}
                  handleVideoUrl={handleVideoUrl}
                />

                <Player
                  setVideoUrl={setVideoUrl}
                  videoUrl={videoUrl}
                  socket={socketRef.current}
                />
              </div>
              <div className="min-w-70 w-full sm:w-80 lg:w-95 shrink-0 h-full">
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

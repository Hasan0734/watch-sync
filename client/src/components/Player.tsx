import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  Poster,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef } from "react";

interface PlayerProps {
  targetRoomId: string;
  socket: Socket;
}

const Player = ({ targetRoomId, socket }: PlayerProps) => {
  // const socketRef = useRef<Socket | null>(null);
  const playerRef = useRef<MediaPlayerInstance>(null);

  // Guard flag to check if the action was initiated by a remote socket event
  const isRemoteAction = useRef(false);

  // useEffect(() => {
  //   // 1. Establish Socket Connection
  //   // socketRef.current = io("http://localhost:3001", {
  //   //   path: "/watch-party",
  //   //   query: { roomId: targetRoomId },
  //   // });

  //   socket.on("room:initial-state", ({ currentTime, isPlaying }) => {
  //     if (playerRef?.current) {
  //       isRemoteAction.current = true;
  //       playerRef.current.currentTime = currentTime; // Fast-forward to current host position

  //       if (isPlaying) {
  //         playerRef.current?.play();
  //       } else {
  //         playerRef.current?.pause();
  //       }
  //     }
  //   });

  //   // 2. Listen for Remote Events
  //   socket.on("player:play", () => {
  //     if (playerRef.current?.paused) {
  //       isRemoteAction.current = true; // Set guard flag
  //       playerRef.current.play();
  //     }
  //   });

  //   socket.on("player:pause", () => {
  //     if (!playerRef.current?.paused) {
  //       isRemoteAction.current = true; // Set guard flag
  //       playerRef.current?.pause();
  //     }
  //   });

  //   socket.on("player:seek", ({ time }: { time: number }) => {
  //     // Prevent micro-adjustments loop if already close enough
  //     if (Math.abs((playerRef.current?.currentTime || 0) - time) > 0.5) {
  //       isRemoteAction.current = true; // Set guard flag
  //       playerRef.current!.currentTime = time;
  //     }
  //   });

  //   socket.on("player:rate", ({ rate }: { rate: number }) => {
  //     if (playerRef.current?.playbackRate !== rate) {
  //       isRemoteAction.current = true; // Set guard flag
  //       playerRef.current!.playbackRate = rate;
  //     }
  //   });

  //   socket.on("error", (data: { message: string }) => {
  //     alert(data.message);
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, [targetRoomId, socket]);

  // --- Local Event Handlers (Triggered by UI / User interaction) ---

  const handlePlay = () => {
    // If this event was fired due to a remote socket command, consume the flag and block emitting
    // if (isRemoteAction.current) {
    //   isRemoteAction.current = false;
    //   return;
    // }
    socket?.emit("player:play");
  };

  const handlePause = () => {
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }
    socket?.emit("player:pause");
  };

  const handleSeek = () => {
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }
    const currentTime = playerRef.current?.currentTime;
    if (currentTime !== undefined) {
      socket?.emit("player:seek", { time: currentTime });
      socket?.emit("player:pause");
    }
  };

  const handleRate = () => {
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }
    const rate = playerRef.current?.playbackRate;
    if (rate !== undefined) {
      socket?.emit("player:rate", { rate });
    }
  };

  const handleTimeUpdate = (detail: any) => {
    // Only the host should push updates, or restrict this via roles
    // If you don't have roles setup yet, you can skip this or throttle it
    const currentTime = detail.currentTime;

    // Send progress-sync every few seconds to keep Redis accurate for late joiners
    if (Math.floor(currentTime) % 4 === 0) {
      socket?.emit("player:progress-sync", { time: currentTime });
    }
  };
  return (
      <MediaPlayer
        className=""
        ref={playerRef}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeek}
        onRateChange={handleRate}
        src="/video.mp4"
        // src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        viewType="video"
        streamType="on-demand"
        logLevel="warn"
        crossOrigin
        playsInline
        title="Sprite Fight"
        muted
        poster="https://files.vidstack.io/sprite-fight/poster.webp"
      >
        <MediaProvider>
          <Poster className="vds-poster" />
        </MediaProvider>
        <DefaultVideoLayout
          thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
          icons={defaultLayoutIcons}
        />
      </MediaPlayer>
  );
};

export default Player;

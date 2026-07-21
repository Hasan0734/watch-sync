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
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { Socket } from "socket.io-client";
import { useEffect, useRef } from "react";
import {
  formatTime,
  getOrCreateClientId,
  getOrGenerateName,
} from "#/lib/utils.ts";
import type { PlayerState } from "#/lib/types.ts";

interface PlayerProps {
  targetRoomId: string;
  socket: Socket;
}

const Player = ({ socket }: PlayerProps) => {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const isRemoteAction = useRef(false);
  const isInitializing = useRef(true);
  const lastSequence = useRef(0);

  const clientId = getOrCreateClientId();
  const username = getOrGenerateName();

  useEffect(() => {
    const handleState = async (state: PlayerState) => {
      if (!playerRef.current) return;
      if (state.sequence <= lastSequence.current) return;

      lastSequence.current = state.sequence;
      isRemoteAction.current = true;
      isInitializing.current = true;
      try {
        const elapsed = (Date.now() - state.updatedAt) / 1000;
        const targetTime = state.playing
          ? state.currentTime + elapsed
          : state.currentTime;
        const player = playerRef.current;
        const drift = Math.abs(player.currentTime - targetTime);
        if (drift > 2) {
          player.currentTime = targetTime;
        }
        player.playbackRate = state.playbackRate;
        if (state.playing) {
          await player.play();
        } else {
          player.pause();
        }
      } finally {
        setTimeout(() => {
          isRemoteAction.current = false;
          isInitializing.current = false;
        }, 200);
      }
    };

    socket.on("player:state", handleState);
    return () => {
      socket.off("player:state", handleState);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!playerRef.current) return;
      if (playerRef.current.paused) return;
      sendState();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const sendState = () => {
    if (!playerRef.current) return;
    socket.emit("player:update", {
      playing: !playerRef.current.paused,
      currentTime: playerRef.current.currentTime,
      playbackRate: playerRef.current.playbackRate,
    });
  };

  const broadcastPlayerAction = (
    isPlaying: boolean,
    chatActionText?: string,
  ) => {
    if (!playerRef.current) return;
    if (isRemoteAction.current || isInitializing.current) return;

    const currentTime = playerRef.current.currentTime;
    const duration = playerRef.current.duration;
    const playbackRate = playerRef.current.playbackRate;

    if (currentTime.toFixed() === duration.toFixed()) {
      socket.emit("player:update", {
        playing: false,
        currentTime: 0,
        playbackRate,
      });

      return;
    }

    socket.emit("player:update", {
      playing: isPlaying,
      currentTime,
      playbackRate,
    });

    if (chatActionText) {
      socket.emit("chat:message", {
        clientId,
        username,
        text: `${chatActionText} at ${formatTime(currentTime)}`,
        createdAt: new Date(),
      });
    }
  };

  const handlePlay = () => broadcastPlayerAction(true, "Play the video at");
  const handlePause = (event: any) => {
    broadcastPlayerAction(false, "Pause the video at");
  };

  const handleSeek = (_: any, nativeEvent: any) => {
    if (!nativeEvent?.request) return;
    broadcastPlayerAction(!playerRef.current?.paused, "jumped to");
  };

  const handleRate = () => {
    if (!playerRef.current || isRemoteAction.current) return;

    const rate = playerRef.current.playbackRate;
    if (rate !== undefined) {
      socket.emit("player:rate", { rate });
    }
  };

//   const handleEnded = () => {
//     if (!playerRef.current) return;
//     const playbackRate = playerRef.current.playbackRate;

//     socket.emit("player:update", {
//       playing: false,
//       currentTime: 0,
//       playbackRate,
//     });


//   };

  return (
    <MediaPlayer
      className=""
      // aspectRatio="9/16"
      ref={playerRef}
      // onTimeUpdate={handleTimeUpdate}
      onPlay={handlePlay}
      onPause={handlePause}
      onSeeked={handleSeek}
      onRateChange={handleRate}
    //   onEnded={handleEnded}
      // src="/video.mp4"
      src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
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

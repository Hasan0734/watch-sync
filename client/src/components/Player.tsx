import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/plyr/theme.css";

import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  Poster,
} from "@vidstack/react";

import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";
import { Socket } from "socket.io-client";
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import {
  formatTime,
  getOrCreateClientId,
  getOrGenerateName,
} from "#/lib/utils.ts";
import type { PlayerState, RoomState } from "#/lib/types.ts";

interface PlayerProps {
  socket: Socket;
  videoUrl: string;
  setVideoUrl: Dispatch<SetStateAction<string>>;
}

const Player = ({ socket, videoUrl, setVideoUrl }: PlayerProps) => {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const isRemoteAction = useRef(false);
  const isInitializing = useRef(true);
  const lastSequence = useRef(0);

  const clientId = getOrCreateClientId();
  const username = getOrGenerateName();

  useEffect(() => {
    const handleState = async (roomState: RoomState) => {
      const { media, player: state } = roomState;
      setVideoUrl(media.videoUrl);
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

    socket.on("room:state", handleState);
    return () => {
      socket.off("room:state", handleState);
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

    console.log(currentTime, duration);

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

  console.log({ videoUrl });

  return (
    <>
      {!videoUrl && (
        <div className="h-full w-full bg-background flex justify-center items-center">
          <div className="bg-accent p-4 rounded-md space-y-2 text-center">
            <h3 className="font-semibold text-sm">
              You're not watching anything!
            </h3>
            <p className="text-sm text-muted-foreground">
              Pick something to watch above.
            </p>
          </div>
        </div>
      )}

      {videoUrl && (
        <MediaPlayer
          className=" xl:h-138 2xl:h-170 xl:w-full bg-background"

          ref={playerRef}

          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeek}
          onRateChange={handleRate}

          src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        //   src={videoUrl}
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

          <PlyrLayout icons={plyrLayoutIcons} />
        </MediaPlayer>
      )}
    </>
  );
};

export default Player;

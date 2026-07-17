import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import {MediaPlayer, MediaPlayerInstance, MediaProvider, Poster,} from "@vidstack/react";
import {defaultLayoutIcons, DefaultVideoLayout,} from "@vidstack/react/player/layouts/default";
import {Socket} from "socket.io-client";
import {useEffect, useRef} from "react";
import {formatTime, getOrCreateClientId, getOrGenerateName} from "#/lib/utils.ts";
import type {PlayerState} from "#/lib/types.ts";

interface PlayerProps {
    targetRoomId: string;
    socket: Socket;
}

const Player = ({targetRoomId, socket}: PlayerProps) => {
    const playerRef = useRef<MediaPlayerInstance>(null);
    const isRemoteAction = useRef(false);
    const lastSequence = useRef(0);

    const clientId = getOrCreateClientId();
    const username = getOrGenerateName();

    useEffect(() => {


        const handleState = async (state: PlayerState) => {
            if (!playerRef.current) return;
            if (state.sequence <= lastSequence.current)
                return;

            lastSequence.current = state.sequence;
            isRemoteAction.current = true;
            try {

                const elapsed = (Date.now() - state.updatedAt) / 1000;

                const targetTime = state.playing ? state.currentTime + elapsed : state.currentTime;

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
                isRemoteAction.current = false;
            }
        }

        socket.on("player:state", handleState)
        return () => {
            socket.off("player:state", handleState);
        }

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

    const handlePlay = () => {
        if (!playerRef.current) return;
        socket.emit("player:update", {
            playing: true,
            currentTime: playerRef.current.currentTime,
            playbackRate: playerRef.current.playbackRate,
        });

        const msg = {
            clientId,
            username,
            text: `Play the video at ${formatTime(playerRef.current?.currentTime as number)}`,
            createdAt: new Date(),
        }
        socket.emit("chat:message", msg)
    };

    const handlePause = () => {
        if (!playerRef.current) return;
        socket.emit("player:update", {
            playing: false,
            currentTime: playerRef.current.currentTime,
            playbackRate: playerRef.current.playbackRate,
        });

        const msg = {
            clientId,
            username,
            text: `Pause the video at  ${formatTime(playerRef.current?.currentTime as number)}`,
            createdAt: new Date(),
        }
        socket.emit("chat:message", msg);

    };

    const handleSeek = () => {
        if (!playerRef.current) return;
        socket.emit("player:update", {
            playing: !playerRef.current.paused,
            currentTime: playerRef.current.currentTime,
            playbackRate: playerRef.current.playbackRate,
        });

        // const msg = {
        //     clientId,
        //     username,
        //     text: `Seeked the video at  ${formatTime(playerRef.current?.currentTime as number)}`,
        //     createdAt: new Date(),
        // }
        // socket.emit("chat:message", msg);
    };

    const handleRate = () => {
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }
        const rate = playerRef.current?.playbackRate;
        if (rate !== undefined) {
            socket?.emit("player:rate", {rate});
        }
    };

    const handleTimeUpdate = (detail: any) => {
        const currentTime = detail.currentTime;

        if (Math.floor(currentTime) % 4 === 0) {
            socket?.emit("player:progress-sync", {time: currentTime});
        }
    };


    return (
        <MediaPlayer
            className="w-full relative"
            ref={playerRef}
            // onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeked={handleSeek}
            onRateChange={handleRate}
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
                <Poster className="vds-poster"/>
            </MediaProvider>
            <DefaultVideoLayout
                thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
                icons={defaultLayoutIcons}
            />
        </MediaPlayer>
    );
};

export default Player;


const handlePlayerPlay = async () => {
    if (playerRef.current?.paused) {
        isRemoteAction.current = true;
        await playerRef.current?.play();
    }
}
const handlePlayerPause = async () => {
    if (playerRef.current?.play) {
        isRemoteAction.current = true;
        await playerRef.current?.pause();
    }
}

const handleInitial = async ({currentTime, isPlaying}: { currentTime: number, isPlaying: boolean }) => {
    if (!playerRef.current?.currentTime) return;

    isRemoteAction.current = true;
    playerRef.current.currentTime = currentTime;

    if (isPlaying) {
        await playerRef.current?.play();
    } else {
        await playerRef.current?.pause();
    }
}

const handlePlayerSeek = ({time}: { time: number }) => {
    if (Math.abs((playerRef.current?.currentTime || 0) - time) > 0.5) {
        isRemoteAction.current = true;
        playerRef.current!.currentTime = time;
    }

// socket.on("player:play", handlePlayerPlay)
// socket.on("player:pause", handlePlayerPause)
// socket.on("room:initial-state", handleInitial);
// socket.on("player:seek", handlePlayerSeek);

// socket.off("player:play", handlePlayerPlay)
// socket.off("player:pause", handlePlayerPause)
// socket.off("player:initial-state", handleInitial)
// socket.off("player:seek", handlePlayerSeek);
}
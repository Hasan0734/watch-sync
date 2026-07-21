import {FastifyInstance} from "fastify";
import {Socket} from "socket.io";
import {PlayerUpdate} from "../types/index.ts";

const USER_TTL = 60 * 60 * 24; // 24 hours

function safeParse<T>(value: string): T | null {
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

export async function websocketRoutes(app: FastifyInstance) {

    const broadcastRoomUsers = async (roomId: string) => {
        try {
            const users = await app.redis.hgetall(`room:${roomId}:users`);
            if (!users) return;

            const list = Object.values(users)
                .map((item) => {
                    return safeParse(item as string);
                })
                .filter(Boolean);

            app.io.to(roomId).emit("room:users-list", {
                users: list,
            });
        } catch (error) {
            app.log.error(error);
        }
    };

    async function removeUser(roomId: string, clientId: string, socketId: string) {
        try {
            const record = await app.redis.hget(`room:${roomId}:users`, clientId);
            if (!record) return;

            const user = safeParse<{ socketId: string }>(record);
            if (!user) return;

            // User already reconnected with a different socket
            if (user.socketId !== socketId) {
                return;
            }

            await app.redis.hdel(`room:${roomId}:users`, clientId);
            await broadcastRoomUsers(roomId);

            app.log.info(`[Socket] Removed client ${clientId} from room ${roomId}`);
        } catch (error) {
            app.log.error(error);
        }
    }

    app.io.on("connection", async (socket: Socket) => {
        const roomId = socket.handshake.query.roomId as string;
        const username = (socket.handshake.query.username as string) || "Anonymous Guest";
        const clientId = socket.handshake.query.clientId as string;

        // ---------------- Validation ----------------

        if (!roomId || !clientId) {
            socket.emit("room:error", {
                code: "INVALID_CONNECTION",
                message: "Missing roomId or clientId.",
            });
            socket.disconnect(true);
            return;
        }

        try {

            const room = await app.redis.get(`room:${roomId}:meta`)

            const parsedRoom = JSON.parse(room as string);

            if (!room || parsedRoom.roomId !== roomId) {
                socket.emit("room:error", {
                    code: "ROOM_NOT_FOUND",
                    message: "This watch party room does not exist or has expired.",
                });
                socket.disconnect(true);
                return;
            }

            const state = await app.redis.get(`room:${roomId}:state`);
            const parsedState = JSON.parse(state as string);

            await socket.join(roomId);

            const userProfile = {
                id: clientId,
                name: username,
                socketId: socket.id,
            };

            await app.redis.hset(`room:${roomId}:users`, clientId, JSON.stringify(userProfile));
            await app.redis.expire(`room:${roomId}:users`, USER_TTL);

            socket.to(roomId).emit("chat:message", {
                type: "system",
                event: "join",
                username,
                clientId,
                createdAt: Date.now()
            });

            await broadcastRoomUsers(roomId);
            socket.emit("player:state", {
                playing: parsedState.playing,
                currentTime: Number(parsedState.currentTime),
                playbackRate: Number(parsedState.playbackRate),
                updatedAt: Number(parsedState.updatedAt),
                sequence: Number(parsedState.sequence),
            });

            app.log.info(`[Socket] ${username} joined room ${roomId}`);

        } catch (err) {
            app.log.error(err);
            socket.emit("room:error", {code: "SERVER_ERROR", message: "Internal server error."});
            return socket.disconnect(true);
        }

        // ---------------- Player state ----------------

        socket.on("player:update", async (payload: PlayerUpdate) => {
            const state = await app.redis.get(`room:${roomId}:state`);
            const parsedState = JSON.parse(state as string);
            if (!state) return;

            const sequence = Number(parsedState.sequence ?? 0) + 1;
            const newState = {
                playing: payload.playing,
                currentTime: payload.currentTime,
                playbackRate: payload.playbackRate,
                updatedAt: Date.now(),
                sequence,
            }

            await app.redis.set(`room:${roomId}:state`, JSON.stringify(newState), "EX", USER_TTL);
            socket.to(roomId).emit("player:state", newState);
        })

        // ---------------- Chat ----------------

        socket.on("chat:message", (data) => {
            
            app.io.to(roomId).emit("chat:message", {...data, type: "chat"});
        })

        socket.on("chat:typing", (data) => {
            socket.to(roomId).emit("chat:typing", data)
        })


        // ---------------- Disconnect ----------------
        socket.on("disconnecting", () => {
            // Capture the targeted room explicitly before the socket context strips its rooms
            const targetRoomId = roomId;

            if (targetRoomId) {
                setTimeout(() => {
                    removeUser(targetRoomId, clientId, socket.id);

                    socket.to(roomId).emit("chat:message", {
                        type: "system",
                        event: "left",
                        username,
                        clientId,
                        createdAt: Date.now()
                    });

                }, 2000);
            }
        });

        socket.on("disconnect", (reason) => {
            app.log.info(`[Socket] ${socket.id} disconnected (${reason})`);
        });
    });
}
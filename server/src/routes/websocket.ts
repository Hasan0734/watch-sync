import { FastifyInstance } from "fastify";
import {Socket} from "socket.io";

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

  app.io.on("connection", async (socket:Socket) => {
    const roomId = socket.handshake.query.roomId as string;
    const username = (socket.handshake.query.username as string) || "Anonymous Guest";
    const clientId = socket.handshake.query.clientId as string;
    const sessionId = socket.handshake.query.sessionId as string;

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
      // Fetch room data directly; handles both presence verification and state gathering in 1 call
      const room = await app.redis.hgetall(`room:${roomId}`);

      if (!room || Object.keys(room).length === 0) {
        socket.emit("room:error", {
          code: "ROOM_NOT_FOUND",
          message: "This watch party room does not exist or has expired.",
        });
        socket.disconnect(true);
        return;
      }

      await socket.join(roomId);

      const userProfile = {
        id: clientId,
        name: username,
        sessionId,
        socketId: socket.id,
      };

      await app.redis.hset(`room:${roomId}:users`, clientId, JSON.stringify(userProfile));
      await app.redis.expire(`room:${roomId}:users`, USER_TTL);

      await broadcastRoomUsers(roomId);

      socket.emit("room:initial-state", {
        roomName: room.roomName ?? "Watch Party",
        currentTime: Number(room.currentTime ?? 0),
        isPlaying: room.isPlaying === "true",
      });

      app.log.info(`[Socket] ${username} joined room ${roomId}`);

    } catch (err) {
      app.log.error(err);
      socket.emit("room:error", { code: "SERVER_ERROR", message: "Internal server error." });
      return socket.disconnect(true);
    }

    // ---------------- Player Events ----------------

    socket.on("player:play", async () => {
      try {
        socket.to(roomId).emit("player:play");
        await app.redis.hset(`room:${roomId}`, "isPlaying", "true");
      } catch (err) {
        app.log.error(err);
      }
    });

    socket.on("player:pause", async () => {
      try {
        socket.to(roomId).emit("player:pause");
        await app.redis.hset(`room:${roomId}`, "isPlaying", "false");
      } catch (err) {
        app.log.error(err);
      }
    });

    socket.on("player:seek", async (data: { time: number }) => {
      try {
        socket.to(roomId).emit("player:seek", data);
        await app.redis.hset(`room:${roomId}`, "currentTime", String(data.time));
      } catch (err) {
        app.log.error(err);
      }
    });

    socket.on("player:progress-sync", async (data: { time: number }) => {
      try {
        await app.redis.hset(`room:${roomId}`, "currentTime", String(data.time));
      } catch (err) {
        app.log.error(err);
      }
    });

    socket.on("player:rate", (data) => {
      socket.to(roomId).emit("player:rate", data);
    });

    // ---------------- Chat ----------------

    socket.on("chat:message", (data) => {
      socket.to(roomId).emit("chat:message", data)
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
        }, 2000);
      }
    });

    socket.on("disconnect", (reason) => {
      app.log.info(`[Socket] ${socket.id} disconnected (${reason})`);
    });
  });
}
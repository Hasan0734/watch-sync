import { FastifyInstance } from "fastify";

export async function websocketRoutes(app: FastifyInstance) {
  const broadcastRoomUsers = async (roomId: string) => {
    try {
      const usersMap = await app.redis.hgetall(`room:${roomId}:users`);
      const safeUsersMap = usersMap || {};

      const usersList = Object.values(safeUsersMap).map((userDataString) => {
        return JSON.parse(userDataString); // Returns { clientId, name, sessionId }
      });

      app.io.to(roomId).emit("room:users-list", { users: usersList });
    } catch (error: any) {
      app.log.error(`Failed to broadcast users for room ${roomId}:`, error.message);
    }
  };

  app.io.on("connection", async (socket) => {
    const roomId = socket.handshake.query.roomId as string;
    const username = (socket.handshake.query.username as string) || "Anonymous Guest";
    const clientId = socket.handshake.query.clientId as string;
    const sessionId = socket.handshake.query.sessionId as string

    if (!roomId && !clientId) {
      console.log(`[Socket] Connection rejected: Missing credentials.`)
      return socket.disconnect()
    };

    try {
      const roomExists = await app.redis.exists(`room:${roomId}`);

      if (!roomExists) {
        console.log(`Connection rejected: Room ${roomId} does not exist or has expired.`);
        socket.emit("room:error", {
          code: "ROOM_NOT_FOUND",
          message: "This watch party room does not exist or has expired."
        });

        socket.disconnect()
        return;
      };

      socket.join(roomId);

      const userProfile = {
        id: clientId,
        name: username,
        sessionId,
        socketId: socket.id
      }

      await app.redis.hset(`room:${roomId}:users`, clientId, JSON.stringify(userProfile));
      await app.redis.expire(`room:${roomId}:users`, 86400);

      await broadcastRoomUsers(roomId);

      const roomData = await app.redis.hgetall(`room:${roomId}`);
      socket.emit("room:initial-state", {
        roomName: roomData.roomName || "Watch Party",
        currentTime: parseFloat(roomData.currentTime || "0"),
        isPlaying: roomData.isPlaying === "true"
      });
      console.log(`[Socket] User ${username} (${socket.id}) successfully connected to room: ${roomId}`);

    } catch (error) {
      console.error("[Socket Connection Error]:", error);
      socket.emit("room:error", { code: "SERVER_ERROR", message: "Internal server error." });
      return socket.disconnect();
    }
    // --- Video Sync Events + Updating Redis State ---

    socket.on("player:play", async (data) => {
      // Broadcast to everyone else
      socket.to(roomId).emit("player:play");

      // Update Redis: Keep track that the video is playing
      await app.redis.hset(`room:${roomId}`, "isPlaying", "true");
    });

    socket.on("player:pause", async (data) => {
      socket.to(roomId).emit("player:pause");

      // Update Redis: Keep track that the video is paused
      await app.redis.hset(`room:${roomId}`, "isPlaying", "false");
    });

    socket.on("player:seek", async (data) => {
      socket.to(roomId).emit("player:seek", data);

      await app.redis.hset(`room:${roomId}`, "currentTime", data.time.toString());
    });

    socket.on("player:rate", (data) => {
      socket.to(roomId).emit("player:rate", data);
    });
    socket.on("player:progress-sync", async (data) => {
      await app.redis.hset(`room:${roomId}`, "currentTime", data.time.toString());
    });


    socket.on("disconnecting", async () => {

      for (const room of socket.rooms) {
        console.log(room, socket.id)
        if (room !== socket.id) {
          setTimeout(async () => {
            try {
              const currentRecord = await app.redis.hget(`room:${roomId}:users`, clientId);
              if (!currentRecord) return;

              const parseRecord = JSON.parse(currentRecord);

              if (parseRecord.socketId === socket.id) {
                await app.redis.hdel(`room:${room}:users`, clientId);
                await broadcastRoomUsers(room);
                console.log(`[Socket] Cleaned up inactive user: ${username}`);
              }
            } catch (err) {
              console.error(`Error processing disconnect for room ${room}:`, err);
            }
          }, 2000)
        }
      }
    });
    socket.on("disconnect", () => {
      console.log(`[Socket] User ${socket.id} is fully disconnected.`);
    });
  });
}
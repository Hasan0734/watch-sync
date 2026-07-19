import {FastifyInstance} from "fastify";
import {nanoid} from 'nanoid'

const TTL = 60 * 60 * 24; // 24 hours

export async function roomRoutes(app: FastifyInstance) {
    app.get("/create-room", async (req, replay) => {
        const roomId = nanoid();
        const room = {
            roomId,
            createdAt: Date.now(),
            controllerId: "",
        }

        const state = {
            playing: false,
            currentTime: 0,
            playbackRate: 1,
            updatedAt: Date.now(),
            sequence: 0
        }
        try {
            await app.redis.set(`room:${roomId}:meta`, JSON.stringify(room), "EX", TTL);
            await app.redis.set(`room:${roomId}:state`, JSON.stringify(state), "EX", TTL);

            // await app.redis.expire(`room:${id}`, 86400);
            await replay.send({ok: true, roomId})
        } catch (error) {
            await replay.send({ok: false, message: "Something is wrong!"})
        }
    })
}
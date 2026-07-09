import { FastifyInstance } from "fastify";
import { nanoid } from 'nanoid'

export async function roomRoutes(app: FastifyInstance) {
    app.get("/create-room", async (req, res) => {
        const id = nanoid();
        await app.redis.hset(`room:${id}`, {
            roomId: id,
            createdAt: new Date().toISOString()
        });
        await app.redis.expire(`room:${id}`, 86400);
        res.send({ ok: true, id })
    })
}


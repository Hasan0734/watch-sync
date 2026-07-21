import { FastifyInstance } from "fastify";
import { searchYoutube } from "../utils/youtube.ts";

export async function youtubeRoutes(app: FastifyInstance) {
    app.get("/youtube", async (req: any, reply) => {

        if (typeof req.query.q !== "string") {

            reply.code(500).send({ message: "Query must be a string" })
            return;
        }

        try {
            const items = await searchYoutube(req.query.q);

             reply.code(200).send(items)

        } catch (error: any) {
            reply.code(500).send({ message: error.message })
        }
    });
}
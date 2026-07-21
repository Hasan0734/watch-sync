import Fastify from "fastify";
import { websocketRoutes } from "./routes/websocket.ts";
import socketIo from "./realtime/socket.ts";
import cors from "@fastify/cors"
import { roomRoutes } from "./routes/rooms.ts";
import fastifyRedis from '@fastify/redis';
import { healthRoutes } from "./routes/health.ts";
import fastifyEnv from '@fastify/env';
import { youtubeRoutes } from "./routes/youtube.ts";

const schema = {
  type: 'object',
  required: ['YOUTUBE_API_KEY', 'REDIS_URL'],
  properties: {

    YOUTUBE_API_KEY: {
      type: 'string'
    },
    REDIS_URL: {
      type: 'string'
    }
  }
}

const options = {
  confKey: 'config',
  schema: schema,
  dotenv: true
};




export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(fastifyEnv, options);

  await app.register(cors, {
    origin: "*"
  })

  app.register(fastifyRedis, {
    // @ts-ignore
    url: app.config.REDIS_URL
  });

  await app.register(socketIo, {
    path: "/watch-party",
  });


  await app.register(healthRoutes);
  app.register(youtubeRoutes)
  await app.register(roomRoutes)
  await app.register(websocketRoutes);
  app.addContentTypeParser('*', (_, __, done) => done(null))

  return app;
}
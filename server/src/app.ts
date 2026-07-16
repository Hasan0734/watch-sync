import Fastify from "fastify";
import { websocketRoutes } from "./routes/websocket.ts";
import socketIo from "./realtime/socket.ts";
import cors from "@fastify/cors"
import { roomRoutes } from "./routes/rooms.ts";
import fastifyRedis from '@fastify/redis';
import {healthRoutes} from "./routes/health.ts";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: "*"
  })
  app.register(fastifyRedis, {
    url: 'redis://127.0.0.1:6379'
  });
  
  await app.register(socketIo, {
    path: "/watch-party",
  });

  await app.register(healthRoutes);
  await app.register(roomRoutes)
  await app.register(websocketRoutes);
  app.addContentTypeParser('*', (_, __, done) => done(null))

  return app;
}
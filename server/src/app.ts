import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { healthRoutes } from "./routes/health";
import { websocketRoutes } from "./routes/websocket";
import socketIo from "./realtime/socket";
import cors from "@fastify/cors"
import { roomRoutes } from "./routes/rooms";
import fastifyRedis from '@fastify/redis';

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
import fp from 'fastify-plugin';
import { Server, type ServerOptions } from 'socket.io';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}

export default fp(async function (fastify: FastifyInstance, opts: Partial<ServerOptions>) {
  // Attach Socket.IO to Fastify's native raw HTTP server
  const io = new Server(fastify.server, {
    cors: { origin: '*' }, // Configure CORS as needed
    ...opts
  });

  // Expose 'io' globally on the fastify instance
  fastify.decorate('io', io);

  fastify.addHook('preClose', (done) => {
    io.local.disconnectSockets(true);
    done();
  });
});

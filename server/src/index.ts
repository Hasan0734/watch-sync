import { buildApp } from "./apps.ts";

const app = await buildApp();

await app.listen({
  port: 3001,
  host: "0.0.0.0",
});

console.log("Realtime server started");
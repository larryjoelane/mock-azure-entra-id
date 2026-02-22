import "./types";
import { readFileSync } from "fs";
import { resolve } from "path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import { loadConfig } from "./config";
import { createKeySet } from "./crypto/keys";
import { AuthCodeStore } from "./services/auth-code-store";
import { discoveryRoutes } from "./routes/discovery";
import { authorizeRoutes } from "./routes/authorize";
import { tokenRoutes } from "./routes/token";
import { jwksRoutes } from "./routes/jwks";
import { logoutRoutes } from "./routes/logout";

export async function buildServer() {
  const config = loadConfig();
  const keySet = await createKeySet();
  const authCodeStore = new AuthCodeStore();

  // Load TLS certs for HTTPS (MSAL.js requires https authority)
  const certsDir = resolve(__dirname, "..", "certs");
  const fastify = Fastify({
    logger: true,
    https: {
      key: readFileSync(resolve(certsDir, "key.pem")),
      cert: readFileSync(resolve(certsDir, "cert.pem")),
    },
  });

  await fastify.register(cors, { origin: true, credentials: true });
  await fastify.register(formbody);

  fastify.decorate("config", config);
  fastify.decorate("keySet", keySet);
  fastify.decorate("authCodeStore", authCodeStore);

  const tenantPrefix = `/${config.tenantId}`;

  // Register all routes under the tenant prefix (matches real Azure Entra ID URL structure)
  await fastify.register(
    async (scoped) => {
      await scoped.register(discoveryRoutes);
      await scoped.register(authorizeRoutes);
      await scoped.register(tokenRoutes);
      await scoped.register(jwksRoutes);
      await scoped.register(logoutRoutes);
    },
    { prefix: tenantPrefix }
  );

  // Also serve discovery at the root for convenience
  await fastify.register(discoveryRoutes);

  fastify.get("/health", async () => ({ status: "ok" }));

  return fastify;
}

async function main() {
  const app = await buildServer();
  const address = await app.listen({ port: app.config.port, host: app.config.host });
  console.log(`Mock Azure Entra ID running at ${address}`);
  console.log(`Issuer: ${app.config.issuer}`);
  console.log(`Authority: https://localhost:${app.config.port}/${app.config.tenantId}`);
  console.log(`Users: ${app.config.users.map((u) => u.username).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

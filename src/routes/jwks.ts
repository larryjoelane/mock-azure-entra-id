import type { FastifyInstance } from "fastify";

export async function jwksRoutes(fastify: FastifyInstance) {
  fastify.get("/discovery/v2.0/keys", async (_request, reply) => {
    return reply.send({
      keys: [fastify.keySet.publicJwk],
    });
  });
}

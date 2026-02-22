import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

interface LogoutQuery {
  post_logout_redirect_uri?: string;
}

export async function logoutRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/oauth2/v2.0/logout",
    async (request: FastifyRequest<{ Querystring: LogoutQuery }>, reply: FastifyReply) => {
      const redirectUri = request.query.post_logout_redirect_uri;

      if (redirectUri) {
        return reply.redirect(redirectUri);
      }

      return reply.type("text/html").send(`<!DOCTYPE html>
<html><head><title>Signed out</title></head>
<body style="font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh;">
  <div style="text-align: center;">
    <h2>You have been signed out</h2>
    <p>You can close this window.</p>
  </div>
</body></html>`);
    }
  );
}

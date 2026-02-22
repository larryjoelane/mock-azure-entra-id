import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { loginPage } from "../templates/login";

interface AuthorizeQuery {
  client_id: string;
  response_type: string;
  redirect_uri: string;
  scope: string;
  state: string;
  nonce: string;
  code_challenge: string;
  code_challenge_method: string;
  response_mode?: string;
  prompt?: string;
}

interface LoginBody {
  username: string;
  password: string;
  client_id: string;
  redirect_uri: string;
  state: string;
  nonce: string;
  code_challenge: string;
  code_challenge_method: string;
  scope: string;
  response_mode: string;
}

export async function authorizeRoutes(fastify: FastifyInstance) {
  const baseUrl = fastify.config.issuer.replace(/\/v2\.0$/, "");

  // GET /oauth2/v2.0/authorize — render login form
  fastify.get(
    "/oauth2/v2.0/authorize",
    async (request: FastifyRequest<{ Querystring: AuthorizeQuery }>, reply: FastifyReply) => {
      const q = request.query;

      const html = loginPage({
        clientId: q.client_id || "",
        redirectUri: q.redirect_uri || "",
        state: q.state || "",
        nonce: q.nonce || "",
        codeChallenge: q.code_challenge || "",
        codeChallengeMethod: q.code_challenge_method || "S256",
        scope: q.scope || "openid profile email",
        responseMode: q.response_mode || "fragment",
        actionUrl: `${baseUrl}/oauth2/v2.0/authorize`,
      });

      return reply.type("text/html").send(html);
    }
  );

  // POST /oauth2/v2.0/authorize — process login form
  fastify.post(
    "/oauth2/v2.0/authorize",
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      const body = request.body;
      const { username, password } = body;

      // Find user
      const user = fastify.config.users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        const html = loginPage({
          clientId: body.client_id,
          redirectUri: body.redirect_uri,
          state: body.state,
          nonce: body.nonce,
          codeChallenge: body.code_challenge,
          codeChallengeMethod: body.code_challenge_method,
          scope: body.scope,
          responseMode: body.response_mode || "fragment",
          error: "Invalid username or password.",
          actionUrl: `${baseUrl}/oauth2/v2.0/authorize`,
        });
        return reply.status(200).type("text/html").send(html);
      }

      // Generate authorization code
      const code = fastify.authCodeStore.generateCode();

      fastify.authCodeStore.save({
        code,
        clientId: body.client_id,
        redirectUri: body.redirect_uri,
        codeChallenge: body.code_challenge,
        codeChallengeMethod: body.code_challenge_method || "S256",
        nonce: body.nonce,
        state: body.state,
        scope: body.scope,
        userId: user.username,
        createdAt: Date.now(),
      });

      // Build redirect URL
      const redirectUri = body.redirect_uri;
      const responseMode = body.response_mode || "fragment";
      const params = `code=${encodeURIComponent(code)}&state=${encodeURIComponent(body.state)}`;

      let redirectUrl: string;
      if (responseMode === "fragment") {
        redirectUrl = `${redirectUri}#${params}`;
      } else {
        const separator = redirectUri.includes("?") ? "&" : "?";
        redirectUrl = `${redirectUri}${separator}${params}`;
      }

      return reply.redirect(redirectUrl);
    }
  );
}

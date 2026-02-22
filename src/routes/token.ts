import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { validatePkce } from "../services/pkce";
import { buildIdToken, buildAccessToken } from "../services/token-builder";

interface TokenBody {
  grant_type: string;
  code: string;
  code_verifier: string;
  client_id: string;
  redirect_uri: string;
  scope?: string;
}

export async function tokenRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/oauth2/v2.0/token",
    async (request: FastifyRequest<{ Body: TokenBody }>, reply: FastifyReply) => {
      const body = request.body;

      if (body.grant_type !== "authorization_code") {
        return reply.status(400).send({
          error: "unsupported_grant_type",
          error_description: "Only authorization_code grant type is supported.",
        });
      }

      // Consume the authorization code (one-time use)
      const entry = fastify.authCodeStore.consume(body.code);
      if (!entry) {
        return reply.status(400).send({
          error: "invalid_grant",
          error_description: "Authorization code is invalid or expired.",
        });
      }

      // Validate client_id
      if (body.client_id !== entry.clientId) {
        return reply.status(400).send({
          error: "invalid_grant",
          error_description: "client_id does not match.",
        });
      }

      // Validate redirect_uri
      if (body.redirect_uri !== entry.redirectUri) {
        return reply.status(400).send({
          error: "invalid_grant",
          error_description: "redirect_uri does not match.",
        });
      }

      // Validate PKCE
      if (entry.codeChallenge) {
        if (!body.code_verifier) {
          return reply.status(400).send({
            error: "invalid_grant",
            error_description: "code_verifier is required.",
          });
        }

        const pkceValid = validatePkce(
          body.code_verifier,
          entry.codeChallenge,
          entry.codeChallengeMethod
        );

        if (!pkceValid) {
          return reply.status(400).send({
            error: "invalid_grant",
            error_description: "PKCE validation failed.",
          });
        }
      }

      // Find user
      const user = fastify.config.users.find((u) => u.username === entry.userId);
      if (!user) {
        return reply.status(400).send({
          error: "invalid_grant",
          error_description: "User not found.",
        });
      }

      const scope = body.scope || entry.scope || "openid profile email";

      // Build tokens
      const [idToken, accessToken] = await Promise.all([
        buildIdToken(fastify.keySet, fastify.config, user, entry.nonce, entry.clientId),
        buildAccessToken(fastify.keySet, fastify.config, user, scope, entry.clientId),
      ]);

      return reply.send({
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: fastify.config.tokenLifetimeSeconds,
        scope,
        id_token: idToken,
      });
    }
  );
}

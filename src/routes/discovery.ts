import type { FastifyInstance } from "fastify";

export async function discoveryRoutes(fastify: FastifyInstance) {
  const config = fastify.config;
  const baseUrl = config.issuer.replace(/\/v2\.0$/, "");

  fastify.get("/.well-known/openid-configuration", async (_request, reply) => {
    return reply.send({
      issuer: config.issuer,
      authorization_endpoint: `${baseUrl}/oauth2/v2.0/authorize`,
      token_endpoint: `${baseUrl}/oauth2/v2.0/token`,
      token_endpoint_auth_methods_supported: ["none"],
      jwks_uri: `${baseUrl}/discovery/v2.0/keys`,
      userinfo_endpoint: `${baseUrl}/oidc/userinfo`,
      end_session_endpoint: `${baseUrl}/oauth2/v2.0/logout`,
      response_modes_supported: ["query", "fragment", "form_post"],
      response_types_supported: ["code", "id_token", "code id_token"],
      scopes_supported: ["openid", "profile", "email", "offline_access"],
      subject_types_supported: ["pairwise"],
      id_token_signing_alg_values_supported: ["RS256"],
      claims_supported: [
        "sub",
        "iss",
        "aud",
        "exp",
        "iat",
        "nonce",
        "name",
        "preferred_username",
        "email",
        "oid",
        "tid",
        "roles",
        "ver",
      ],
    });
  });

  // MSAL.js also fetches {authority}/v2.0/.well-known/openid-configuration
  // When this plugin is registered under /{tenantId}, this handles
  // /{tenantId}/v2.0/.well-known/openid-configuration
  fastify.get("/v2.0/.well-known/openid-configuration", async (_request, reply) => {
    return reply.redirect("/.well-known/openid-configuration");
  });
}

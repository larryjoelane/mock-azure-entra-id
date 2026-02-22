import "fastify";
import type { MockIdpConfig } from "../config";
import type { KeySet } from "../crypto/keys";
import type { AuthCodeStore } from "../services/auth-code-store";

declare module "fastify" {
  interface FastifyInstance {
    config: MockIdpConfig;
    keySet: KeySet;
    authCodeStore: AuthCodeStore;
  }
}

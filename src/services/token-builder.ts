import { SignJWT } from "jose";
import type { KeySet } from "../crypto/keys";
import type { MockIdpConfig, MockUser } from "../config";

export async function buildIdToken(
  keySet: KeySet,
  config: MockIdpConfig,
  user: MockUser,
  nonce: string,
  clientId: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    ver: "2.0",
    iss: config.issuer,
    sub: user.oid,
    aud: clientId,
    nonce,
    name: user.name,
    preferred_username: user.email,
    email: user.email,
    oid: user.oid,
    tid: config.tenantId,
    roles: user.roles,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: keySet.kid })
    .setIssuedAt(now)
    .setNotBefore(now)
    .setExpirationTime(now + config.tokenLifetimeSeconds)
    .sign(keySet.privateKey);
}

export async function buildAccessToken(
  keySet: KeySet,
  config: MockIdpConfig,
  user: MockUser,
  scope: string,
  clientId: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    iss: config.issuer,
    sub: user.oid,
    aud: clientId,
    scp: scope,
    name: user.name,
    preferred_username: user.email,
    email: user.email,
    oid: user.oid,
    tid: config.tenantId,
    roles: user.roles,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: keySet.kid })
    .setIssuedAt(now)
    .setNotBefore(now)
    .setExpirationTime(now + config.tokenLifetimeSeconds)
    .sign(keySet.privateKey);
}

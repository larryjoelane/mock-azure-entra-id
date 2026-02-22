import { generateKeyPair, exportJWK, calculateJwkThumbprint } from "jose";
import type { JWK } from "jose";

// jose v6 returns CryptoKey; we keep the type generic to avoid platform-specific type issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SigningKey = any;

export interface KeySet {
  privateKey: SigningKey;
  publicKey: SigningKey;
  publicJwk: JWK;
  kid: string;
}

export async function createKeySet(): Promise<KeySet> {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  const kid = await calculateJwkThumbprint(publicJwk, "sha256");
  publicJwk.kid = kid;
  publicJwk.alg = "RS256";
  publicJwk.use = "sig";
  return { privateKey, publicKey, publicJwk, kid };
}

import { createHash } from "crypto";

export function validatePkce(
  codeVerifier: string,
  codeChallenge: string,
  method: string
): boolean {
  if (method !== "S256") return false;
  const hash = createHash("sha256").update(codeVerifier).digest();
  const computed = hash.toString("base64url");
  return computed === codeChallenge;
}

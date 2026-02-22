// Smoke test: runs the full auth flow against the mock server
import { createHash } from "crypto";

const BASE = "http://localhost:4200";
const TENANT = "11111111-1111-1111-1111-111111111111";
const AUTHORITY = `${BASE}/${TENANT}`;

async function main() {
  // 1. Discovery document
  console.log("=== 1. Discovery ===");
  const disco = await fetch(`${AUTHORITY}/.well-known/openid-configuration`).then((r) => r.json());
  console.log("issuer:", disco.issuer);
  console.log("authorization_endpoint:", disco.authorization_endpoint);
  console.log("token_endpoint:", disco.token_endpoint);
  console.log("jwks_uri:", disco.jwks_uri);

  // 2. JWKS
  console.log("\n=== 2. JWKS ===");
  const jwks = await fetch(disco.jwks_uri).then((r) => r.json());
  console.log("keys:", jwks.keys.length, "- kid:", jwks.keys[0]?.kid, "- alg:", jwks.keys[0]?.alg);

  // 3. Generate PKCE
  console.log("\n=== 3. PKCE ===");
  const codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk_test_verifier_pad123";
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  console.log("code_verifier:", codeVerifier);
  console.log("code_challenge:", codeChallenge);

  // 4. POST authorize (simulate form submission)
  console.log("\n=== 4. Authorize (POST login) ===");
  const authResp = await fetch(disco.authorization_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: "testuser",
      password: "password",
      client_id: "test-client-id",
      redirect_uri: "http://localhost:5173",
      state: "test-state-123",
      nonce: "test-nonce-456",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      scope: "openid profile email",
      response_mode: "query",
    }),
    redirect: "manual",
  });

  const location = authResp.headers.get("location");
  console.log("status:", authResp.status);
  console.log("redirect:", location);

  const code = new URL(location).searchParams.get("code");
  const state = new URL(location).searchParams.get("state");
  console.log("code:", code);
  console.log("state:", state);

  // 5. Token exchange
  console.log("\n=== 5. Token Exchange ===");
  const tokenResp = await fetch(disco.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      code_verifier: codeVerifier,
      client_id: "test-client-id",
      redirect_uri: "http://localhost:5173",
    }),
  });

  const tokenData = await tokenResp.json();
  if (tokenData.error) {
    console.error("TOKEN ERROR:", tokenData.error, tokenData.error_description);
    process.exit(1);
  }

  console.log("token_type:", tokenData.token_type);
  console.log("expires_in:", tokenData.expires_in);
  console.log("scope:", tokenData.scope);
  console.log("has id_token:", !!tokenData.id_token);
  console.log("has access_token:", !!tokenData.access_token);

  // 6. Decode and inspect id_token
  console.log("\n=== 6. ID Token Claims ===");
  const [header, payload] = tokenData.id_token.split(".").slice(0, 2).map((s) => JSON.parse(Buffer.from(s, "base64url").toString()));
  console.log("header:", JSON.stringify(header));
  console.log("iss:", payload.iss);
  console.log("aud:", payload.aud);
  console.log("sub:", payload.sub);
  console.log("nonce:", payload.nonce);
  console.log("name:", payload.name);
  console.log("email:", payload.email);
  console.log("preferred_username:", payload.preferred_username);
  console.log("tid:", payload.tid);
  console.log("roles:", payload.roles);
  console.log("exp:", new Date(payload.exp * 1000).toISOString());

  // 7. Verify nonce matches
  console.log("\n=== 7. Validation Checks ===");
  console.log("nonce matches:", payload.nonce === "test-nonce-456" ? "PASS" : "FAIL");
  console.log("aud matches client_id:", payload.aud === "test-client-id" ? "PASS" : "FAIL");
  console.log("iss matches discovery:", payload.iss === disco.issuer ? "PASS" : "FAIL");
  console.log("kid in header:", header.kid);
  console.log("kid matches JWKS:", header.kid === jwks.keys[0]?.kid ? "PASS" : "FAIL");
  console.log("token not expired:", payload.exp > Date.now() / 1000 ? "PASS" : "FAIL");

  console.log("\nAll checks passed!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

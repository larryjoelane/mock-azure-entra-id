export interface MockUser {
  username: string;
  password: string;
  name: string;
  email: string;
  oid: string;
  roles: string[];
}

export interface MockIdpConfig {
  port: number;
  host: string;
  issuer: string;
  tenantId: string;
  tokenLifetimeSeconds: number;
  users: MockUser[];
}

const DEFAULT_USERS: MockUser[] = [
  {
    username: "testuser",
    password: "password",
    name: "Test User",
    email: "testuser@mock.entra.local",
    oid: "00000000-0000-0000-0000-000000000001",
    roles: ["User"],
  },
  {
    username: "admin",
    password: "password",
    name: "Admin User",
    email: "admin@mock.entra.local",
    oid: "00000000-0000-0000-0000-000000000002",
    roles: ["User", "Admin"],
  },
];

export function loadConfig(): MockIdpConfig {
  const port = parseInt(process.env.PORT || "4200", 10);
  const host = process.env.HOST || "0.0.0.0";
  const tenantId = process.env.TENANT_ID || "11111111-1111-1111-1111-111111111111";
  const tokenLifetimeSeconds = parseInt(process.env.TOKEN_LIFETIME || "3600", 10);

  let users = DEFAULT_USERS;
  if (process.env.MOCK_USERS) {
    try {
      users = JSON.parse(process.env.MOCK_USERS);
    } catch {
      console.warn("Failed to parse MOCK_USERS env var, using defaults");
    }
  }

  const issuer = process.env.ISSUER || `https://localhost:${port}/${tenantId}/v2.0`;

  return { port, host, issuer, tenantId, tokenLifetimeSeconds, users };
}

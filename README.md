# Mock Azure Entra ID

A lightweight mock identity provider that mimics Azure Entra ID (formerly Azure AD) for local development and testing of MSAL.js applications. This mock server provides OAuth 2.0 and OpenID Connect endpoints compatible with MSAL.js authentication flows.

## Features

- ✅ OAuth 2.0 Authorization Code Flow with PKCE
- ✅ OpenID Connect Discovery
- ✅ JWKS endpoint with RSA key rotation
- ✅ ID tokens and access tokens (JWT)
- ✅ Configurable users and roles
- ✅ HTTPS support (required by MSAL.js)
- ✅ React example application included

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- OpenSSL (for generating SSL certificates)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

If you want to run the included React example app:

```bash
cd react-app-example
npm install
cd ..
```

### 2. Generate SSL Certificates

MSAL.js requires HTTPS for the authority URL. Generate self-signed certificates for local development:

```bash
# Create certs directory if it doesn't exist
mkdir certs

# Generate self-signed certificate (valid for 365 days)
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"
```

> **Note:** You'll need to trust this certificate in your browser or accept the security warning when first accessing the mock server.

### 3. Run the Mock Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The mock Azure Entra ID server will start at **https://localhost:4200**

### 4. Run with React Example App

To run both the mock server and the React example app together:

```bash
npm run react-example
```

This will start:
- Mock Azure Entra ID server: **https://localhost:4200**
- React example app: **http://localhost:5173**

## Configuration

Configuration can be set via environment variables. Create a `.env` file in the root directory:

```env
PORT=4200
HOST=0.0.0.0
TENANT_ID=11111111-1111-1111-1111-111111111111
TOKEN_LIFETIME=3600
```

### Available Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4200` | Port to run the mock server on |
| `HOST` | `0.0.0.0` | Host to bind to |
| `TENANT_ID` | `11111111-1111-1111-1111-111111111111` | Mock tenant ID |
| `TOKEN_LIFETIME` | `3600` | Token lifetime in seconds |
| `ISSUER` | `https://localhost:{PORT}/{TENANT_ID}/v2.0` | Token issuer URL |
| `MOCK_USERS` | See below | JSON string of custom user definitions |

## Default Users

Two test users are available by default:

| Username | Password | Name | Email | Roles |
|----------|----------|------|-------|-------|
| `testuser` | `password` | Test User | testuser@mock.entra.local | User |
| `admin` | `password` | Admin User | admin@mock.entra.local | User, Admin |

### Custom Users

You can define custom users via the `MOCK_USERS` environment variable:

```json
MOCK_USERS='[{"username":"john","password":"pass123","name":"John Doe","email":"john@example.com","oid":"00000000-0000-0000-0000-000000000003","roles":["User"]}]'
```

## API Endpoints

### OpenID Connect Discovery

```
GET /.well-known/openid-configuration
GET /{tenantId}/.well-known/openid-configuration
GET /{tenantId}/v2.0/.well-known/openid-configuration
```

### Authorization

```
GET /{tenantId}/oauth2/v2.0/authorize
```

### Token

```
POST /{tenantId}/oauth2/v2.0/token
```

### JWKS (JSON Web Key Set)

```
GET /{tenantId}/discovery/v2.0/keys
```

### Logout

```
GET /{tenantId}/oauth2/v2.0/logout
```

### Health Check

```
GET /health
```

## Using with MSAL.js

Configure your MSAL.js application to use the mock server:

```typescript
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "mock-client-id", // Can be any string
    authority: "https://localhost:4200/11111111-1111-1111-1111-111111111111",
    redirectUri: "http://localhost:5173", // Your app URL
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);
```

See the `react-app-example` folder for a complete working example.

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run typecheck` - Run TypeScript type checking
- `npm run react-example` - Run mock server and React example app together

### Project Structure

```
mock-azure-entra-id/
├── certs/              # SSL certificates (generated)
├── src/
│   ├── config.ts       # Configuration loader
│   ├── server.ts       # Main server setup
│   ├── crypto/
│   │   └── keys.ts     # RSA key generation
│   ├── routes/
│   │   ├── authorize.ts    # Authorization endpoint
│   │   ├── discovery.ts    # OIDC discovery endpoint
│   │   ├── jwks.ts         # JWKS endpoint
│   │   ├── logout.ts       # Logout endpoint
│   │   └── token.ts        # Token endpoint
│   ├── services/
│   │   ├── auth-code-store.ts  # Authorization code storage
│   │   ├── pkce.ts             # PKCE validation
│   │   └── token-builder.ts    # JWT token creation
│   ├── templates/
│   │   └── login.ts        # Login page HTML
│   └── types/
│       └── index.ts        # TypeScript type definitions
├── react-app-example/  # Example React app with MSAL.js
└── tests/              # Test files
```

## Security Notes

⚠️ **This is a mock server for development and testing only. DO NOT use in production.**

- Uses self-signed certificates
- Stores authorization codes in memory
- No real authentication security
- Default passwords are well-known
- No rate limiting or security hardening

## Troubleshooting

### Certificate Errors

If you see certificate errors in your browser:
- Click "Advanced" and "Proceed to localhost (unsafe)" or
- Add the certificate to your system's trusted certificates

### Port Already in Use

If port 4200 is already in use, either:
- Stop the process using that port
- Change the `PORT` environment variable to use a different port

### MSAL.js Errors

Make sure:
- You're using HTTPS for the authority URL (https://localhost:4200)
- The redirect URI in your MSAL config matches your app's URL
- You've accepted the self-signed certificate in your browser

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

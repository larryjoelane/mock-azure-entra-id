import { useState, useEffect, useCallback } from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
  useAccount,
  useIsAuthenticated,
} from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest } from "./authConfig";
import "./App.css";

function TokenDisplay({ token, label }: { token: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const parts = token.split(".");

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let header = "";
  let payload = "";
  try {
    header = JSON.stringify(JSON.parse(atob(parts[0])), null, 2);
    payload = JSON.stringify(JSON.parse(atob(parts[1])), null, 2);
  } catch {
    // token may not be decodable
  }

  return (
    <div className="token-section">
      <div className="token-header">
        <h3>{label}</h3>
        <span className="token-format">
          {parts.length === 3 ? "JWS Compact (3 segments)" : `${parts.length} segments`}
        </span>
        <button onClick={handleCopy} className="copy-btn">
          {copied ? "Copied!" : "Copy for jwt.io"}
        </button>
      </div>
      <div className="token-raw">{token}</div>
      {header && (
        <details>
          <summary>Decoded Header</summary>
          <pre>{header}</pre>
        </details>
      )}
      {payload && (
        <details>
          <summary>Decoded Payload</summary>
          <pre>{payload}</pre>
        </details>
      )}
    </div>
  );
}

function UserProfile() {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] ?? {});
  const isAuthenticated = useIsAuthenticated();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const acquireToken = useCallback(async () => {
    if (!account) return;
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      setAccessToken(response.accessToken);
      setIdToken(response.idToken);
      setTokenError(null);
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        instance.acquireTokenRedirect(loginRequest);
      } else {
        setTokenError(String(error));
      }
    }
  }, [instance, account]);

  // Auto-acquire tokens on mount
  useEffect(() => {
    acquireToken();
  }, [acquireToken]);

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  if (!account) return null;

  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>Signed In</h2>
        <span className="auth-badge">{isAuthenticated ? "Authenticated" : "Not Authenticated"}</span>
      </div>

      <table>
        <tbody>
          <tr>
            <td><strong>Name</strong></td>
            <td>{account.name}</td>
          </tr>
          <tr>
            <td><strong>Username</strong></td>
            <td>{account.username}</td>
          </tr>
          <tr>
            <td><strong>Tenant ID</strong></td>
            <td>{account.tenantId}</td>
          </tr>
        </tbody>
      </table>

      {tokenError && <div className="token-error">{tokenError}</div>}

      {idToken && <TokenDisplay token={idToken} label="ID Token (JWT)" />}
      {accessToken && <TokenDisplay token={accessToken} label="Access Token (JWT)" />}

      <div className="token-actions">
        <button onClick={acquireToken} className="acquire-btn">
          Refresh Tokens
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </div>
    </div>
  );
}

function LoginPrompt() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="login-card">
      <h1>Example React App</h1>
      <p>This app uses <code>@azure/msal-react</code> with the Mock Azure Entra ID server.</p>
      <p className="hint">
        Default credentials: <code>testuser</code> / <code>password</code>
      </p>
      <button onClick={handleLogin} data-testid="sign-in" className="login-btn">
        Sign In
      </button>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <UnauthenticatedTemplate>
        <LoginPrompt />
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <UserProfile />
      </AuthenticatedTemplate>
    </div>
  );
}

export default App;

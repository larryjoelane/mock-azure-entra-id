export interface LoginPageParams {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  responseMode: string;
  error?: string;
  actionUrl: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function loginPage(params: LoginPageParams): string {
  const errorHtml = params.error
    ? `<div class="error">${escapeHtml(params.error)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in - Mock Entra ID</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f2f2f2;
    }
    .card {
      background: white;
      border-radius: 4px;
      padding: 44px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      width: 440px;
      max-width: 90vw;
    }
    .logo {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 15px;
      color: #666;
      margin-bottom: 24px;
    }
    label {
      display: block;
      font-size: 13px;
      color: #333;
      margin-bottom: 4px;
    }
    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #666;
      border-radius: 2px;
      font-size: 14px;
      margin-bottom: 16px;
      outline: none;
    }
    input[type="text"]:focus,
    input[type="password"]:focus {
      border-color: #0078d4;
    }
    button[type="submit"] {
      width: 100%;
      padding: 10px;
      background: #0078d4;
      color: white;
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
    }
    button[type="submit"]:hover {
      background: #006cbe;
    }
    .error {
      background: #fde7e9;
      color: #a80000;
      padding: 10px 12px;
      border-radius: 2px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .mock-badge {
      margin-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Mock Entra ID</div>
    <div class="subtitle">Sign in to your account</div>
    ${errorHtml}
    <form method="POST" action="${escapeHtml(params.actionUrl)}">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" data-testid="username" placeholder="testuser" autocomplete="username" required autofocus />

      <label for="password">Password</label>
      <input type="password" id="password" name="password" data-testid="password" placeholder="password" autocomplete="current-password" required />

      <input type="hidden" name="client_id" value="${escapeHtml(params.clientId)}" />
      <input type="hidden" name="redirect_uri" value="${escapeHtml(params.redirectUri)}" />
      <input type="hidden" name="state" value="${escapeHtml(params.state)}" />
      <input type="hidden" name="nonce" value="${escapeHtml(params.nonce)}" />
      <input type="hidden" name="code_challenge" value="${escapeHtml(params.codeChallenge)}" />
      <input type="hidden" name="code_challenge_method" value="${escapeHtml(params.codeChallengeMethod)}" />
      <input type="hidden" name="scope" value="${escapeHtml(params.scope)}" />
      <input type="hidden" name="response_mode" value="${escapeHtml(params.responseMode)}" />

      <button type="submit" data-testid="submit">Sign in</button>
    </form>
    <div class="mock-badge">Mock identity provider for testing</div>
  </div>
</body>
</html>`;
}

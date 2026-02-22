import type { Configuration } from "@azure/msal-browser";
import { LogLevel } from "@azure/msal-browser";

const TENANT_ID = "11111111-1111-1111-1111-111111111111";
const CLIENT_ID = "test-client-id";
const AUTHORITY = `https://localhost:4200/${TENANT_ID}`;

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: AUTHORITY,
    knownAuthorities: ["localhost:4200"],
    protocolMode: "OIDC",
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
        }
      },
      logLevel: LogLevel.Verbose,
    },
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

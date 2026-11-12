import { Auth0Client } from "@auth0/nextjs-auth0/server";

const PLACEHOLDER = /YOUR_|use \[openssl/i;
const need = ["AUTH0_SECRET", "AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET", "APP_BASE_URL"] as const;

/** False until real credentials are in .env.local — the app then runs in demo mode instead of crashing. */
export const isAuth0Configured = need.every((k) => {
  const v = process.env[k];
  return !!v && !PLACEHOLDER.test(v);
});

export const auth0 = isAuth0Configured
  ? new Auth0Client({
      authorizationParameters: {
        scope: process.env.AUTH0_SCOPE || "openid profile email offline_access",
        ...(process.env.AUTH0_AUDIENCE ? { audience: process.env.AUTH0_AUDIENCE } : {}),
      },
      enableAccessTokenEndpoint: true,
    })
  : null;

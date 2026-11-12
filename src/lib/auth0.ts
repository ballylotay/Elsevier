import { NextResponse } from "next/server";
import { Auth0Client } from "@auth0/nextjs-auth0/server";

const PLACEHOLDER = /YOUR_|use \[openssl/i;
const need = ["AUTH0_SECRET", "AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET", "APP_BASE_URL"] as const;

/** False until real credentials are in .env.local — the app then runs in demo mode instead of crashing. */
export const isAuth0Configured = need.every((k) => {
  const v = process.env[k];
  return !!v && !PLACEHOLDER.test(v);
});

export const APP_SCOPE = process.env.AUTH0_SCOPE || "openid profile email offline_access launch:course";

export const auth0 = isAuth0Configured
  ? new Auth0Client({
      authorizationParameters: {
        scope: APP_SCOPE,
        ...(process.env.AUTH0_AUDIENCE ? { audience: process.env.AUTH0_AUDIENCE } : {}),
      },
      enableAccessTokenEndpoint: true,
      // If the IDP refuses a course-access scope step-up (e.g. consent denied), land on the inspector with a message instead of a bare 500.
      async onCallback(error, ctx) {
        const base = ctx.appBaseUrl ?? process.env.APP_BASE_URL ?? "";
        if (error) {
          if (ctx.returnTo?.startsWith("/api/course-access")) {
            const url = new URL("/inspector", base);
            url.searchParams.set("launch_error", `Sign-in was cancelled or denied by the identity provider, so the "launch:course" scope was not granted (${error.message}).`);
            return NextResponse.redirect(url);
          }
          return new NextResponse(error.message, { status: 500 });
        }
        return NextResponse.redirect(new URL(ctx.returnTo || "/", base));
      },
    })
  : null;

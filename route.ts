import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export const dynamic = "force-dynamic";

/** POST: force a silent refresh-token exchange and report the new token metadata. */
export async function POST() {
  if (!auth0) {
    return NextResponse.json({ demo: true, ok: true, message: "Demo mode: no Auth0 credentials configured, simulated refresh." });
  }
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  if (!session.tokenSet.refreshToken) {
    return NextResponse.json({ ok: false, error: "No refresh token in session. Enable offline_access + Allow Offline Access on the API." }, { status: 400 });
  }
  try {
    const { token, expiresAt } = await auth0.getAccessToken({ refresh: true });
    return NextResponse.json({ ok: true, accessToken: token, expiresAt, refreshedAt: Math.floor(Date.now() / 1000) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Refresh failed" }, { status: 502 });
  }
}

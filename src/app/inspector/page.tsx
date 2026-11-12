import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { auth0, isAuth0Configured } from "@/lib/auth0";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Inspector, type InspectorData } from "@/components/inspector";
import { buttonClass } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const DEMO_USER = {
  sub: "auth0|demo-student-001",
  name: "Alex Rivera",
  email: "alex.rivera@metro.edu",
  email_verified: true,
  picture: "",
  updated_at: new Date().toISOString(),
};

export default async function InspectorPage() {
  let data: InspectorData;

  if (auth0) {
    const session = await auth0.getSession();
    if (!session) redirect("/auth/login?returnTo=/inspector");
    const t = session.tokenSet;
    data = {
      demo: false,
      user: session.user as Record<string, unknown>,
      idToken: t.idToken ?? null,
      accessToken: t.accessToken ?? null,
      refreshToken: t.refreshToken ?? null,
      scope: t.scope ?? process.env.AUTH0_SCOPE ?? null,
      audience: t.audience ?? process.env.AUTH0_AUDIENCE ?? null,
      expiresAt: t.expiresAt ?? null,
    };
  } else {
    data = { demo: true, user: DEMO_USER, idToken: null, accessToken: null, refreshToken: null, scope: "openid profile email offline_access", audience: null, expiresAt: null };
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Identity, Profile &amp; Token Inspector</h1>
          <p className="text-slate-500">Everything Auth0 issued for this session, for demo purposes only.</p>
        </div>
      </div>
      {data.demo && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900"><AlertTriangle className="h-4 w-4" />Demo mode: Auth0 not configured</CardTitle>
            <CardDescription className="text-amber-800">
              Copy <code>.env.local.example</code> to <code>.env.local</code>, fill in real values and restart. Showing a sample profile; tokens are unavailable.
            </CardDescription>
          </CardHeader>
          <CardContent><a href="/" className={buttonClass("outline", "sm")}>Back to home</a></CardContent>
        </Card>
      )}
      <Inspector data={data} />
    </main>
  );
}

import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { auth0, isAuth0Configured } from "@/lib/auth0";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Inspector, type InspectorData } from "@/components/inspector";
import { buttonClass } from "@/components/ui/button";
import type { CourseExchange } from "@/lib/course-access";

export const dynamic = "force-dynamic";

const DEMO_USER = {
  sub: "auth0|demo-student-001",
  name: "Alex Rivera",
  email: "alex.rivera@metro.edu",
  email_verified: true,
  picture: "",
  updated_at: new Date().toISOString(),
};

export default async function InspectorPage({ searchParams }: { searchParams: Promise<{ launch_error?: string }> }) {
  const { launch_error: launchError } = await searchParams;
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
      courseExchange: (session.courseExchange as CourseExchange | undefined) ?? null,
    };
  } else {
    data = { demo: true, user: DEMO_USER, idToken: null, accessToken: null, refreshToken: null, scope: "openid profile email offline_access", audience: null, expiresAt: null, courseExchange: null };
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Identity, Profile &amp; Token Inspector</h1>
          <p className="text-slate-500">Everything Auth0 issued for this session, for demo purposes only.</p>
        </div>
      </div>
      {launchError && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900"><AlertTriangle className="h-4 w-4" />Course access denied</CardTitle>
            <CardDescription className="text-red-800">{launchError}</CardDescription>
          </CardHeader>
        </Card>
      )}
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

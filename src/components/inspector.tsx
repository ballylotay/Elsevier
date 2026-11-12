"use client";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, ChevronDown, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock, CopyButton, JsonBlock } from "@/components/code-block";
import { decodeJwt } from "@/lib/jwt";
import { LtiFlow } from "@/components/lti-flow";
import type { CourseExchange } from "@/lib/course-access";

export type InspectorData = {
  demo: boolean;
  user: Record<string, unknown>;
  idToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  scope: string | null;
  audience: string | null;
  expiresAt: number | null;
  courseExchange: CourseExchange | null;
};

const NS = "https://elsevier.com/";
const LABELS: Record<string, string> = {
  [`${NS}lms_platform`]: "LMS Platform",
  [`${NS}institution_id`]: "Institution ID",
  [`${NS}lti_roles`]: "LTI Roles",
  [`${NS}course_context`]: "Course Context",
};

function fmt(v: unknown) {
  return typeof v === "string" ? v : JSON.stringify(v);
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{k}</dt>
      <dd className="break-all text-sm text-slate-900">{children}</dd>
    </div>
  );
}

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Math.floor(Date.now() / 1000));
    const i = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(i);
  }, []);
  return now;
}

function Countdown({ exp }: { exp: number | null }) {
  const now = useNow();
  if (!exp || now === null) return <Badge variant="secondary"><Clock className="h-3 w-3" />No expiry info</Badge>;
  const left = exp - now;
  if (left <= 0) return <Badge variant="destructive"><Clock className="h-3 w-3" />Expired</Badge>;
  const m = Math.floor(left / 60), s = left % 60;
  return <Badge variant={left < 60 ? "warning" : "success"}><Clock className="h-3 w-3" />Expires in {m}m {String(s).padStart(2, "0")}s</Badge>;
}

function JwtView({ token, highlight }: { token: string; highlight: string[] }) {
  const d = useMemo(() => decodeJwt(token), [token]);
  const [raw, setRaw] = useState(true);
  if (!d.isJwt) return null;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-slate-200 p-0.5 text-xs">
          {[true, false].map((r) => (
            <button key={String(r)} onClick={() => setRaw(r)} className={`rounded px-3 py-1 font-medium ${raw === r ? "bg-slate-900 text-white" : "text-slate-600"}`}>
              {r ? "Raw" : "Decoded"}
            </button>
          ))}
        </div>
        <CopyButton text={token} label="Copy token" />
        <a href={`https://jwt.io/#id_token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer"
           className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium hover:bg-slate-100">
          <ExternalLink className="h-3.5 w-3.5" />Decode on jwt.io
        </a>
      </div>
      {raw ? (
        <div className="break-all rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed">
          <span className="text-rose-400">{d.parts![0]}</span>.<span className="text-violet-400">{d.parts![1]}</span>.<span className="text-sky-400">{d.parts![2]}</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div><div className="mb-1 text-xs font-semibold text-rose-600">HEADER</div><JsonBlock value={d.header} /></div>
          <div><div className="mb-1 text-xs font-semibold text-violet-600">PAYLOAD</div><JsonBlock value={d.payload} highlight={highlight} /></div>
        </div>
      )}
    </div>
  );
}

function Missing({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">{children}</div>;
}

export function Inspector({ data }: { data: InspectorData }) {
  const [showUser, setShowUser] = useState(false);
  const [accessToken, setAccessToken] = useState(data.accessToken);
  const [expiresAt, setExpiresAt] = useState(data.expiresAt);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<{ ok: boolean; text: string } | null>(null);

  const { user } = data;
  const idPayload = useMemo(() => decodeJwt(data.idToken).payload, [data.idToken]);
  const accessDecoded = useMemo(() => decodeJwt(accessToken), [accessToken]);
  const scopes = (data.scope ?? "").split(/\s+/).filter(Boolean);
  const hasOffline = scopes.includes("offline_access");

  // Access-token claims win: they change with each course launch.
  const tokenClaims = Object.fromEntries(Object.entries({ ...(idPayload ?? {}), ...user, ...(accessDecoded.payload ?? {}) }).filter(([k]) => k.startsWith(NS)));
  const claims = tokenClaims;
  const customKeys = Object.keys(tokenClaims);
  const hasClaims = Object.keys(claims).length > 0;

  async function testRefresh() {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const r = await fetch("/api/token-details", { method: "POST" });
      const j = await r.json();
      if (j.ok) {
        if (j.accessToken) setAccessToken(j.accessToken);
        if (j.expiresAt) setExpiresAt(j.expiresAt);
        setRefreshResult({ ok: true, text: j.message ?? `Refreshed at ${new Date().toLocaleTimeString()}. New access token issued.` });
      } else setRefreshResult({ ok: false, text: j.error ?? "Refresh failed" });
    } catch (e) {
      setRefreshResult({ ok: false, text: e instanceof Error ? e.message : "Request failed" });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Left column */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>User Profile</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {user.picture ? <img src={String(user.picture)} alt="" className="h-14 w-14 rounded-full border border-slate-200" />
                : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">{String(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}</div>}
              <div>
                <div className="font-semibold">{fmt(user.name ?? "—")}</div>
                <div className="text-sm text-slate-500">{fmt(user.email ?? "—")}</div>
              </div>
            </div>
            <dl>
              <Row k="Email verified">
                {user.email_verified ? <Badge variant="success"><CheckCircle2 className="h-3 w-3" />Verified</Badge> : <Badge variant="warning"><XCircle className="h-3 w-3" />Not verified</Badge>}
              </Row>
              <Row k="User ID (sub)"><span className="font-mono text-xs">{fmt(user.sub ?? "—")}</span></Row>
              <Row k="Updated at">{fmt(user.updated_at ?? "—")}</Row>
            </dl>
            <button onClick={() => setShowUser((s) => !s)} className="mt-3 flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
              <ChevronDown className={`h-4 w-4 transition ${showUser ? "rotate-180" : ""}`} />Raw user JSON
            </button>
            {showUser && <div className="mt-2"><JsonBlock value={user} /></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LTI 1.3 &amp; LMS Context</CardTitle>
            <CardDescription>Custom claims Auth0 adds to the access and ID tokens for the course you launched.</CardDescription>
          </CardHeader>
          <CardContent>
            {hasClaims ? (
              <dl>
                {Object.entries(claims).map(([k, v]) => (
                  <Row key={k} k={LABELS[k] ?? k}>
                    <span className="font-mono text-xs">{fmt(v)}</span>{" "}
                    <Badge variant="success">from token</Badge>
                  </Row>
                ))}
              </dl>
            ) : (
              <Missing>
                No <code>https://elsevier.com/*</code> claims in this token yet. Click a course on the home page to launch it with its LTI context.
              </Missing>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column */}
      <Card>
        <CardHeader><CardTitle>Token Inspector</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue={data.courseExchange ? "exchange" : "id"}>
            <TabsList>
              <TabsTrigger value="id">ID Token</TabsTrigger>
              <TabsTrigger value="access">Access Token</TabsTrigger>
              <TabsTrigger value="refresh">Refresh Token</TabsTrigger>
              <TabsTrigger value="exchange">Course Token Exchange</TabsTrigger>
              <TabsTrigger value="flow">LTI 1.3 → Auth0</TabsTrigger>
            </TabsList>

            <TabsContent value="id" className="space-y-3">
              {data.idToken ? (
                <>
                  {idPayload && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {["iss", "sub", "aud", "exp", "iat", "org_id"].filter((k) => k in idPayload).map((k) => (
                        <Badge key={k} variant="outline" className="max-w-full font-mono"><b>{k}</b>:&nbsp;<span className="truncate">{k === "exp" || k === "iat" ? new Date(Number(idPayload[k]) * 1000).toLocaleString("en-US", { timeZone: "UTC", hour12: false }) + " UTC" : fmt(idPayload[k])}</span></Badge>
                      ))}
                    </div>
                  )}
                  <JwtView token={data.idToken} highlight={["iss", "sub", "aud", "exp", "iat", "org_id", ...customKeys]} />
                </>
              ) : <Missing>{data.demo ? "Demo mode: configure Auth0 to see a real ID token." : "No ID token in session."}</Missing>}
            </TabsContent>

            <TabsContent value="access" className="space-y-3">
              {accessToken ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Countdown exp={expiresAt} />
                    {data.audience && <Badge variant="outline" className="font-mono">aud: {data.audience}</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {scopes.map((s) => <Badge key={s} variant="secondary" className="font-mono">{s}</Badge>)}
                  </div>
                  {accessDecoded.isJwt ? (
                    <>
                      {customKeys.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {Object.entries(tokenClaims).map(([k, v]) => (
                            <Badge key={k} variant="accent" className="max-w-full font-mono"><b>{LABELS[k] ?? k}</b>:&nbsp;<span className="truncate">{fmt(v)}</span></Badge>
                          ))}
                        </div>
                      )}
                      <JwtView token={accessToken} highlight={["iss", "sub", "aud", "exp", "iat", "scope", "azp", ...customKeys]} />
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                        <b>Opaque access token.</b> Auth0 returns a JWT only when an <code>audience</code> (API) is requested; without it the token is opaque and only valid for <code>/userinfo</code>. Set <code>AUTH0_AUDIENCE</code> to receive a JWT.
                      </div>
                      <CodeBlock code={accessToken} />
                    </>
                  )}
                </>
              ) : <Missing>{data.demo ? "Demo mode: configure Auth0 to see a real access token." : "No access token in session."}</Missing>}
            </TabsContent>

            <TabsContent value="refresh" className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">offline_access scope:</span>
                {hasOffline ? <Badge variant="success"><CheckCircle2 className="h-3 w-3" />Active</Badge> : <Badge variant="destructive"><XCircle className="h-3 w-3" />Not granted</Badge>}
              </div>
              {data.refreshToken ? (
                <CodeBlock code={data.refreshToken} />
              ) : (
                <Missing>
                  No refresh token. Ensure <code>offline_access</code> is requested and, if using an API audience, enable <b>Allow Offline Access</b> on that API in the Auth0 Dashboard.
                </Missing>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="accent" onClick={testRefresh} disabled={refreshing || (!data.demo && !data.refreshToken)}>
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Test Token Refresh
                </Button>
                {refreshResult && (
                  <span className={`text-sm ${refreshResult.ok ? "text-emerald-700" : "text-red-700"}`}>{refreshResult.text}</span>
                )}
              </div>
              <p className="text-xs text-slate-500">Calls <code>POST /api/token-details</code>, which performs a server-side refresh_token grant and updates the Access Token tab.</p>
            </TabsContent>

            <TabsContent value="exchange" className="space-y-6">
              {data.courseExchange ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="success"><CheckCircle2 className="h-3 w-3" />Exchanged for {data.courseExchange.courseCode || "course"}</Badge>
                    <Countdown exp={data.courseExchange.expiresAt} />
                    <Badge variant="outline" className="font-mono">aud: {data.courseExchange.audience}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">1. Original access token <span className="font-normal text-slate-500">(issued to this app, sent as the subject_token)</span></div>
                    {accessToken ? (accessDecoded.isJwt ? <JwtView token={accessToken} highlight={["iss", "sub", "aud", "exp", "scope", ...customKeys]} /> : <CodeBlock code={accessToken} />) : <Missing>No access token in session.</Missing>}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-semibold">2. Exchanged third-party token <span className="font-normal text-slate-500">(issued by the course provider&rsquo;s IDP)</span></div>
                    {data.courseExchange.scope && (
                      <div className="flex flex-wrap gap-1.5">
                        {data.courseExchange.scope.split(/\s+/).filter(Boolean).map((s) => <Badge key={s} variant="secondary" className="font-mono">{s}</Badge>)}
                      </div>
                    )}
                    {decodeJwt(data.courseExchange.accessToken).isJwt
                      ? <JwtView token={data.courseExchange.accessToken} highlight={["iss", "sub", "aud", "exp", "iat", "scope", "azp"]} />
                      : <CodeBlock code={data.courseExchange.accessToken} />}
                  </div>
                </>
              ) : (
                <Missing>No course token exchange yet. Click <b>Access Course Material</b> on a course on the home page.</Missing>
              )}
            </TabsContent>

            <TabsContent value="flow"><LtiFlow /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export const REQUIRED_SCOPE = "launch:course";
/** Accepted claim names (Auth0 Actions require namespaced custom claims, so the namespaced form is the usual one). */
export const LICENCE_CLAIMS = ["course_licence", "elsevier"];

export type CourseExchange = {
  courseCode: string;
  accessToken: string;
  tokenType: string | null;
  scope: string | null;
  audience: string;
  expiresAt: number | null;
  exchangedAt: number;
};

/** Thrown for expected, user-presentable failures; `status` is the HTTP status that best describes it. */
export class CourseAccessError extends Error {
  constructor(message: string, public status: number, public code?: "missing_scope") {
    super(message);
  }
}

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new CourseAccessError(`Server misconfigured: ${name} is not set.`, 500);
  return v;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

/**
 * Validates the app's access token (signature, issuer, audience, expiry), then checks it carries the
 * `launch:course` scope and the `course_licence:elsevier` custom claim.
 */
export async function validateAppAccessToken(token: string): Promise<JWTPayload> {
  const domain = env("AUTH0_DOMAIN");
  const audience = env("AUTH0_AUDIENCE");
  jwks ??= createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`));

  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, jwks, { issuer: `https://${domain}/`, audience }));
  } catch (e) {
    throw new CourseAccessError(`Access token is not valid: ${e instanceof Error ? e.message : "verification failed"}`, 401);
  }

  const scopes = typeof payload.scope === "string" ? payload.scope.split(/\s+/) : [];
  if (!scopes.includes(REQUIRED_SCOPE)) {
    throw new CourseAccessError(`Access token is missing the required "${REQUIRED_SCOPE}" scope.`, 403, "missing_scope");
  }
  if (!LICENCE_CLAIMS.some((c) => payload[c])) {
    throw new CourseAccessError(`Access token is missing the "course_licence:elsevier" claim, so your institution has no licence for this content.`, 403);
  }
  return payload;
}

/** RFC 8693 token exchange against the second (simulated third-party) Auth0 tenant. */
export async function exchangeForPartnerToken(subjectToken: string, courseCode: string): Promise<CourseExchange> {
  const domain = env("PARTNER_AUTH0_DOMAIN");
  const audience = env("PARTNER_AUTH0_AUDIENCE");
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    subject_token: subjectToken,
    subject_token_type: env("PARTNER_SUBJECT_TOKEN_TYPE"),
    client_id: env("PARTNER_AUTH0_CLIENT_ID"),
    client_secret: env("PARTNER_AUTH0_CLIENT_SECRET"),
    audience,
    course_code: courseCode
  });
  if (process.env.PARTNER_AUTH0_SCOPE) body.set("scope", process.env.PARTNER_AUTH0_SCOPE);

  let res: Response;
  try {
    res = await fetch(`https://${domain}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
  } catch {
    throw new CourseAccessError("Could not reach the course provider's token endpoint.", 502);
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    const detail = json.error_description ?? json.error ?? `HTTP ${res.status}`;
    if (["access_denied", "invalid_scope", "unauthorized_client"].includes(json.error)) {
      throw new CourseAccessError(`The course provider denied access to this course material: ${detail}`, 403);
    }
    throw new CourseAccessError(`Course provider rejected the token exchange: ${detail}`, 502);
  }
  const now = Math.floor(Date.now() / 1000);
  return {
    courseCode,
    accessToken: json.access_token,
    tokenType: json.token_type ?? null,
    scope: json.scope ?? null,
    audience,
    expiresAt: typeof json.expires_in === "number" ? now + json.expires_in : null,
    exchangedAt: now,
  };
}

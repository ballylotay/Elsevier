import { NextResponse, type NextRequest } from "next/server";
import { APP_SCOPE, auth0 } from "@/lib/auth0";
import { CourseAccessError, REQUIRED_SCOPE, exchangeForPartnerToken, validateAppAccessToken } from "@/lib/course-access";

export const dynamic = "force-dynamic";

/**
 * "Access Course Material": validates the user's access token (launch:course scope + course_licence claim),
 * exchanges it at the course provider's Auth0 tenant, stores the result in the session and lands on the inspector.
 */
export async function GET(req: NextRequest) {
  const back = (error?: string) => {
    const url = new URL("/inspector", req.url);
    if (error) url.searchParams.set("launch_error", error);
    return NextResponse.redirect(url);
  };

  if (!auth0) return back("Auth0 is not configured, so the token exchange cannot run in demo mode.");

  const session = await auth0.getSession();
  if (!session) {
    const login = new URL("/auth/login", req.url);
    login.searchParams.set("returnTo", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  const courseCode = req.nextUrl.searchParams.get("course_code") ?? "";
  try {
    const { token } = await auth0.getAccessToken();
    await validateAppAccessToken(token);
    const exchange = await exchangeForPartnerToken(token, courseCode);
    await auth0.updateSession({ ...session, courseExchange: exchange });
    return back();
  } catch (e) {
    if (e instanceof CourseAccessError && e.code === "missing_scope") {
      // Ask the IDP for the scope once. If it comes back without it, the IDP has refused: stop rather than loop.
      if (req.nextUrl.searchParams.has("scope_requested")) {
        return back(`The identity provider did not grant the "${REQUIRED_SCOPE}" scope to your account, so course material can't be launched. Contact your institution's administrator to request access.`);
      }
      const retry = new URL(req.nextUrl.pathname + req.nextUrl.search, req.url);
      retry.searchParams.set("scope_requested", "1");
      const login = new URL("/auth/login", req.url);
      login.searchParams.set("returnTo", retry.pathname + retry.search);
      login.searchParams.set("scope", [...new Set([...APP_SCOPE.split(/\s+/), REQUIRED_SCOPE])].join(" "));
      return NextResponse.redirect(login);
    }
    if (e instanceof CourseAccessError) return back(e.message);
    return back(e instanceof Error ? e.message : "Course launch failed.");
  }
}

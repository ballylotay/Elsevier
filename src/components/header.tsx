import Link from "next/link";
import { GraduationCap, LogOut, ScanSearch } from "lucide-react";
import { auth0, isAuth0Configured } from "@/lib/auth0";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";

export async function Header() {
  const session = auth0 ? await auth0.getSession() : null;
  const user = session?.user;
  const institution =
    (user?.["https://elsevier.com/lms_platform"] as string | undefined) ??
    (user?.org_name as string | undefined);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-orange-500">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-slate-900">Elsevier CampusHub</span>
              <span className="block text-[11px] text-slate-500">Metropolitan University Digital Library</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
            <Link href="/#catalog" className="rounded-md px-3 py-2 hover:bg-slate-100">Course Catalog</Link>
            <Link href="/#lms" className="rounded-md px-3 py-2 hover:bg-slate-100">My LMS Courses</Link>
            <Link href="/inspector" className="rounded-md px-3 py-2 hover:bg-slate-100">Token &amp; Profile Inspector</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!isAuth0Configured && <Badge variant="warning" className="hidden lg:inline-flex">Demo mode</Badge>}
          {user ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {user.picture && <img src={user.picture} alt="" className="h-8 w-8 rounded-full border border-slate-200" />}
              <div className="hidden text-right leading-tight sm:block">
                <div className="text-sm font-medium">{user.name ?? user.email}</div>
                <Badge variant="accent">{institution ?? "Direct Login"}</Badge>
              </div>
              <Link href="/inspector" className={buttonClass("outline", "sm")}><ScanSearch className="h-4 w-4" />Identity Inspector</Link>
              {/* Plain anchor: logout must be a full navigation, not client-side routing */}
              <a href="/auth/logout" className={buttonClass("ghost", "sm")}><LogOut className="h-4 w-4" />Log Out</a>
            </>
          ) : (
            <>
              <a href="/auth/login" className={buttonClass("accent", "sm")}>Sign in via LMS</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import { ArrowDown, BookOpen, KeyRound, LogIn, Network, Sparkles } from "lucide-react";

const STEPS = [
  { icon: BookOpen, title: "1. Student clicks Elsevier link in Canvas / Moodle / Blackboard", body: "The LMS (LTI platform) renders the external tool link inside the course." },
  { icon: Network, title: "2. LTI 1.3 OIDC third-party initiated login", body: "The LMS calls Elsevier's initiate-login URL with iss, login_hint and lti_message_hint, then redirects to Auth0." },
  { icon: LogIn, title: "3. Auth0 Universal Login / Enterprise Connection", body: "Auth0 validates the launch, authenticates the user (or reuses the LMS identity) and runs Post-Login Actions to map LTI claims." },
  { icon: KeyRound, title: "4. Tokens issued", body: "Auth0 returns the authorization code; the SDK exchanges it for ID, access and refresh tokens." },
  { icon: Sparkles, title: "5. Elsevier Next.js app receives enriched JWT", body: "Claims such as lms_platform, institution_id, lti_roles and course_context drive licensing and content access." },
];

export function LtiFlow() {
  return (
    <ol className="space-y-2">
      {STEPS.map(({ icon: Icon, title, body }, i) => (
        <li key={title}>
          <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${i === STEPS.length - 1 ? "bg-orange-600 text-white" : "bg-slate-900 text-white"}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="text-sm text-slate-500">{body}</div>
            </div>
          </div>
          {i < STEPS.length - 1 && <ArrowDown className="mx-auto my-1 h-4 w-4 text-slate-400" />}
        </li>
      ))}
    </ol>
  );
}

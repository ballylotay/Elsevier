import { BookOpen, FlaskConical, HeartPulse, Pill, Stethoscope, Microscope, ShieldCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COURSES = [
  { code: "MED-301", title: "Gray's Anatomy for Students", sub: "Human anatomy, 5th ed.", lms: "Canvas LTI", icon: Stethoscope },
  { code: "PHAR-412", title: "Clinical Pharmacology 12e", sub: "Drug mechanisms & therapeutics", lms: "Moodle LTI", icon: Pill },
  { code: "CHEM-220", title: "Organic Chemistry Lab Simulation", sub: "Virtual lab & reaction modelling", lms: "Blackboard LTI", icon: FlaskConical },
  { code: "NURS-340", title: "Medical-Surgical Nursing", sub: "Clinical judgement & patient care", lms: "Canvas LTI", icon: HeartPulse },
  { code: "BIO-204", title: "Advanced Physiology", sub: "Systems physiology with case studies", lms: "Moodle LTI", icon: Microscope },
  { code: "MED-355", title: "Pathology: Robbins Basic Pathology", sub: "Mechanisms of disease", lms: "Blackboard LTI", icon: BookOpen },
];

const LMS = ["Canvas", "Moodle", "Blackboard"];

export default async function Home() {

  return (
    <main>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <Badge variant="accent" className="mb-4">Academic year 2026–27</Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Your institution&rsquo;s medical &amp; scientific library, <span className="text-orange-500">one click away.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Welcome students and faculty. Access licensed Elsevier textbooks, simulations and clinical references,
            directly or from inside your course in your LMS.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/auth/login" className={buttonClass("accent", "lg")}>Sign in via LMS <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      <section id="lms" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-700"><ShieldCheck className="h-4 w-4 text-emerald-600" />Connected via Auth0 OIDC / LTI 1.3 Bridge</span>
          {LMS.map((n) => (
            <span key={n} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />{n}
            </span>
          ))}
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight">Course &amp; Digital Textbook Catalog</h2>
        <p className="mt-1 text-slate-500">Licensed through your university subscription.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map(({ code, title, sub, lms, icon: Icon }) => (
            <Card key={code} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><Icon className="h-5 w-5" /></span>
                  <Badge variant="outline" className="font-mono">{code}</Badge>
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{sub}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">Licensed via University</Badge>
                  <Badge variant="secondary">{lms}</Badge>
                </div>
                <a href={`/auth/login?returnTo=/inspector&course_code=${code}`} className={buttonClass("default", "md", "w-full")}>Access Course Material</a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

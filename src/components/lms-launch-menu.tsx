"use client";
import * as D from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Rocket } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

const LMS = [
  { id: "canvas", label: "Canvas (Instructure)" },
  { id: "moodle", label: "Moodle" },
  { id: "blackboard", label: "Blackboard Learn" },
];

/** Simulates an LTI launch by passing LMS hints to Universal Login (visible to Auth0 Actions via the authorize request). */
export function LmsLaunchMenu({ variant = "outline" as "outline" | "ghost", size = "sm" as "sm" | "lg" }) {
  return (
    <D.Root>
      <D.Trigger className={buttonClass(variant, size)}>
        <Rocket className="h-4 w-4" />Simulate LMS Launch<ChevronDown className="h-3.5 w-3.5" />
      </D.Trigger>
      <D.Portal>
        <D.Content align="end" sideOffset={6} className="z-50 min-w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          <D.Label className="px-2 py-1.5 text-xs text-slate-500">LTI 1.3 third-party initiated login</D.Label>
          {LMS.map((l) => (
            <D.Item key={l.id} asChild>
              <a
                href={`/auth/login?lms_platform=${l.id}&returnTo=/inspector`}
                className="block cursor-pointer rounded-md px-2 py-2 text-sm outline-none data-[highlighted]:bg-slate-100"
              >
                {l.label}
              </a>
            </D.Item>
          ))}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

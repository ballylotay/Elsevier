import * as React from "react";
import { cn } from "@/lib/utils";

const v = {
  default: "bg-slate-900 text-white",
  secondary: "bg-slate-100 text-slate-700",
  accent: "bg-orange-100 text-orange-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  destructive: "bg-red-100 text-red-700",
  outline: "border border-slate-200 text-slate-700",
};
export const Badge = ({ className, variant = "secondary", ...p }: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof v }) => (
  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", v[variant], className)} {...p} />
);

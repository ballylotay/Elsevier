import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-slate-900 text-white hover:bg-slate-800",
  accent: "bg-orange-600 text-white hover:bg-orange-700",
  outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
  ghost: "hover:bg-slate-100 text-slate-700",
};
const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4 text-sm", lg: "h-11 px-6 text-base" };

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function buttonClass(variant: keyof typeof variants = "default", size: keyof typeof sizes = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 disabled:pointer-events-none",
    variants[variant], sizes[size], extra,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...p }, ref) => <button ref={ref} className={buttonClass(variant, size, className)} {...p} />,
);
Button.displayName = "Button";

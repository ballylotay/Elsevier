"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
    >
      {ok ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {ok ? "Copied" : label}
    </button>
  );
}

export function CodeBlock({ code, className, copy = true }: { code: string; className?: string; copy?: boolean }) {
  return (
    <div className={cn("relative rounded-lg border border-slate-200 bg-slate-950", className)}>
      {copy && (
        <div className="absolute right-2 top-2">
          <CopyButton text={code} />
        </div>
      )}
      <pre className="max-h-96 overflow-auto p-4 pr-24 font-mono text-xs leading-relaxed text-slate-100 whitespace-pre-wrap break-all">{code}</pre>
    </div>
  );
}

export function JsonBlock({ value, highlight = [] }: { value: unknown; highlight?: string[] }) {
  const json = JSON.stringify(value, null, 2) ?? "null";
  return (
    <div className="relative rounded-lg border border-slate-200 bg-slate-950">
      <div className="absolute right-2 top-2"><CopyButton text={json} /></div>
      <pre className="max-h-96 overflow-auto p-4 pr-24 font-mono text-xs leading-relaxed text-slate-100">
        {json.split("\n").map((line, i) => {
          const key = line.match(/^\s*"([^"]+)":/)?.[1];
          const hit = key && highlight.includes(key);
          return (
            <div key={i} className={hit ? "-mx-4 bg-orange-500/20 px-4 text-orange-200" : undefined}>{line}</div>
          );
        })}
      </pre>
    </div>
  );
}

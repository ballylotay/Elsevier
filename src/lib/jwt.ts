export type Decoded = {
  isJwt: boolean;
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  parts?: [string, string, string];
};

function b64urlJson(s: string): Record<string, unknown> | undefined {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const v = JSON.parse(new TextDecoder().decode(bytes));
    return v && typeof v === "object" ? v : undefined;
  } catch {
    return undefined;
  }
}

/** Safely decode a JWT; never throws (opaque tokens return isJwt: false). */
export function decodeJwt(token?: string | null): Decoded {
  if (!token) return { isJwt: false };
  const p = token.split(".");
  if (p.length !== 3) return { isJwt: false };
  const header = b64urlJson(p[0]);
  const payload = b64urlJson(p[1]);
  if (!header || !payload) return { isJwt: false };
  return { isJwt: true, header, payload, parts: [p[0], p[1], p[2]] };
}

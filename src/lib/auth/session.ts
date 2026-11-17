export const SESSION_COOKIE = "lunie_admin_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

export type SessionPayload = {
  email: string;
  exp: number;
};

function sessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.SESSION_PASSWORD?.trim();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET não configurado.");
  }
  return secret;
}

export function adminEmail(): string {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error("ADMIN_EMAIL não configurado.");
  }
  return email;
}

function adminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error("ADMIN_PASSWORD não configurado.");
  }
  return password;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < view.length; i += 1) {
    binary += String.fromCharCode(view[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function encodePayload(payload: SessionPayload): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const raw = fromBase64Url(encoded);
    const parsed = JSON.parse(raw) as SessionPayload;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number" ||
      !Number.isFinite(parsed.exp)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

function textEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  return bytesEqual(left, right);
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return toBase64Url(signature);
}

export function verifyCredentials(email: string, password: string): boolean {
  return (
    textEqual(email.trim().toLowerCase(), adminEmail()) &&
    textEqual(password, adminPassword())
  );
}

export async function createSessionToken(
  email: string,
  now = Date.now(),
): Promise<string> {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    exp: now + SESSION_TTL_MS,
  };
  const body = encodePayload(payload);
  return `${body}.${await sign(body)}`;
}

export async function readSessionToken(
  token: string | undefined | null,
  now = Date.now(),
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = await sign(body);
  if (!textEqual(expected, signature)) return null;
  const payload = decodePayload(body);
  if (!payload) return null;
  if (payload.exp <= now) return null;
  if (!textEqual(payload.email, adminEmail())) return null;
  return payload;
}

export function sessionCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

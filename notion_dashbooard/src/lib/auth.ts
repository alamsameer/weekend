import { createHash, timingSafeEqual } from "crypto";

export const AUTH_COOKIE = "dash_auth";

export function authTokenFromPassword(password: string): string {
  return createHash("sha256")
    .update(`notion-dash-auth:${password}`)
    .digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

export function getDashboardPassword(): string | null {
  const value = process.env.DASHBOARD_PASSWORD?.trim();
  return value ? value : null;
}

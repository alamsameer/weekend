import { NextRequest, NextResponse } from "next/server";

export const AUTH_COOKIE = "dash_auth";

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function expectedToken(password: string): Promise<string> {
  return sha256Hex(`notion-dash-auth:${password}`);
}

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const password = process.env.DASHBOARD_PASSWORD?.trim();
  if (!password) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "DASHBOARD_PASSWORD is not set in environment." },
        { status: 503 },
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "missing_password");
    return NextResponse.redirect(url);
  }

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  const expected = await expectedToken(password);
  const ok = !!cookie && cookie === expected;

  if (ok) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

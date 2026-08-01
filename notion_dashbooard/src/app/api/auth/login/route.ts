import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  authTokenFromPassword,
  getDashboardPassword,
  safeEqual,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const password = getDashboardPassword();
    if (!password) {
      return NextResponse.json(
        { error: "DASHBOARD_PASSWORD is not set in .env.local" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const input = typeof body.password === "string" ? body.password : "";
    if (!input || !safeEqual(input, password)) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    // Session cookie: cleared when the browser is closed
    res.cookies.set(AUTH_COOKIE, authTokenFromPassword(password), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

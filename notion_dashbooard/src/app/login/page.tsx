"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const missingEnv = searchParams.get("error") === "missing_password";
  const nextPath = useMemo(() => {
    const n = searchParams.get("next");
    return n && n.startsWith("/") ? n : "/";
  }, [searchParams]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Wrong password");
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="panel w-full max-w-sm p-6"
      >
        <h1 className="text-xl font-semibold tracking-tight">Notion Dash</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Enter the dashboard password to continue
        </p>

        {missingEnv ? (
          <p className="mt-4 text-sm" style={{ color: "var(--pill-red-text)" }}>
            Set <code>DASHBOARD_PASSWORD</code> in <code>.env.local</code> and
            restart the server.
          </p>
        ) : null}

        <label
          className="mt-5 block text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Password
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            disabled={busy || missingEnv}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none disabled:opacity-50"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          />
        </label>

        {error ? (
          <p className="mt-3 text-sm" style={{ color: "var(--pill-red-text)" }}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || missingEnv || !password}
          className="mt-4 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {busy ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm" style={{ color: "var(--text-muted)" }}>
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

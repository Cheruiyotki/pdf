"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { saveSession, type SessionUser } from "@/lib/auth";

type AuthResponse = {
  token: string;
  user: SessionUser;
};

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@quickconvert.app");
  const [password, setPassword] = useState("demo12345");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiFetch<AuthResponse>(mode === "login" ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password })
      });

      saveSession(response.token, response.user);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8">
      <div className="flex gap-3">
        <button className={`rounded-2xl px-4 py-3 text-sm font-semibold ${mode === "login" ? "bg-ink text-white" : "bg-cream text-ink"}`} onClick={() => setMode("login")}>
          Login
        </button>
        <button className={`rounded-2xl px-4 py-3 text-sm font-semibold ${mode === "register" ? "bg-ink text-white" : "bg-cream text-ink"}`} onClick={() => setMode("register")}>
          Register
        </button>
      </div>
      <div className="mt-6 grid gap-4">
        {mode === "register" ? (
          <input className="min-h-12 rounded-2xl border border-ink/10 px-4" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        ) : null}
        <input className="min-h-12 rounded-2xl border border-ink/10 px-4" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input
          className="min-h-12 rounded-2xl border border-ink/10 px-4"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button onClick={submit} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <p className="text-sm text-ink/60">Demo account: `demo@quickconvert.app` / `demo12345` after seeding.</p>
        {message ? <p className="text-sm text-coral">{message}</p> : null}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSession, getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setUserName(getSessionUser()?.name ?? null);
    sync();
    window.addEventListener("quickconvert-auth-change", sync);
    return () => window.removeEventListener("quickconvert-auth-change", sync);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-bold text-ink">
          QuickConvert
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-ink/80 md:flex">
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-2">
          {userName ? (
            <>
              <span className="hidden text-sm text-ink/70 sm:inline">{userName}</span>
              <Button variant="ghost" onClick={() => clearSession()}>
                Log out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="secondary">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

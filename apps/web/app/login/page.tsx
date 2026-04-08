import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="page-shell grid gap-8 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2.5rem] bg-ink px-6 py-10 text-white shadow-card sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">JWT auth</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Sign in for dashboards, premium mode, and billing.</h1>
        <p className="mt-4 max-w-xl text-white/75">QuickConvert uses JWT-based authentication for free and premium users. Sign in to view quotas, manage billing, and access fast-mode upload queues.</p>
      </section>
      <LoginForm />
    </div>
  );
}

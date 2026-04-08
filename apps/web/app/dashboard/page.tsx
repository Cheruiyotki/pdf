import { DashboardClient } from "@/components/dashboard-client";

export default function DashboardPage() {
  return (
    <div className="page-shell pb-20 pt-10">
      <section className="mb-8 rounded-[2.5rem] bg-ink px-6 py-10 text-white shadow-card sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Usage dashboard</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Track jobs, quota, and output.</h1>
        <p className="mt-3 max-w-2xl text-white/75">Logged-in users can see conversions completed, storage output generated, and remaining free quota before the next upgrade nudge.</p>
      </section>
      <DashboardClient />
    </div>
  );
}

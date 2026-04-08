import { PricingCards } from "@/components/pricing-cards";

export default function PricingPage() {
  return (
    <div className="page-shell pb-20 pt-10">
      <section className="mb-8 rounded-[2.5rem] bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">Subscription plans</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">Scale from a free queue to premium fast mode.</h1>
        <p className="mt-4 max-w-3xl text-base text-ink/70">Free users get a generous starting point. Premium removes daily limits, expands file sizes, increases batch counts, and prioritizes your jobs in the queue.</p>
      </section>
      <PricingCards />
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { tools } from "@quickconvert/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/components/pricing-cards";
import { SupportPanel } from "@/components/tool/support-panel";

export default function HomePage() {
  return (
    <div className="pb-20">
      <section className="page-shell pt-10 sm:pt-14 lg:pt-20">
        <div className="overflow-hidden rounded-[2.5rem] bg-hero-grid bg-ink px-6 py-10 text-white shadow-card sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <Badge className="bg-white/10 text-gold">Instant file conversion for every screen size</Badge>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                QuickConvert turns messy file chores into a 2-step flow.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-white/75 sm:text-lg">
                Drag, drop, convert, and move on. QuickConvert supports PDF and image tools, premium fast queues, temporary storage, and mobile-first controls that stay easy to use on small screens.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/pdf-to-word">
                  <Button variant="secondary">Start with PDF to Word</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" className="border border-white/15 text-white hover:bg-white/10">
                    See premium plans
                  </Button>
                </Link>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <TrustCard icon={<Zap className="h-5 w-5" />} title="<3s small-file response target" />
                <TrustCard icon={<ShieldCheck className="h-5 w-5" />} title="Auto-delete after 30 minutes" />
                <TrustCard icon={<ArrowRight className="h-5 w-5" />} title="Smart next-step suggestions" />
              </div>
            </div>
            <div className="grid gap-4 rounded-[2rem] bg-white/10 p-4 backdrop-blur">
              {[
                "Free: 3 conversions/day, 10MB max, 3 files/batch",
                "Premium: unlimited conversions, 200MB max, 20 files/batch",
                "Fast mode routes premium jobs to a higher-priority queue",
                "GDPR-friendly temporary handling with no long-term file storage"
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] bg-white/10 px-4 py-4 text-sm text-white/85">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell mt-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge>All core tools included</Badge>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Dedicated landing page for every conversion tool</h2>
          </div>
          <p className="max-w-xl text-sm text-ink/70">Each tool has its own SEO-ready URL, focused metadata, structured data, and a conversion-first layout optimized for touch and desktop alike.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.slug} href={`/${tool.slug}`} className="rounded-[2rem] bg-white p-6 shadow-card transition hover:-translate-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">{tool.category}</p>
              <h3 className="mt-3 font-display text-2xl font-bold text-ink">{tool.shortTitle}</h3>
              <p className="mt-3 text-sm text-ink/70">{tool.description}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-coral">
                Open tool <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell mt-14 grid gap-6 lg:grid-cols-3">
        <FeatureCard title="Parallel processing" text="Independent files are processed concurrently to keep batch jobs moving, especially for premium customers." />
        <FeatureCard title="Clear upgrade moments" text="Upsell after successful conversions and whenever free limits are reached, with messaging tied directly to the current workflow." />
        <FeatureCard title="In-app support and bug reporting" text="Every tool can open support, live chat, or bug reports without leaving the page." />
      </section>

      <section className="page-shell mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Badge>Pricing</Badge>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Built for free users, tuned for premium speed</h2>
          </div>
        </div>
        <PricingCards />
      </section>

      <section className="page-shell mt-16">
        <SupportPanel />
      </section>
    </div>
  );
}

function TrustCard({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="rounded-[1.5rem] bg-white/10 p-4 text-sm text-white/85">
      <div className="mb-3 text-gold">{icon}</div>
      {title}
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-card">
      <p className="font-display text-2xl font-bold text-ink">{title}</p>
      <p className="mt-3 text-sm text-ink/70">{text}</p>
    </div>
  );
}

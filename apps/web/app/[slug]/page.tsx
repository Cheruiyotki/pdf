import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { toolMap, toolSlugs } from "@quickconvert/shared";
import { ConverterWorkbench } from "@/components/tool/converter-workbench";
import { BugReportButton } from "@/components/tool/bug-report-button";
import { SupportPanel } from "@/components/tool/support-panel";
import { StructuredData } from "@/components/structured-data";
import { buildToolJsonLd } from "@/lib/seo";

type ToolPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return toolSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = params;
  const tool = toolMap[slug];

  if (!tool) {
    return {};
  }

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.keywords
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = params;
  const tool = toolMap[slug];

  if (!tool) {
    notFound();
  }

  return (
    <div className="page-shell pb-20 pt-10">
      <StructuredData data={buildToolJsonLd(slug)} />
      <section className="rounded-[2.5rem] bg-white/70 p-6 shadow-card backdrop-blur sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">{tool.category} tool</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">{tool.title}</h1>
        <p className="mt-4 max-w-3xl text-base text-ink/70">{tool.hero}</p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {tool.steps.map((step, index) => (
            <div key={step} className="rounded-[1.75rem] bg-cream p-4 text-sm text-ink">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Step {index + 1}</p>
              <p className="mt-2">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <ConverterWorkbench tool={tool} />
      </section>

      <section className="mt-8">
        <BugReportButton toolSlug={tool.slug} />
      </section>

      <section className="mt-8">
        <SupportPanel toolSlug={tool.slug} />
      </section>
    </div>
  );
}

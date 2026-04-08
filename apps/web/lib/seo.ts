import { toolMap } from "@quickconvert/shared";

export function buildToolJsonLd(slug: string) {
  const tool = toolMap[slug];
  if (!tool) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    applicationCategory: "BusinessApplication",
    description: tool.description,
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };
}

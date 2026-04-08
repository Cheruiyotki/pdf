const guides = [
  {
    title: "Best workflow for PDF to Word",
    text: "Upload a text-based PDF first for the highest fidelity, then use Compress PDF or Merge PDF for the next step."
  },
  {
    title: "How to use batch processing",
    text: "Free users can queue 2-3 files comfortably, while premium users can process larger batches with fast mode enabled."
  },
  {
    title: "Keeping image uploads small",
    text: "Resize images before compressing them when you need a stronger size reduction for websites, forms, or email."
  }
];

export default function GuidesPage() {
  return (
    <div className="page-shell pb-20 pt-10">
      <section className="rounded-[2.5rem] bg-ink p-6 text-white shadow-card sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Guides</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Simple paths for first-time users</h1>
        <p className="mt-4 max-w-2xl text-white/75">These starter guides keep every conversion down to 2 or 3 steps so the app stays quick on mobile and desktop.</p>
      </section>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {guides.map((guide) => (
          <article key={guide.title} className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="font-display text-2xl font-bold text-ink">{guide.title}</h2>
            <p className="mt-3 text-sm text-ink/70">{guide.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

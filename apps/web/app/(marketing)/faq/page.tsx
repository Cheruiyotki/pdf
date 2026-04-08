const faqs = [
  {
    question: "Do you store my files?",
    answer: "Files are processed in temporary storage and auto-deleted after the configured TTL, which is 30 minutes in this scaffold."
  },
  {
    question: "How do free limits work?",
    answer: "Free users can run 3 successful conversions per day, upload up to 10MB total per request, and batch up to 3 files."
  },
  {
    question: "What does premium unlock?",
    answer: "Premium enables fast mode, larger uploads, batch processing up to 20 files, and unlimited conversions."
  },
  {
    question: "How is QuickConvert monitored?",
    answer: "Sentry hooks are configured for both frontend and backend, and batch failures are recorded in the job system."
  }
];

export default function FaqPage() {
  return (
    <div className="page-shell pb-20 pt-10">
      <section className="rounded-[2.5rem] bg-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">FAQ</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">Answers for new users and teams</h1>
        <div className="mt-8 grid gap-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-[1.75rem] bg-cream p-5">
              <h2 className="text-lg font-semibold text-ink">{faq.question}</h2>
              <p className="mt-3 text-sm text-ink/70">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

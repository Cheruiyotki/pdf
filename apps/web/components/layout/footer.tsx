import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-ink/70 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-lg font-bold text-ink">QuickConvert</p>
          <p className="mt-2 max-w-sm">Responsive file conversion with temporary storage, fast queues, and clear upgrade paths.</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Tools</p>
          <div className="mt-3 space-y-2">
            <Link className="block" href="/pdf-to-word">PDF to Word</Link>
            <Link className="block" href="/compress-pdf">Compress PDF</Link>
            <Link className="block" href="/image-resize">Image Resize</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-ink">Support</p>
          <div className="mt-3 space-y-2">
            <Link className="block" href="/faq">FAQ</Link>
            <Link className="block" href="/guides">Guides</Link>
            <a className="block" href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@quickconvert.app"}`}>Email support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

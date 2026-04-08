import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <h1 className="font-display text-5xl font-bold text-ink">Page not found</h1>
      <p className="max-w-xl text-sm text-ink/70">This route doesn’t map to a QuickConvert tool or content page yet.</p>
      <Link href="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import "./globals.css";

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "QuickConvert | Fast PDF and Image Tools",
  description: "Convert PDFs and images with responsive upload flows, temporary storage, and premium fast queues.",
  openGraph: {
    title: "QuickConvert",
    description: "Fast PDF and image tools with secure temporary processing.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickConvert",
    description: "Fast PDF and image tools with secure temporary processing."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="font-sans text-ink antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

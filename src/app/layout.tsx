import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Cup Eleven | FIFA World Cup 2026™ Fan Portal",
  description: "Experience the FIFA World Cup 2026 across USA, Mexico, and Canada. Track matches, standings, stats, venues, and make predictions.",
  keywords: ["FIFA", "World Cup 2026", "Football", "Soccer", "Schedule", "Standings", "Predictor", "USA", "Canada", "Mexico"],
  icons: {
    icon: '/images/trophy.png',
    shortcut: '/images/trophy.png',
    apple: '/images/trophy.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-100 bg-slate-950">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}


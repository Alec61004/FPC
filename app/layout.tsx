import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deltrol Controls | Deviation Knowledge Hub",
  description: "Internal engineering tool for deviation management",
};

function Logo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="grid h-10 w-10 place-items-center rounded bg-white font-black text-[#14284B] shadow-inner">DC</div>
      <div className="leading-tight">
        <div className="text-[11px] font-black tracking-[0.2em] text-white">DELTROL CONTROLS</div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <div className="flex min-h-screen flex-col bg-[#F4F7FA]">
          <header className="sticky top-0 z-50 flex h-[72px] shrink-0 items-center justify-between bg-[#14284B] px-6 text-white shadow-md">
            <Logo />
            <nav className="flex items-center gap-2">
              <Link href="/dashboard" className="rounded-md px-4 py-2 text-[13px] font-bold transition-all hover:bg-white/10">Dashboard</Link>
              <Link href="/" className="rounded-md bg-white/15 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-white/20">Parts</Link>
            </nav>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                Connected
              </div>
              <button className="rounded-md border border-white/20 px-3 py-1.5 text-[12px] font-bold transition-all hover:bg-white/10">Refresh</button>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

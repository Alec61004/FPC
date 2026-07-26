import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deviation Knowledge Hub",
  description: "Deltrol Controls deviation knowledge hub",
};

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded bg-white font-black text-[#14284B]">DC</div>
      <div className="leading-tight">
        <div className="text-[18px] font-extrabold">Deviation Knowledge Hub</div>
        <div className="text-[10px] font-semibold tracking-[0.18em] text-white/70">DELTROL CONTROLS</div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="min-h-[100dvh] bg-[#F4F6F9] text-[#1A2333]">
          <header className="flex h-[72px] items-center justify-between bg-[#14284B] px-5 text-white shadow-sm">
            <Logo />
            <nav className="flex items-center gap-1 text-[13px] font-medium">
              <Link className="rounded px-3 py-2 hover:bg-white/10" href="/dashboard">Dashboard</Link>
              <Link className="rounded px-3 py-2 hover:bg-white/10" href="/parts">Deviations</Link>
              <Link className="rounded px-3 py-2 hover:bg-white/10" href="/parts">Parts</Link>
              <Link className="rounded px-3 py-2 hover:bg-white/10" href="/dashboard">Reports/Analytics</Link>
              <Link className="rounded px-3 py-2 hover:bg-white/10" href="/dashboard">Settings</Link>
            </nav>
            <div className="hidden xl:flex items-center gap-4 text-xs text-white/80">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400"/>Connected</span>
              <span>Records: 152</span>
              <button className="rounded border border-white/20 px-2 py-1 hover:bg-white/10">Import</button>
              <button className="rounded border border-white/20 px-2 py-1 hover:bg-white/10">Refresh</button>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

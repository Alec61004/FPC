import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { title: "Deviation Knowledge Hub", description: "Deltrol Controls part-centric deviation knowledge app" };

function DeltrolLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-11 -rotate-12 rounded-[50%] bg-[#1C6AA8] grid place-items-center shadow-sm">
        <span className="rotate-12 text-[12px] font-black tracking-tight text-white">DC</span>
      </div>
      <div className="leading-none hidden sm:block">
        <div className="text-[17px] font-extrabold tracking-tight text-white">Deltrol</div>
        <div className="text-[10px] font-bold tracking-[0.16em] text-[#74B9E6]">CONTROLS</div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="min-h-[100dvh] bg-[#F5F7FA] text-[#1A2333]">
          <header className="sticky top-0 z-40 h-14 bg-[#0F2540] text-white flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <DeltrolLogo />
              <div className="h-7 w-px bg-white/20" />
              <div className="font-semibold tracking-tight truncate">Deviation Knowledge Hub</div>
            </div>
            <nav className="flex items-center gap-1 text-[13px]">
              <Link className="px-3 py-1.5 rounded hover:bg-white/10" href="/dashboard">Dashboard</Link>
              <Link className="px-3 py-1.5 rounded hover:bg-white/10" href="/parts">Parts</Link>
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

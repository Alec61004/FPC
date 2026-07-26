"use client";
import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="app-topbar">
          <div className="brand-lockup">
            <div className="brand-mark">DC</div>
            <div className="brand-text"><b>Deltrol</b><span>CONTROLS</span></div>
          </div>
          <div className="topbar-spacer" />
          <button className="topbar-btn">Import</button>
          <button className="topbar-btn">Import New</button>
          <button className="topbar-btn">Data Folder</button>
          <button className="topbar-btn">Refresh</button>
          <div className="connected"><span />Connected</div>
          <div className="data-source">R2 raw: deviation-raw/2024-2026 • Supabase lessons</div>
          <div className="utility-icons">○ ? 👤 ⚙</div>
        </header>
        <div className="app-shell">
          <nav className="app-sidebar">
            <div className="sidebar-brand"><div className="brand-mark small">DC</div><span>DELTROL<br/>CONTROLS</span></div>
            <Link href="/" className="side-link active"><span className="side-icon">▦</span>Dashboard</Link>
            <Link href="/parts" className="side-link"><span className="side-icon">▣</span>Parts</Link>
          </nav>
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-[#F4F7FB] text-[#1A2333]">
        <header className="h-[72px] bg-[#14284B] flex items-center px-4 shadow-md">
           {/* Logo Deltrol Controls lockup would go here */}
           <div className="text-white font-bold text-xl tracking-tight">DELTROL CONTROLS</div>
        </header>
        <div className="flex h-[calc(100vh-72px)]">
          <nav className="w-16 bg-[#14284B] flex flex-col items-center py-6 gap-6">
            <Link href="/dashboard" className="text-white/60 hover:text-white text-xs text-center flex flex-col gap-1">
               <div className="w-8 h-8 rounded bg-white/10" /> Dashboard
            </Link>
            <Link href="/parts" className="text-white text-xs text-center flex flex-col gap-1">
               <div className="w-8 h-8 rounded bg-white/20" /> Parts
            </Link>
          </nav>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}

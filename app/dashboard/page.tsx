"use client";

import { useEffect, useState } from "react";
import { getDeviations, fieldStatus, type DeviationRecord } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<DeviationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeviations().then(setData).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: data.length,
    reusable: data.filter(r => fieldStatus(r).toLowerCase().includes("reusable")).length,
    rejected: data.filter(r => fieldStatus(r).toLowerCase().includes("reject")).length,
    pending: data.filter(r => !fieldStatus(r)).length || 5, // Mock pending
  };

  return (
    <div className="h-[calc(100vh-72px)] overflow-y-auto bg-[#F8FAFC] p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-2xl font-black text-[#14284B]">DASHBOARD SUMMARY</h1>
        
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-6">
          <KpiCard title="TOTAL DEVIATIONS" value={stats.total} color="bg-blue-600" />
          <KpiCard title="REUSABLE CASES" value={stats.reusable} color="bg-emerald-600" />
          <KpiCard title="REJECTED CASES" value={stats.rejected} color="bg-rose-600" />
          <KpiCard title="PENDING REVIEW" value={stats.pending} color="bg-orange-500" />
        </div>

        {/* Charts & Lists (Mock) */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="kh-card col-span-2 p-6">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">TREND ANALYSIS</h3>
            <div className="flex h-[300px] items-end justify-between gap-2 px-4 pb-4 border-b border-slate-100">
              {[40, 70, 45, 90, 65, 80, 50, 85, 30, 75, 55, 95].map((h, i) => (
                <div key={i} className="w-full bg-blue-100 transition-all hover:bg-blue-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
            </div>
          </div>

          <div className="kh-card p-6">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">RECENT ACTIVITY</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0">
                  <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">#{i}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">DEV260{i} Approved</p>
                    <p className="text-[10px] text-slate-400">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="kh-card flex flex-col overflow-hidden">
      <div className={`h-1 w-full ${color}`}></div>
      <div className="p-6">
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">{title}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

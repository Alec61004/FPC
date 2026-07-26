"use client";

import { useState, useEffect } from "react";
import { getDeviations, fieldStatus, type DeviationRecord } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<DeviationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeviations().then(setData).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: data.length || 152,
    reusable: data.filter(r => fieldStatus(r).toLowerCase().includes("reusable")).length || 84,
    rejected: data.filter(r => fieldStatus(r).toLowerCase().includes("reject")).length || 23,
    pending: 12, // Mock pending
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F4F7FB] p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-2xl font-black text-[#14284B] uppercase tracking-tighter">Dashboard Summary</h1>
        
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <KpiCard title="TOTAL DEVIATIONS" value={stats.total} color="#14284B" />
          <KpiCard title="REUSABLE CASES" value={stats.reusable} color="#10B981" />
          <KpiCard title="REJECTED CASES" value={stats.rejected} color="#EF4444" />
          <KpiCard title="PENDING REVIEW" value={stats.pending} color="#F59E0B" />
        </div>

        {/* Charts & Tables (Prototype Mockups) */}
        <div className="grid grid-cols-3 gap-6">
          <div className="kh-card col-span-2 p-6 flex flex-col h-[400px]">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">TREND ANALYSIS</h3>
                <select className="text-[10px] border border-slate-200 rounded px-2 py-1 outline-none">
                  <option>LAST 12 MONTHS</option>
                  <option>THIS YEAR</option>
                </select>
             </div>
             <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-4 border-b border-slate-100">
               {[45, 60, 30, 85, 40, 75, 55, 90, 65, 40, 80, 50].map((h, i) => (
                 <div key={i} className="w-full bg-[#14284B]/10 hover:bg-[#14284B]/30 transition-all rounded-t-sm" style={{ height: `${h}%` }}></div>
               ))}
             </div>
             <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400">
               <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
             </div>
          </div>

          <div className="kh-card p-6 flex flex-col h-[400px]">
            <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">TOP ROOT CAUSES</h3>
            <div className="space-y-6 overflow-y-auto">
               <RootCauseItem label="Dimension Variance" count={42} percentage={35} />
               <RootCauseItem label="Material Property" count={28} percentage={25} />
               <RootCauseItem label="Process Control" count={15} percentage={15} />
               <RootCauseItem label="Tooling Wear" count={12} percentage={12} />
               <RootCauseItem label="Human Error" count={10} percentage={8} />
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
      <div className="h-1.5 w-full" style={{ backgroundColor: color }}></div>
      <div className="p-6">
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">{title}</p>
        <p className="text-4xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function RootCauseItem({ label, count, percentage }: { label: string; count: number; percentage: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-400">{count} cases</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#14284B]" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

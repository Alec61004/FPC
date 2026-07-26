"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDeviations, fieldPart, fieldDev, fieldIssue, fieldStatus, type DeviationRecord } from "@/lib/api";

const badge = (v:string)=>{
  const s=(v||"").toUpperCase();
  return s.includes("REJECT") ? "bg-[#FEE2E2] text-[#DC2626]" : s.includes("TEMP") || s.includes("BATCH") ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#D1FAE5] text-[#047857]";
}

export default function PartsListPage(){
  const [rows,setRows]=useState<DeviationRecord[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ getDeviations().then(d=>{setRows(d);}).finally(()=>setLoading(false)); },[]);
  return (
    <main className="h-full bg-white">
      <div className="flex h-12 items-center justify-between border-b px-4 bg-[#F8FAFC]">
        <div className="text-sm font-bold text-[#14284B]">Records: {rows.length}</div>
        <div className="flex gap-2">
            <button className="btn text-xs px-2 py-1">Import</button>
            <button className="btn text-xs px-2 py-1">Refresh</button>
        </div>
      </div>
      <div className="overflow-y-auto">
        <table className="w-full text-left text-[11px] border-collapse">
            <thead className="bg-[#14284B] text-white sticky top-0">
                <tr>{['Part', 'DEV ID', 'Issue', 'Root Cause', 'Decision', 'Status', 'Lesson Code'].map(h=><th key={h} className="px-2 py-2 border-r border-white/20">{h}</th>)}</tr>
            </thead>
            <tbody>
                {rows.map((r,i)=><tr key={i} className="border-b hover:bg-[#EFF6FF]"><td className="px-2 py-1.5 border-r font-medium">{fieldPart(r)}</td><td className="px-2 py-1.5 border-r font-mono text-[#14284B] font-bold">{fieldDev(r)}</td><td className="px-2 py-1.5 border-r max-w-[200px] truncate">{fieldIssue(r)}</td><td className="px-2 py-1.5 border-r">{r.root_cause||'-'}</td><td className="px-2 py-1.5 border-r"><span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${badge(r.decision||'')}`}>{r.decision||'-'}</span></td><td className="px-2 py-1.5 border-r"><span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${badge(r.status||'')}`}>{fieldStatus(r)}</span></td><td className="px-2 py-1.5 font-mono">{r.lesson_code||'-'}</td></tr>)}
            </tbody>
        </table>
      </div>
    </main>
  );
}
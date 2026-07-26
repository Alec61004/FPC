"use client";

import { useState, useMemo, useEffect } from "react";
import {
  getDeviations,
  fieldPart,
  fieldDev,
  fieldIssue,
  fieldAction,
  fieldLesson,
  fieldStatus,
  fieldDate,
  desc,
  type DeviationRecord
} from "@/lib/api";

export default function PartsPage() {
  const [data, setData] = useState<DeviationRecord[]>([]);
  const [selected, setSelected] = useState<DeviationRecord | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeviations().then(res => {
      setData(res);
      if (res.length > 0) setSelected(res[0]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(r => 
      fieldPart(r).toLowerCase().includes(q) || 
      fieldDev(r).toLowerCase().includes(q) ||
      fieldIssue(r).toLowerCase().includes(q)
    );
  }, [data, search]);

  const getBadgeColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("reusable") || s.includes("condition")) return "badge-green";
    if (s.includes("reject")) return "badge-red";
    if (s.includes("batch") || s.includes("lot")) return "badge-blue";
    return "badge-orange";
  };

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden">
      {/* Left Sidebar: Search & Filter */}
      <aside className="w-[320px] border-r border-slate-200 bg-white p-6 overflow-y-auto">
        <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Search & Filter</h2>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Keyword</label>
            <input 
              type="text" 
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Part or Dev ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-eng btn-eng-primary py-2.5">Search</button>
            <button className="btn-eng btn-eng-outline py-2.5" onClick={() => setSearch("")}>Reset</button>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-slate-400">Part Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Selected Part</span>
              <span className="font-bold">{selected ? fieldPart(selected) : "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Related Cases</span>
              <span className="font-bold">{filtered.length}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
        {/* Table Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="kh-card h-full flex flex-col overflow-hidden bg-white">
            <table className="table-dense w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="w-[120px]">Part</th>
                  <th className="w-[120px]">Dev ID</th>
                  <th className="min-w-[300px]">Issue</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-400">Loading records...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-400">No records found.</td></tr>
                ) : filtered.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected === row ? 'row-selected' : ''}`}
                    onClick={() => setSelected(row)}
                  >
                    <td className="font-bold">{fieldPart(row)}</td>
                    <td className="font-mono text-xs text-blue-600">{fieldDev(row)}</td>
                    <td className="truncate max-w-[400px]">{fieldIssue(row)}</td>
                    <td>
                      <span className={`kh-badge ${getBadgeColor(fieldStatus(row))}`}>
                        {fieldStatus(row)}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{fieldDate(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interaction Actions Bar */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center gap-3">
          <button className="btn-eng btn-eng-primary">Open Detail</button>
          <button className="btn-eng btn-eng-outline">Open Folder</button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button className="btn-eng btn-eng-outline">Open Word</button>
          <button className="btn-eng btn-eng-outline">Open PDF</button>
          <button className="btn-eng btn-eng-outline ml-auto">Export Full Data</button>
        </div>

        {/* 3-Column Detail View */}
        <div className="h-[320px] shrink-0 border-t border-slate-200 bg-white p-6">
          <div className="grid h-full grid-cols-3 gap-6">
            <div className="detail-card bg-slate-50">
              <h3>VẤN ĐỀ ĐÃ GẶP</h3>
              <p className="line-clamp-6">{selected ? fieldIssue(selected) : "No record selected."}</p>
            </div>
            <div className="detail-card bg-slate-50">
              <h3>CÁCH ĐÃ XỬ LÝ</h3>
              <p className="line-clamp-6">{selected ? fieldAction(selected) : "No record selected."}</p>
            </div>
            <div className="detail-card bg-slate-50 border-emerald-600">
              <h3 className="text-emerald-700">KINH NGHIỆM KHI LẬP LẠI</h3>
              <p className="line-clamp-6">{selected ? fieldLesson(selected) : "No record selected."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

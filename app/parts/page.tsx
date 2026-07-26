"use client";

import { useState, useMemo, useEffect } from "react";
import { getDeviations, fieldPart, fieldDev, fieldIssue, fieldAction, fieldLesson, fieldStatus, fieldDate, type DeviationRecord } from "@/lib/api";

const MOCK_FALLBACK = {
  issue: "Terminal thickness exceeds specification. During inspection, the crimp height was measured below the minimum allowed tolerance, resulting in potential mechanical failure.",
  action: "Adjusted the crimp machine die settings and recalibrated the hydraulic pressure. Performed a 100% inspection on the remaining lot and updated the maintenance schedule for die components.",
  lesson: "Always verify crimp height after die changes. If dimension variances occur, immediately check tooling wear and machine pressure. Document all dimensional data in the logbook.",
};

const getIssue = (row: DeviationRecord) => fieldIssue(row) || MOCK_FALLBACK.issue;
const getAction = (row: DeviationRecord) => fieldAction(row) || MOCK_FALLBACK.action;
const getLesson = (row: DeviationRecord) => fieldLesson(row) || MOCK_FALLBACK.lesson;

const MOCK_FILES = [
  { name: "DEV260119_Approval.pdf", type: "PDF", folder: "Source", size: "2.1MB" },
  { name: "DEV260119_Dimension.png", type: "PNG", folder: "Source", size: "800KB" },
  { name: "DEV260119_Report.docx", type: "DOCX", folder: "Source", size: "1.5MB" },
];

export default function PartsPage() {
  const [data, setData] = useState<DeviationRecord[]>([]);
  const [selected, setSelected] = useState<DeviationRecord | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeEvidenceFile, setActiveEvidenceFile] = useState(MOCK_FILES[0]);

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
      getIssue(r).toLowerCase().includes(q)
    );
  }, [data, search]);

  const getBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("reusable") || s.includes("condition")) return "badge-green";
    if (s.includes("temporary") || s.includes("lot-specific")) return "badge-blue";
    if (s.includes("rejected")) return "badge-red";
    return "badge-gray"; 
  };

  return (
    <div className="flex h-full bg-[#F4F7FB] overflow-hidden">
      <aside className="w-[280px] flex-shrink-0 border-r border-slate-200 bg-white p-6 overflow-y-auto">
        <div className="kh-card p-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4">Search & Filter</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Keyword</label>
              <input type="text" className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Part or Dev ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="btn-eng btn-eng-primary">Search</button>
              <button className="btn-eng btn-eng-outline" onClick={() => setSearch("")}>Reset</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="kh-card flex-1 flex flex-col overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1A2333]">Deviation Results</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold"><span>Total: {filtered.length}</span></div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="table-dense w-full">
              <thead>
                <tr>
                  <th className="w-[100px]">Part #</th>
                  <th className="w-[120px]">Dev ID</th>
                  <th className="min-w-[250px]">Issue Description</th>
                  <th className="w-[150px]">Status</th>
                  <th className="w-[100px]">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={idx} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected === row ? 'row-selected' : ''}`} onClick={() => setSelected(row)}>
                    <td className="font-bold">{fieldPart(row)}</td>
                    <td className="font-mono text-xs text-blue-700">{fieldDev(row)}</td>
                    <td>{getIssue(row)}</td>
                    <td><span className={`badge ${getBadgeClass(fieldStatus(row))}`}>{fieldStatus(row) || "MISSING EVIDENCE"}</span></td>
                    <td className="text-xs text-slate-500">{fieldDate(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="kh-card p-4 flex items-center gap-3">
          <button className="btn-eng btn-eng-primary" onClick={() => setShowDetailModal(true)}>Open Detail</button>
          <button className="btn-eng btn-eng-outline">Open Folder</button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button className="btn-eng btn-eng-outline">Open Word</button>
          <button className="btn-eng btn-eng-outline">Open PDF</button>
          <button className="btn-eng btn-eng-outline ml-auto">Export Full Data</button>
        </div>
      </main>

      <aside className="w-[350px] flex-shrink-0 border-l border-slate-200 bg-white p-6 overflow-y-auto">
        <div className="kh-card p-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4">Evidence Preview</h2>
          <div className="evidence-toolbar mb-4"><input type="text" placeholder="Search files..." className="flex-1" /><select><option>All</option></select></div>
          <div className="evidence-list">
            <div className="evidence-list-header"><span>Name</span><span>Type</span><span>Folder</span><span>Size</span></div>
            {MOCK_FILES.map((f, i) => <div key={i} className="evidence-list-item"><span>{f.name}</span><span>{f.type}</span><span>{f.folder}</span><span>{f.size}</span></div>)}
          </div>
          <div className="mt-6 border p-4 bg-slate-50 min-h-[150px] flex items-center justify-center">Document Preview</div>
        </div>
      </aside>

      {showDetailModal && selected && (
        <div className="kh-modal-backdrop">
          <div className="kh-modal">
            <div className="kh-modal-header">
              <h2 className="kh-modal-title">Case Detail | {fieldDev(selected)} | Part {fieldPart(selected)}</h2>
              <button className="kh-modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="detail-card border-l-orange-500"><h3>1. VẤN ĐỀ ĐÃ GẶP</h3><p>{getIssue(selected)}</p></div>
              <div className="detail-card border-l-blue-500"><h3>2. CÁCH ĐÃ XỬ LÝ</h3><p>{getAction(selected)}</p></div>
              <div className="detail-card border-l-emerald-500"><h3>3. KINH NGHIỆM KHI LẬP LẠI</h3><p>{getLesson(selected)}</p></div>
            </div>
            <div className="flex justify-end gap-3"><button className="btn-eng btn-eng-outline">View History</button><button className="btn-eng btn-eng-primary">Approve</button><button className="btn-eng btn-eng-outline">Edit</button><button className="btn-eng btn-eng-primary">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

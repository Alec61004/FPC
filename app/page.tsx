"use client";

import { useState, useEffect, useMemo } from "react";
import { getDeviations, fieldStatus, type DeviationRecord } from "@/lib/api";
import { fieldPart, fieldDev, fieldIssue, fieldAction, fieldLesson, fieldDate } from "@/lib/api";

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

export default function DashboardPage() {
  const [data, setData] = useState<DeviationRecord[]>([]);
  const [selected, setSelected] = useState<DeviationRecord | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeEvidenceFile, setActiveEvidenceFile] = useState(MOCK_FILES[0]);

  useEffect(() => {
    setLoading(true);
    getDeviations().then(res => {
      const processedRes = res.length > 0 ? res : [
        {
          part: "34320-02", dev_id: "DEV250928", issue: "Crimp height below minimum tolerance.", status: "REJECTED", date: "2024-07-25",
          root_cause: "Improper die setting", action: "Recalibrated machine, inspected lot.", lesson: "Always check tooling wear.", part_id: 101
        },
        {
          part: "53180-09", dev_id: "DEV250929", issue: "Dimension out of spec.", status: "TEMPORARY / LOT-SPECIFIC", date: "2024-07-24",
          root_cause: "Material variance", action: "Accepted current condition, reviewed backstop.", lesson: "Involve DC team for criteria.", part_id: 102
        },
        {
          part: "88901-08", dev_id: "DEV250930", issue: "Missing evidence for test results.", status: "MISSING EVIDENCE", date: "2024-07-23",
          root_cause: "Data entry error", action: "Request source files from QC.", lesson: "Ensure all data is logged.", part_id: 103
        }
      ];
      setData(processedRes);
      if (processedRes.length > 0) setSelected(processedRes[0]);
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
    if (s.includes("missing evidence")) return "badge-gray";
    return "badge-gray";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FB]">
      <aside className="w-[280px] flex-shrink-0 border-r border-[#E2E8F0] bg-white p-6 overflow-y-auto">
        <div className="kh-card p-4 mb-6">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Search & Filter</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Keyword</label>
              <input type="text" className="w-full rounded border border-[#E2E8F0] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Part or Dev ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="btn-eng btn-eng-primary">Search</button>
              <button className="btn-eng btn-eng-outline" onClick={() => setSearch("")}>Reset</button>
            </div>
          </div>
        </div>
        <div className="kh-card p-4">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">PART INFO</h2>
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Selected Part</label><p className="text-sm font-medium text-[#1A2333]">{selected ? fieldPart(selected) : '-'}</p></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Related Cases</label><p className="text-sm font-medium text-[#1A2333]">{selected ? data.filter(r => fieldPart(r) === fieldPart(selected)).length : 0}</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="kh-card flex-1 flex flex-col overflow-hidden mb-6">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1A2333]">Deviation Results</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <span>Total: {filtered.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="table-eng w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500 border-b border-slate-100">
                  <th className="p-3">Part</th>
                  <th className="p-3">Dev ID</th>
                  <th className="p-3 min-w-[250px]">Issue</th>
                  <th className="p-3 w-[150px]">Status</th>
                  <th className="p-3 w-[100px]">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">Loading records...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">No records found.</td></tr>
                ) : filtered.map((row, idx) => (
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

      <aside className="w-[350px] flex-shrink-0 border-l border-[#E2E8F0] bg-white p-6 overflow-y-auto">
        <div className="kh-card p-4 mb-6">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Evidence Preview</h2>
          <div className="evidence-toolbar mb-4 flex gap-2">
            <input type="text" placeholder="Search files..." className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none" />
            <select className="rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none">
              <option>All</option>
              <option>PDF</option>
              <option>DOCX</option>
              <option>PNG</option>
            </select>
          </div>
          <div className="evidence-list">
            <div className="evidence-list-header">
              <span>Name</span><span>Type</span><span>Folder</span><span>Size</span>
            </div>
            {MOCK_FILES.map((f, i) => (
              <div key={i} className={`evidence-list-item ${activeEvidenceFile.name === f.name ? 'row-selected' : ''}`} onClick={() => setActiveEvidenceFile(f)}>
                <span>{f.name}</span><span>{f.type}</span><span>{f.folder}</span><span>{f.size}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="kh-card p-4 min-h-[150px] flex flex-col items-center justify-center">
          <div className="text-sm font-bold text-slate-500 mb-2">Preview of: {activeEvidenceFile.name}</div>
          <div className="w-full h-[100px] bg-slate-100 rounded flex items-center justify-center text-slate-400">Document Preview Area</div>
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
              <div className="detail-card border-l-emerald-500"><h3>3. KINH NGHIỆM KHI LẶP LẠI</h3><p>{getLesson(selected)}</p></div>
            </div>
            <div className="flex justify-end gap-3"><button className="btn-eng btn-eng-outline">View History</button><button className="btn-eng btn-eng-primary">Approve</button><button className="btn-eng btn-eng-outline">Edit</button><button className="btn-eng btn-eng-primary">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

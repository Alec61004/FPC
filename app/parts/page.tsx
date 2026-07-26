"use client";

import { useState, useMemo, useEffect } from "react";
import { getDeviations, fieldPart, fieldDev, fieldIssue, fieldAction, fieldLesson, fieldStatus, fieldDate, desc, type DeviationRecord } from "@/lib/api";

// Mock data for buttons that are not yet connected to backend logic
const MOCK_FILES = [
  { name: "DEV260119_Approval.pdf", type: "PDF", folder: "Source", size: "2.1MB" },
  { name: "DEV260119_Dimension.png", type: "PNG", folder: "Source", size: "800KB" },
  { name: "DEV260119_Report.docx", type: "DOCX", folder: "Source", size: "1.5MB" },
];

const MOCK_DETAIL_CONTENT = {
  issue: "During the manufacturing process of part 70196-03, a staking joint unexpectedly cracked and rotated beyond acceptable limits. Initial tests indicated pushout forces between 600-700 lbf, significantly exceeding the specified 325 lbf. Despite the anomaly, no customer complaints have been reported regarding this specific issue.\n\nThis deviation raises concerns about the long-term reliability of the staking joint and potential implications for product performance under stress. The unexpected behavior suggests either a material property variance or a process control issue within the staking operation. Immediate investigation into root cause is required to prevent recurrence and ensure product integrity.",
  action: "To address the cracking and rotation issue, a new punch was ordered to precisely adjust the outer diameter (OD) and backstop parameters of the staking machine. Concurrently, the DC team was consulted, and after thorough review and testing, a decision was made to accept the current condition with slight rotation, provided it meets functional criteria.\n\nFurther actions included completing the joint assembly and reviewing the backstop specifications to optimize the staking process. This approach ensures immediate production continuity while implementing corrective measures to improve the staking joint's quality in future batches. Comprehensive documentation of these actions has been recorded for future reference and process improvement.",
  lesson: "When encountering staking joint deviations like cracking or rotation, prioritize a thorough investigation into both material properties and process parameters. It is crucial to involve the design and quality assurance teams (DC team) for expert consultation and to define clear acceptance criteria for any non-conforming parts. For this specific case with part 70196-03, slight rotation of the staking joint is accepted as the current condition, given that the valve operates with light force and no customer complaints have been received. Always verify functional performance and document all decisions to establish a clear precedent for similar future deviations. Implement corrective actions, such as tooling adjustments, to prevent recurrence and improve long-term product reliability.",
};

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
      fieldIssue(r).toLowerCase().includes(q)
    );
  }, [data, search]);

  const getBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("reusable") || s.includes("condition")) return "badge-green";
    if (s.includes("temporary") || s.includes("lot-specific")) return "badge-blue";
    if (s.includes("rejected")) return "badge-red";
    if (s.includes("missing evidence")) return "badge-gray";
    return "badge-gray"; // Default or unknown status
  };

  return (
    <div className="flex h-full bg-[#F4F7FB] overflow-hidden">
      {/* Left Column: Search & Filter (as a separate panel) */}
      <aside className="w-[280px] flex-shrink-0 border-r border-slate-200 bg-white p-6 overflow-y-auto">
        <div className="kh-card p-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4">Search & Filter</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Keyword</label>
              <input 
                type="text" 
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Part, DEV ID, or Issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="btn-eng btn-eng-primary">Search</button>
              <button className="btn-eng btn-eng-outline" onClick={() => setSearch("")}>Reset</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Middle Column: Results Table + Summary Cards */}
      <main className="flex-1 flex flex-col overflow-hidden p-6">
        <div className="kh-card flex-1 flex flex-col overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1A2333]">Deviation Results</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <span>Total: {filtered.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="table-dense w-full">
              <thead>
                <tr>
                  <th className="w-[100px]">Part #</th>
                  <th className="w-[120px]">DEV ID</th>
                  <th className="min-w-[250px]">Issue Description</th>
                  <th className="w-[150px]">Status</th>
                  <th className="w-[100px]">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">Loading records...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">No records found.</td></tr>
                ) : filtered.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected === row ? 'row-selected' : ''}`}
                    onClick={() => setSelected(row)}
                  >
                    <td className="font-bold">{fieldPart(row)}</td>
                    <td className="font-mono text-xs text-blue-700">{fieldDev(row)}</td>
                    <td>{fieldIssue(row) || MOCK_DETAIL_CONTENT.issue.substring(0, 80) + "..."}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(fieldStatus(row))}`}>
                        {fieldStatus(row) || "Missing Status"}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{fieldDate(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interaction Buttons */}
        <div className="kh-card p-4 flex items-center gap-3">
          <button className="btn-eng btn-eng-primary" onClick={() => setShowDetailModal(true)}>Open Detail</button>
          <button className="btn-eng btn-eng-outline">Open Folder</button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button className="btn-eng btn-eng-outline">Open Word</button>
          <button className="btn-eng btn-eng-outline">Open PDF</button>
          <button className="btn-eng btn-eng-outline ml-auto">Export Full Data</button>
        </div>
      </main>

      {/* Right Column: Evidence Preview */}
      <aside className="w-[350px] flex-shrink-0 border-l border-slate-200 bg-white p-6 overflow-y-auto">
        <div className="kh-card p-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4">Evidence Preview</h2>
          <div className="evidence-toolbar mb-4">
            <input type="text" placeholder="Search files..." className="flex-1 mr-2" />
            <select className="w-[100px]">
              <option>All Types</option>
              <option>PDF</option>
              <option>DOCX</option>
              <option>PNG</option>
            </select>
          </div>
          <div className="evidence-list">
            <div className="evidence-list-header">
              <span>Name</span><span>Type</span><span>Size</span>
            </div>
            {MOCK_FILES.map((file, idx) => (
              <div key={idx} className={`evidence-list-item ${activeEvidenceFile === file ? 'row-selected' : ''}`} onClick={() => setActiveEvidenceFile(file)}>
                <span>{file.name}</span><span>{file.type}</span><span>{file.size}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 border border-slate-200 rounded-md bg-slate-50 text-center flex flex-col items-center justify-center min-h-[150px]">
            <p className="text-sm text-slate-500">Preview of: {activeEvidenceFile.name}</p>
            {/* Actual document preview would go here */}
          </div>
        </div>
      </aside>

      {/* Case Detail Modal */}
      {showDetailModal && selected && (
        <div className="kh-modal-backdrop">
          <div className="kh-modal">
            <div className="kh-modal-header">
              <h2 className="kh-modal-title">Case Detail | {fieldDev(selected)} | Part {fieldPart(selected)}</h2>
              <button className="kh-modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="detail-card border-l-orange-500">
                <h3 className="text-orange-600">1. VẤN ĐỀ ĐÃ GẶP</h3>
                <p>{fieldIssue(selected) || MOCK_DETAIL_CONTENT.issue}</p>
              </div>
              <div className="detail-card border-l-blue-500">
                <h3 className="text-blue-600">2. CÁCH ĐÃ XỬ LÝ</h3>
                <p>{fieldAction(selected) || MOCK_DETAIL_CONTENT.action}</p>
              </div>
              <div className="detail-card border-l-emerald-500">
                <h3 className="text-emerald-600">3. KINH NGHIỆM KHI LẶP LẠI</h3>
                <p>{fieldLesson(selected) || MOCK_DETAIL_CONTENT.lesson}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn-eng btn-eng-outline">View History</button>
              <button className="btn-eng btn-eng-primary">Approve</button>
              <button className="btn-eng btn-eng-outline">Edit</button>
              <button className="btn-eng btn-eng-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

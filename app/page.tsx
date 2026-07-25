"use client";
import { useState } from "react";
import { Search, Package, AlertTriangle, BookOpen, ChevronRight, FileText, Folder, RefreshCw, BarChart3, ShieldCheck } from "lucide-react";

// Dữ liệu mẫu (sẽ thay bằng data thật)
const stats = [
  { label: "Total DEV", value: "1,204", icon: BarChart3 },
  { label: "Repeat Parts", value: "48", icon: Package },
  { label: "Critical", value: "12", icon: AlertTriangle },
  { label: "Lessons", value: "85", icon: BookOpen },
];

export default function DeviationDashboard() {
  const [selectedPart, setSelectedPart] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white p-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg"><ShieldCheck className="text-blue-400" /> Deviation Knowledge Hub</div>
        <div className="flex gap-2 text-sm text-slate-300">
          <button className="hover:text-white flex items-center gap-1"><RefreshCw size={14}/> Refresh</button>
          <span>Connected</span>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 p-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4">
            <s.icon className="text-blue-600" />
            <div>
              <div className="text-xs text-slate-500 uppercase">{s.label}</div>
              <div className="text-xl font-bold">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout 3 Columns */}
      <main className="grid grid-cols-12 gap-4 px-4 pb-4 h-[calc(100vh-180px)]">
        {/* Left Filter */}
        <aside className="col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="font-bold mb-4">Search & Filter</h3>
          <div className="space-y-3 text-sm">
            <input className="w-full border p-2 rounded" placeholder="Keyword..." />
            <input className="w-full border p-2 rounded" placeholder="Part Number..." />
            <button className="w-full bg-blue-600 text-white p-2 rounded font-bold">Search</button>
          </div>
        </aside>

        {/* Center Grid */}
        <section className="col-span-7 bg-white rounded-lg shadow-sm border border-slate-200 p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Part ID</th>
                <th className="p-2 text-left">DEV ID</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3].map((i) => (
                <tr key={i} className="border-t hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedPart(i as any)}>
                  <td className="p-2">70196-0{i}</td>
                  <td className="p-2">DEV2601{i}</td>
                  <td className="p-2"><span className="bg-green-100 text-green-700 px-2 rounded">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Right Preview */}
        <aside className="col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="font-bold mb-4">Evidence Preview</h3>
          <div className="bg-slate-100 h-48 flex items-center justify-center rounded">
            <FileText size={48} className="text-slate-400" />
          </div>
          <div className="mt-4 space-y-2">
            <button className="w-full border p-2 rounded text-left flex items-center gap-2"><Folder size={16}/> Open Folder</button>
            <button className="w-full border p-2 rounded text-left flex items-center gap-2"><FileText size={16}/> View PDF</button>
          </div>
        </aside>
      </main>
    </div>
  );
}
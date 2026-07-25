"use client";
import { useState } from "react";
import { Search, Package, AlertTriangle, BookOpen, ShieldCheck, FileText, Folder, RefreshCw, BarChart3, CheckCircle, XCircle } from "lucide-react";

// DATA MẪU - Cấu trúc thật cho FPC KnowledgeHub
const MOCK_DEVIATIONS = [
  { id: "DEV260119", part: "70196-03", severity: "Critical", status: "Closed", problem: "Crack at weld seam", solution: "Adjust current + welding speed", lesson: "Check current before batch", evidence: "cracks_70196.pdf" },
  { id: "DEV260120", part: "70197-01", severity: "Major", status: "Active", problem: "Dimensional mismatch", solution: "Recalibrate CNC jig", lesson: "Calibrate after 500 pcs", evidence: "dim_check_70197.docx" },
  { id: "DEV260121", part: "70196-03", severity: "Minor", status: "Active", problem: "Surface scratch", solution: "Replace protective film", lesson: "Handle with glove", evidence: "scratch_03.jpg" },
];

export default function KnowledgeHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(MOCK_DEVIATIONS[0].id);

  const filteredData = MOCK_DEVIATIONS.filter(d => 
    d.part.includes(searchTerm) || d.id.includes(searchTerm)
  );

  const selectedCase = MOCK_DEVIATIONS.find(d => d.id === selectedId) || MOCK_DEVIATIONS[0];

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-sm">
      {/* Header & Stats */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-blue-600"/>FPC KnowledgeHub</h1>
        <div className="flex gap-2">
            <span className="bg-white border px-3 py-1 rounded shadow-sm text-slate-600">Total: {MOCK_DEVIATIONS.length}</span>
            <button className="bg-blue-600 text-white px-3 py-1 rounded shadow-sm flex items-center gap-1 hover:bg-blue-700"><RefreshCw size={14}/> Reload Data</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-100px)]">
        {/* Cột trái: Filter */}
        <aside className="col-span-3 bg-white p-4 rounded-lg shadow-sm border">
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 text-slate-400" size={16}/>
            <input 
              className="w-full border p-2 pl-8 rounded" 
              placeholder="Search Part or DEV ID..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            {filteredData.map(d => (
              <div 
                key={d.id} 
                onClick={() => setSelectedId(d.id)}
                className={`p-3 rounded cursor-pointer border ${selectedId === d.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
              >
                <div className="font-bold">{d.part}</div>
                <div className="text-slate-500 text-xs">{d.id} - {d.status}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Cột giữa: Knowledge Cards */}
        <section className="col-span-6 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">{selectedCase.part} <span className="text-sm font-normal text-slate-400">/ {selectedCase.id}</span></h2>
            <span className={`px-2 py-1 rounded text-xs font-bold ${selectedCase.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{selectedCase.severity}</span>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded border">
                <h3 className="font-bold text-slate-500 mb-1">Vấn đề:</h3>
                <p>{selectedCase.problem}</p>
            </div>
            <div className="bg-green-50 p-4 rounded border border-green-100">
                <h3 className="font-bold text-green-700 mb-1">Giải pháp/Xử lý:</h3>
                <p>{selectedCase.solution}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                <h3 className="font-bold text-yellow-700 mb-1">Bài học (Repeat cases):</h3>
                <p>{selectedCase.lesson}</p>
            </div>
          </div>
        </section>

        {/* Cột phải: Evidence */}
        <aside className="col-span-3 bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-bold mb-4">Evidence</h3>
          <div className="border-2 border-dashed p-8 text-center text-slate-400 rounded">
            <FileText size={32} className="mx-auto mb-2"/>
            <p>{selectedCase.evidence}</p>
          </div>
          <button className="w-full mt-4 bg-slate-900 text-white p-2 rounded flex items-center justify-center gap-2">
            <Folder size={16}/> Open Source File
          </button>
        </aside>
      </div>
    </div>
  );
}
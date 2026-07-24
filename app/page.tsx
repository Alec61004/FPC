"use client";
import { useState, useMemo } from "react";
import { AlertTriangle, Wrench, CheckCircle2, RefreshCw } from "lucide-react";

const parts = [
  { id: "70196-03", dev: "DEV260119", date: "17 Jan 25", issue: "Staking joint rotation", root: "Crack", status: "REUSABLE", action: "Consulted DC team, ordered new punch.", lesson: "Slight rotation is accepted if force limit (600-700 lbf) is maintained. Inspect radius.", supplier: "Dong Tam" },
  { id: "53180-09", dev: "DEV260142", date: "24 Jul 26", issue: "Surface finish crack", root: "Surface Crack", status: "REUSABLE", action: "Contain lot, inspect crack depth.", lesson: "Check deburr pressure before tray packaging." },
  { id: "80005-01", dev: "DEV260137", date: "23 Jul 26", issue: "Slot width drift", root: "Fixture Drift", status: "REJECTED", action: "CMM check, fixture wear log.", lesson: "End-of-life tool life frequency reset." }
];

export default function Home() {
  const [selected, setSelected] = useState(parts[0]);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => parts.filter(p => p.id.includes(filter) || p.issue.toLowerCase().includes(filter.toLowerCase())), [filter]);

  return (
    <main className="qms-shell">
      <header className="qms-header">
        <div className="logo"><span>◆</span> Deviation Knowledge Hub</div>
        <div className="toolbar">
          <button onClick={() => alert("Importing...")}>Import</button>
          <button onClick={() => location.reload()}><RefreshCw size={14}/>Refresh</button>
        </div>
      </header>
      <div className="qms-main">
        <aside className="qms-sidebar">
          <div className="filter-group">
            <label>Keyword Search</label>
            <input placeholder="Search..." onChange={(e) => setFilter(e.target.value)} />
          </div>
        </aside>
        <section className="qms-content">
          <div className="result-table">
            <div className="table-head"><span>Part</span><span>DEV ID</span><span>Issue</span><span>Root Cause</span><span>Status</span></div>
            {filtered.map(p => (
              <button key={p.id} className={`row ${selected.id === p.id ? 'active' : ''}`} onClick={() => setSelected(p)}>
                <span>{p.id}</span><span>{p.dev}</span><span>{p.issue}</span><span>{p.root}</span>
                <span className={`pill ${p.status === 'REUSABLE' ? 'green' : 'red'}`}>{p.status}</span>
              </button>
            ))}
          </div>
          <div className="detail-view">
            <div className="three-col">
              <div className="col"><h3><AlertTriangle size={16}/> VẤN ĐỀ ĐÃ GẶP</h3><p>{selected.issue}</p></div>
              <div className="col"><h3><Wrench size={16}/> CÁCH ĐÃ XỬ LÝ</h3><p>{selected.action}</p></div>
              <div className="col lesson"><h3><CheckCircle2 size={16}/> KINH NGHIỆM LẶP LẠI</h3><p>{selected.lesson}</p></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

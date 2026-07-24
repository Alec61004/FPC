"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, BookOpen, CheckCircle2, Package, RefreshCw, Wrench } from "lucide-react";

const parts = [
  { id: "53180-09", name: "Bracket housing", supplier: "Aster Precision", severity: "Critical", cases: 6, trend: "Rising", root: "Surface Crack", action: "10x Mag Inspect + Polish", lesson: "Check deburr pressure before tray packaging." },
  { id: "80005-01", name: "Seal carrier", supplier: "Northline", severity: "Major", cases: 4, trend: "Stable", root: "Fixture Drift", action: "CMM Confirm + Tool Swap", lesson: "End-of-life tool life frequency reset." },
  { id: "53196-05", name: "Guide rail insert", supplier: "Orchid", severity: "Minor", cases: 3, trend: "Stable", root: "Edge Burr", action: "Edge swipe inspection", lesson: "Verify supplier deburr logs post-cleaning." },
];

export default function Home() {
  const [selected, setSelected] = useState(parts[0]);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">KHUB QMS</div>
        <nav>
          <button className="active"><Package size={16}/>Command Center</button>
          <button><AlertTriangle size={16}/>Review Queue</button>
          <button><BookOpen size={16}/>Knowledge Base</button>
        </nav>
      </aside>

      <section className="workspace">
        <header className="header">
          <div><h1>Command Center</h1><p>Quality Intelligence & Deviation Recurrence</p></div>
          <button className="refresh"><RefreshCw size={14}/>Update Now</button>
        </header>

        <section className="dashboard">
          <div className="part-grid">
            {parts.map(p => (
              <div key={p.id} className={`part-card ${selected.id === p.id ? 'active' : ''}`} onClick={() => setSelected(p)}>
                <div className="card-top">
                  <span className={`pill ${p.severity.toLowerCase()}`}>{p.severity}</span>
                  <span className="part-id">{p.id}</span>
                </div>
                <h3>{p.name}</h3>
                <div className="card-meta"><span>{p.cases} cases</span><span>{p.root}</span></div>
              </div>
            ))}
          </div>

          <aside className="detail-panel">
            <div className="detail-head">
              <h2>{selected.id}</h2>
              <p>{selected.name} · {selected.supplier}</p>
            </div>
            
            <div className="insight-block">
              <label>Pattern Detected</label>
              <p className="pattern-text">{selected.root} repeated in {selected.cases} occurrences.</p>
            </div>

            <div className="action-steps">
              <div className="step">
                <Wrench size={16} className="text-blue-500" />
                <div><strong>Standard Action</strong><p>{selected.action}</p></div>
              </div>
              <div className="step lesson">
                <CheckCircle2 size={16} className="text-green-500" />
                <div><strong>Lesson Learned</strong><p>{selected.lesson}</p></div>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Clock3, FileSearch, Filter, Layers3, Package, RefreshCw, Search, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";

const parts = [
  { part: "70196-03", cases: 1, open: 0, reusable: 1, rejected: 0, root: "Crack", severity: "Major", lesson: "Accept slight rotation only after staking joint and function checks pass.", action: "Repeat fit test, crack inspection, and pull force before reuse.", dev: "DEV260119", supplier: "Dong Tam", age: "17 Jan 25" },
  { part: "53180-09", cases: 6, open: 2, reusable: 3, rejected: 1, root: "Surface finish", severity: "Critical", lesson: "Reuse previous approval only when crack depth, location, and process condition match evidence.", action: "Contain lot, inspect crack depth, review machining marks.", dev: "DEV260142", supplier: "Aster Precision", age: "24 Jul 26" },
  { part: "80005-01", cases: 6, open: 3, reusable: 2, rejected: 1, root: "Fixture drift", severity: "Critical", lesson: "Repeated datum drift after fixture correction requires process review, not only containment.", action: "CMM check, fixture wear log, first article comparison.", dev: "DEV260137", supplier: "Northline", age: "23 Jul 26" },
  { part: "34320-02", cases: 3, open: 0, reusable: 0, rejected: 3, root: "Crimp height", severity: "Critical", lesson: "Below-minimum crimp height is not reusable unless engineering releases a new verified limit.", action: "Reject lot, inspect tooling setting, document setup correction.", dev: "DEV250928", supplier: "Meiko", age: "11 Dec 25" },
  { part: "88901-08", cases: 2, open: 1, reusable: 1, rejected: 0, root: "Contamination", severity: "Major", lesson: "Connector contamination can be conditionally reused only after cleaning validation.", action: "Clean sample, inspect pins, confirm contact resistance.", dev: "DEV250502", supplier: "Delta", age: "09 Nov 25" },
];

const monthly = [18, 22, 16, 27, 21, 31, 25, 20];
const rootCauses = [
  ["Surface finish", 28, "#2563eb"],
  ["Fixture drift", 23, "#7c3aed"],
  ["Crack", 18, "#f97316"],
  ["Crimp height", 14, "#ef4444"],
  ["Contamination", 9, "#0ea5e9"],
] as const;

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "red" | "green" | "amber" | "blue" | "neutral" }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(parts[1]);
  const filtered = useMemo(() => parts.filter((p) => `${p.part} ${p.root} ${p.dev} ${p.supplier}`.toLowerCase().includes(query.toLowerCase())), [query]);

  const totals = useMemo(() => ({
    cases: parts.reduce((sum, p) => sum + p.cases, 0),
    open: parts.reduce((sum, p) => sum + p.open, 0),
    reusable: parts.reduce((sum, p) => sum + p.reusable, 0),
    rejected: parts.reduce((sum, p) => sum + p.rejected, 0),
  }), []);

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon">FPC</div><div><b>Deviation Hub</b><span>Quality intelligence</span></div></div>
        <nav>
          <button className="active"><BarChart3 size={17}/>Overview</button>
          <button><Package size={17}/>Part Risk</button>
          <button><FileSearch size={17}/>Evidence</button>
          <button><ShieldCheck size={17}/>Lessons</button>
        </nav>
        <div className="sidebar-card"><b>Data health</b><span>152 records indexed</span><span className="ok-dot">● SQLite connected</span></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p>Manufacturing Quality Analytics</p><h1>Deviation statistics & part recurrence</h1></div>
          <div className="actions"><button><RefreshCw size={16}/>Refresh</button><button className="primary"><Filter size={16}/>Filter report</button></div>
        </header>

        <section className="kpi-grid">
          <div className="kpi"><span>Total cases</span><strong>{totals.cases}</strong><em><TrendingUp size={15}/> +12% this quarter</em></div>
          <div className="kpi"><span>Open review</span><strong>{totals.open}</strong><em className="warn"><Clock3 size={15}/> needs decision</em></div>
          <div className="kpi"><span>Reusable lessons</span><strong>{totals.reusable}</strong><em className="good"><CheckCircle2 size={15}/> approved knowledge</em></div>
          <div className="kpi"><span>Rejected</span><strong>{totals.rejected}</strong><em className="bad"><AlertTriangle size={15}/> hard stop cases</em></div>
        </section>

        <section className="analytics-grid">
          <div className="panel trend-panel">
            <div className="panel-head"><div><h2>Deviation trend</h2><p>Cases found by recent import batches</p></div><Pill tone="blue">8 periods</Pill></div>
            <div className="bars">{monthly.map((v, i) => <div className="bar-wrap" key={i}><div className="bar" style={{height: `${v * 4}px`}}/><span>{v}</span></div>)}</div>
          </div>

          <div className="panel root-panel">
            <div className="panel-head"><div><h2>Top root causes</h2><p>Where recurrence concentrates</p></div></div>
            <div className="cause-list">{rootCauses.map(([name, value, color]) => <div key={name} className="cause-row"><span>{name}</span><div><i style={{width: `${value * 3}px`, background: color}}/><b>{value}%</b></div></div>)}</div>
          </div>
        </section>

        <section className="main-content">
          <div className="panel part-table">
            <div className="panel-head"><div><h2>Part recurrence leaderboard</h2><p>Click a part to view action knowledge</p></div><div className="search"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search part, DEV, supplier..." /></div></div>
            <div className="table-head"><span>Part</span><span>Cases</span><span>Open</span><span>Root cause</span><span>Lesson status</span><span>Latest DEV</span></div>
            {filtered.map((p) => <button key={p.part} className={`part-row ${selected.part === p.part ? "selected" : ""}`} onClick={() => setSelected(p)}>
              <span><b>{p.part}</b><small>{p.supplier}</small></span><span>{p.cases}</span><span>{p.open}</span><span>{p.root}</span><span><Pill tone={p.reusable ? "green" : "red"}>{p.reusable ? "Reusable" : "Reject only"}</Pill></span><span>{p.dev}</span>
            </button>)}
          </div>

          <aside className="panel knowledge-card">
            <div className="panel-head"><div><h2>{selected.part}</h2><p>{selected.dev} · {selected.root}</p></div><Pill tone={selected.severity === "Critical" ? "red" : "amber"}>{selected.severity}</Pill></div>
            <div className="knowledge-block"><span>Problem pattern</span><p>{selected.root} repeated in {selected.cases} case(s). Latest supplier: {selected.supplier}.</p></div>
            <div className="knowledge-block"><span>Recommended action</span><p>{selected.action}</p></div>
            <div className="knowledge-block highlight"><span>If similar case appears again</span><p>{selected.lesson}</p></div>
            <div className="mini-stats"><div><b>{selected.reusable}</b><span>Reusable</span></div><div><b>{selected.rejected}</b><span>Rejected</span></div><div><b>{selected.open}</b><span>Open</span></div></div>
          </aside>
        </section>
      </section>
    </main>
  );
}

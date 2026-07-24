"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Archive, BookOpenCheck, CheckCircle2, ClipboardList, ExternalLink, FileText, FolderOpen, History, Link2, PackageSearch, RefreshCw, Search, ShieldCheck } from "lucide-react";

const parts = [
  {
    part: "70196-03",
    cases: 1,
    selectedDev: "DEV260119",
    status: "CONDITIONAL_REUSE",
    rootCause: "Crack",
    date: "17 Jan 25",
    supplier: "Dong Tam",
    customer: "DC",
    lessonCode: "LL-00017",
    reviewStatus: "Reusable with conditions",
    issue: [
      "During manufacture, staking joint rotated when it did not crack; when it did not rotate, it cracked.",
      "Pushout force was 600–700 lbf, higher than the 325 lbf control limit.",
      "Valve has lighter operating force than similar solenoids; no customer complaint so far."
    ],
    actions: ["Order new punch", "Consult with DC team", "Complete join", "Review backstop spec"],
    result: "Accepted the current condition of slight rotation for the approved lot after review and verification.",
    lesson: "Accept slight rotation only when staking joint does not crack and functional checks remain acceptable.",
    scope: "Similar staking conditions and low-light force valves; approved lot and directly tested bobbins only.",
    verify: "Fit test, crack inspection, pull force test; re-check staking trial before reuse.",
  },
  {
    part: "53180-09",
    cases: 6,
    selectedDev: "DEV260142",
    status: "REUSABLE_WITH_CONDITIONS",
    rootCause: "Surface finish",
    date: "24 Jul 26",
    supplier: "Aster Precision",
    customer: "FPC",
    lessonCode: "LL-00031",
    reviewStatus: "Reusable with conditions",
    issue: ["Repeated surface crack after secondary machining.", "Crack risk increases when finish marks remain near the inspection zone.", "Prior cases were accepted only after containment and extra inspection."],
    actions: ["Contain current lot", "Inspect crack depth", "Apply polish step", "Document extra verification"],
    result: "Conditional reuse allowed only when no crack propagation is proven and finish meets inspection criteria.",
    lesson: "Do not reuse previous approval blindly. Reuse only if crack location, depth, and process condition match previous evidence.",
    scope: "Same part family, same machining process, same inspection location.",
    verify: "Visual inspection, depth check, dimensional confirmation, source evidence review.",
  },
  {
    part: "80005-01",
    cases: 6,
    selectedDev: "DEV260137",
    status: "UPDATE_PROPOSED",
    rootCause: "Fixture drift",
    date: "23 Jul 26",
    supplier: "Northline",
    customer: "FPC",
    lessonCode: "LL-00044",
    reviewStatus: "Needs review",
    issue: ["Dimension out of tolerance on datum B repeated across multiple lots.", "Prior action reduced drift but did not eliminate recurrence.", "Fixture wear condition may differ from approved lesson scope."],
    actions: ["Stop affected fixture", "Check datum B", "Compare prior approval", "Open lesson update"],
    result: "Pending reviewer decision because recurrence differs from previous accepted condition.",
    lesson: "If datum drift repeats after fixture correction, escalate to process review instead of applying old containment only.",
    scope: "Fixture-related dimensional drift only; not applicable to raw material variation.",
    verify: "CMM check, fixture wear log, first article comparison.",
  },
];

function Status({ value }: { value: string }) {
  const tone = value.includes("REJECT") ? "red" : value.includes("UPDATE") || value.includes("NEEDS") ? "amber" : "green";
  return <span className={`status ${tone}`}>{value.replaceAll("_", " ")}</span>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(parts[0]);
  const filtered = useMemo(() => parts.filter((p) => `${p.part} ${p.selectedDev} ${p.rootCause} ${p.supplier}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-title"><div className="logo">KH</div><div><h1>Deviation Knowledge Hub</h1><p>Part-first retrieval · lessons learned · evidence trail</p></div></div>
        <div className="header-actions"><button>Import</button><button>Import New</button><button><FolderOpen size={16}/>Data Folder</button><button><RefreshCw size={16}/>Refresh</button><span className="connected">● Connected</span></div>
      </header>

      <div className="main-grid">
        <aside className="left-panel">
          <section className="card search-card">
            <h2><Search size={16}/> Search & Filter</h2>
            <label>Keyword<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Part, DEV ID, root cause..." /></label>
            <label>Part Number<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="70196" /></label>
            <div className="button-row"><button className="primary">Search</button><button onClick={() => setQuery("")}>Reset</button></div>
          </section>

          <section className="card summary-card">
            <h2><PackageSearch size={16}/> Part Summary</h2>
            <div className="summary-row"><span>Total Parts</span><b>{parts.length}</b></div>
            <div className="summary-row"><span>Repeated Parts</span><b>{parts.filter((p) => p.cases > 1).length}</b></div>
            <div className="summary-row"><span>Total Cases</span><b>{parts.reduce((a, p) => a + p.cases, 0)}</b></div>
            <div className="summary-row"><span>Selected</span><b>{selected.part}</b></div>
          </section>

          <section className="card part-list">
            <h2>Part Knowledge Index</h2>
            {filtered.map((p) => <button key={p.part} className={selected.part === p.part ? "active" : ""} onClick={() => setSelected(p)}><span><b>{p.part}</b><small>{p.rootCause} · {p.selectedDev}</small></span><em>{p.cases} case(s)</em></button>)}
          </section>
        </aside>

        <section className="detail-view">
          <div className="part-header card">
            <button className="back">←</button>
            <div><p>PART</p><h2>{selected.part}</h2><span>Knowledge summary · Selected case {selected.selectedDev}</span></div>
            <div className="part-header-right"><span>{selected.cases} case found</span><Status value={selected.status}/></div>
          </div>

          <section className="knowledge-grid">
            <article className="knowledge-card problem">
              <div className="card-title"><span className="step orange">1</span><div><h3>VẤN ĐỀ ĐÃ GẶP</h3><p>What happened?</p></div></div>
              <ul>{selected.issue.map((item) => <li key={item}><AlertTriangle size={16}/>{item}</li>)}</ul>
              <div className="mini-block"><b><ClipboardList size={16}/> Action plan in source</b><p>{selected.result}</p></div>
            </article>

            <article className="knowledge-card action">
              <div className="card-title"><span className="step blue">2</span><div><h3>CÁCH ĐÃ XỬ LÝ</h3><p>What was done and result?</p></div></div>
              <div className="check-list">{selected.actions.map((a) => <div key={a}><CheckCircle2 size={17}/>{a}</div>)}</div>
              <div className="result-box"><b>Kết quả / Result</b><p>{selected.result}</p></div>
            </article>

            <article className="knowledge-card lesson">
              <div className="card-title"><span className="step green">3</span><div><h3>KINH NGHIỆM KHI LẶP LẠI</h3><p>What should next engineer do?</p></div></div>
              <div className="recommend"><ShieldCheck size={20}/><b>{selected.lesson}</b></div>
              <div className="mini-block"><b>PHẠM VI ÁP DỤNG</b><p>{selected.scope}</p></div>
              <div className="mini-block"><b>CẦN KIỂM TRA LẠI</b><p>{selected.verify}</p></div>
            </article>
          </section>

          <section className="bottom-grid">
            <div className="card history-card">
              <h2><History size={17}/> LỊCH SỬ VẤN ĐỀ CÙNG PART</h2>
              <table><thead><tr><th>DEV ID</th><th>Date</th><th>Issue</th><th>Root Cause</th></tr></thead><tbody><tr><td className="linkish">{selected.selectedDev}</td><td>{selected.date}</td><td>{selected.issue[0]}</td><td>{selected.rootCause}</td></tr></tbody></table>
              <p className="footer-note">Showing 1 of {selected.cases} record(s)</p>
            </div>

            <div className="card evidence-card">
              <h2><FileText size={17}/> EVIDENCE & REVIEW</h2>
              <div className="evidence-row"><span>Lesson code</span><b>{selected.lessonCode}</b></div>
              <div className="evidence-row"><span>Review status</span><Status value={selected.reviewStatus}/></div>
              <div className="evidence-row"><span>Verification needed</span><b>Yes</b></div>
              <div className="evidence-actions"><button><FileText size={15}/>Open Word</button><button><FileText size={15}/>Open PDF</button><button><FolderOpen size={15}/>Open Folder</button><button><Link2 size={15}/>Open Linked Evidence</button></div>
              <div className="preview"><ExternalLink size={18}/><p>Document preview placeholder for source Word/PDF/evidence image.</p></div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

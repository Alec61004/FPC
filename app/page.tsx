"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Filter,
  Package,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const parts = [
  {
    id: "53180-09",
    name: "Bracket housing, left side",
    supplier: "Aster Precision",
    product: "Drive module A12",
    customer: "Line 4 assembly",
    recurrence: 6,
    severity: "Critical",
    reviewStatus: "Human review needed",
    lastSeen: "2026-07-18",
    confidence: "High match",
    pattern: "Repeated surface crack after post-machining deburr and transport handling.",
    issue: "Surface crack found around the inner radius. Previous cases show the same mark after the deburr step, then worsened during tray transport.",
    solution: "Hold affected lot, inspect radius under 10x magnification, polish with controlled 500-grit pass, replace tray liner, then rerun final inspection.",
    lesson: "If this repeats, do not treat it as a cosmetic defect first. Check deburr pressure, tray contact point, and radius inspection records before release.",
    evidence: ["D-2026-001 CAPA extract", "Inspection photo set 53180-09", "Supplier 8D response"],
    deviations: [
      { id: "D-2026-001", date: "2026-07-18", issue: "Surface crack", action: "Lot hold + polish + tray liner change", status: "Open" },
      { id: "D-2026-014", date: "2026-06-22", issue: "Radius crack indication", action: "100% visual sort", status: "Closed" },
      { id: "D-2026-033", date: "2026-05-07", issue: "Post-deburr mark", action: "Deburr pressure reset", status: "Closed" },
    ],
  },
  {
    id: "80005-01",
    name: "Seal carrier plate",
    supplier: "Northline Components",
    product: "Pump module P7",
    customer: "Final test cell",
    recurrence: 4,
    severity: "Major",
    reviewStatus: "Lesson approved",
    lastSeen: "2026-07-09",
    confidence: "Medium match",
    pattern: "Dimension drift on slot width when tooling approaches scheduled changeover.",
    issue: "Slot width measured over upper tolerance. Trend appears in the final 18% of tool life.",
    solution: "Quarantine plates from the suspect tool window, run CMM confirmation, change tool early, and update sampling frequency near end of tool life.",
    lesson: "When slot drift repeats, compare measurement time with tool-life counter before opening a new root-cause branch.",
    evidence: ["CMM trend export", "Tool-life log", "Deviation D-2026-002"],
    deviations: [
      { id: "D-2026-002", date: "2026-07-09", issue: "Dimension out of spec", action: "CMM confirmation + early tool change", status: "Approved" },
      { id: "D-2026-021", date: "2026-06-02", issue: "Slot width high", action: "Sampling frequency updated", status: "Closed" },
    ],
  },
  {
    id: "53196-05",
    name: "Guide rail insert",
    supplier: "Orchid Machining",
    product: "Rail kit R3",
    customer: "Incoming QA",
    recurrence: 3,
    severity: "Minor",
    reviewStatus: "Draft lesson",
    lastSeen: "2026-06-30",
    confidence: "New grouping",
    pattern: "Burr at locating edge after batch cleaning.",
    issue: "Small burr found at the locating edge. It blocks smooth fixture seating during incoming check.",
    solution: "Segregate affected boxes, add edge swipe inspection, ask supplier for deburr confirmation record, then approve only cleaned parts.",
    lesson: "If a burr appears again, verify whether cleaning masked the deburr miss instead of assuming handling damage.",
    evidence: ["Incoming QA images", "Supplier cleaning log", "D-2026-003 worksheet"],
    deviations: [
      { id: "D-2026-003", date: "2026-06-30", issue: "Burr found", action: "Supplier deburr confirmation", status: "Reviewing" },
    ],
  },
];

function severityClass(severity: string) {
  return severity.toLowerCase();
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(parts[0].id);

  const filteredParts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return parts;
    return parts.filter((part) =>
      [part.id, part.name, part.supplier, part.pattern, part.issue].some((value) =>
        value.toLowerCase().includes(q)
      )
    );
  }, [query]);

  const selectedPart = parts.find((part) => part.id === selectedId) || filteredParts[0] || parts[0];
  const totalDeviations = parts.reduce((sum, part) => sum + part.recurrence, 0);
  const approvedLessons = parts.filter((part) => part.reviewStatus === "Lesson approved").length;

  return (
    <main className="app-shell">
      <aside className="rail" aria-label="Workspace navigation">
        <div className="brand-block">
          <div className="brand-mark">FPC</div>
          <div>
            <strong>KnowledgeHub</strong>
            <span>QMS intelligence</span>
          </div>
        </div>

        <nav className="nav-stack">
          <button className="nav-item active"><Package size={17} /> Part Intelligence</button>
          <button className="nav-item"><AlertTriangle size={17} /> Review Queue</button>
          <button className="nav-item"><BookOpen size={17} /> Approved Lessons</button>
          <button className="nav-item"><Archive size={17} /> Evidence Library</button>
        </nav>

        <div className="sync-card">
          <ShieldCheck size={18} />
          <div>
            <strong>Human approval required</strong>
            <span>AI suggests grouping. Quality team approves reusable lessons.</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="hero-panel">
          <div>
            <p className="kicker">Part-centric QMS workspace</p>
            <h1>Click a part. See the problem, the fix, and what to do when it repeats.</h1>
          </div>
          <div className="operator-chip">Bao QA</div>
        </header>

        <section className="search-section" aria-label="Part search">
          <div className="search-box">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search part, supplier, issue, or deviation pattern"
              aria-label="Search part intelligence"
            />
          </div>
          <button className="filter-button"><Filter size={17} /> Filter</button>
        </section>

        <section className="metrics-row" aria-label="Knowledge summary">
          <div className="metric-card wide"><span>Tracked recurrence</span><strong>{totalDeviations}</strong><p>deviation links across selected parts</p></div>
          <div className="metric-card"><span>Approved lessons</span><strong>{approvedLessons}</strong><p>ready for reuse</p></div>
          <div className="metric-card"><span>Needs review</span><strong>{parts.length - approvedLessons}</strong><p>AI suggestions waiting</p></div>
        </section>

        <section className="work-grid">
          <div className="part-list-panel">
            <div className="panel-heading">
              <div><h2>Parts with recurrence</h2><p>This is the main product view, not a generic deviation table.</p></div>
              <span>{filteredParts.length} parts</span>
            </div>

            <div className="part-list">
              {filteredParts.map((part) => (
                <button key={part.id} className={`part-row ${selectedPart.id === part.id ? "selected" : ""}`} onClick={() => setSelectedId(part.id)}>
                  <div className="part-main">
                    <span className="part-number">{part.id}</span>
                    <strong>{part.name}</strong>
                    <p>{part.pattern}</p>
                  </div>
                  <div className="part-meta">
                    <span className={`severity ${severityClass(part.severity)}`}>{part.severity}</span>
                    <span>{part.recurrence} cases</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="intelligence-panel" aria-label="Selected part intelligence">
            <div className="panel-topline">
              <span className={`severity ${severityClass(selectedPart.severity)}`}>{selectedPart.severity}</span>
              <span>{selectedPart.reviewStatus}</span>
            </div>

            <div className="part-title-block">
              <span className="part-number large">{selectedPart.id}</span>
              <h2>{selectedPart.name}</h2>
              <p>{selectedPart.supplier} · {selectedPart.product} · {selectedPart.customer}</p>
            </div>

            <div className="recurrence-strip">
              <div><strong>{selectedPart.recurrence}</strong><span>linked deviations</span></div>
              <div><strong>{selectedPart.lastSeen}</strong><span>last seen</span></div>
              <div><strong>{selectedPart.confidence}</strong><span>classifier match</span></div>
            </div>

            <div className="guidance-stack">
              <article className="guidance-card problem"><header><AlertTriangle size={18} /><span>Vấn đề gặp phải</span></header><p>{selectedPart.issue}</p></article>
              <article className="guidance-card action"><header><Wrench size={18} /><span>Cách giải quyết</span></header><p>{selectedPart.solution}</p></article>
              <article className="guidance-card lesson"><header><CheckCircle2 size={18} /><span>Bài học nếu lặp lại</span></header><p>{selectedPart.lesson}</p></article>
            </div>

            <section className="timeline-section">
              <h3>Deviation history</h3>
              <div className="timeline-list">
                {selectedPart.deviations.map((deviation) => (
                  <div className="timeline-item" key={deviation.id}>
                    <span>{deviation.date}</span>
                    <div><strong>{deviation.id}</strong><p>{deviation.issue}</p><small>{deviation.action}</small></div>
                    <em>{deviation.status}</em>
                  </div>
                ))}
              </div>
            </section>

            <section className="evidence-section">
              <h3>Evidence close to advice</h3>
              {selectedPart.evidence.map((item) => (
                <button className="evidence-link" key={item}><FileText size={16} /> {item}</button>
              ))}
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

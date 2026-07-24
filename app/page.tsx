import { AlertTriangle, Archive, BookOpenCheck, ChevronDown, CircleDot, FileText, Filter, GitBranch, LayoutGrid, MessageSquareText, MoreHorizontal, PackageSearch, Search, ShieldCheck, Sparkles, TimerReset } from "lucide-react";

const deviations = [
  { id: "DEV-2026-0142", part: "53180-09", title: "Surface crack after secondary machining", supplier: "Aster Precision", status: "In review", severity: "Critical", recurrence: 6, root: "Surface finish", lesson: "Approved reuse", age: "2h" },
  { id: "DEV-2026-0137", part: "80005-01", title: "Dimension out of tolerance on datum B", supplier: "Northline", status: "Open", severity: "Major", recurrence: 6, root: "Fixture drift", lesson: "Update proposed", age: "1d" },
  { id: "DEV-2026-0128", part: "53196-05", title: "Burr found near edge radius inspection", supplier: "Horizon CNC", status: "Approved", severity: "Minor", recurrence: 5, root: "Deburr gap", lesson: "Approved reuse", age: "3d" },
  { id: "DEV-2026-0119", part: "54318-08", title: "Mixed condition: coating pinhole and handling mark", supplier: "V-Tech", status: "Needs evidence", severity: "Major", recurrence: 3, root: "Process handling", lesson: "Different scope", age: "5d" },
  { id: "DEV-2026-0104", part: "70050-08", title: "Repeat cosmetic mark near visual zone", supplier: "Mira Supply", status: "Closed", severity: "Minor", recurrence: 3, root: "Packaging", lesson: "Approved reuse", age: "8d" },
];

const patterns = [
  { name: "Surface finish / crack", count: 14, tone: "red" },
  { name: "Dimensional drift", count: 11, tone: "amber" },
  { name: "Burr / edge condition", count: 9, tone: "blue" },
  { name: "Packaging handling", count: 7, tone: "green" },
];

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export default function Home() {
  return (
    <main className="shell">
      <aside className="rail">
        <div className="brand"><div className="brand-mark">K</div><div><b>KnowledgeHub</b><span>QMS Intelligence</span></div></div>
        <nav className="nav-stack">
          <a className="active"><LayoutGrid size={16}/>Workspace</a>
          <a><PackageSearch size={16}/>Part Intelligence</a>
          <a><Archive size={16}/>Deviation Archive</a>
          <a><BookOpenCheck size={16}/>Lessons Learned</a>
          <a><GitBranch size={16}/>Review Queue</a>
        </nav>
        <div className="rail-card">
          <Sparkles size={16}/>
          <b>AI drafts only</b>
          <p>Human approval controls every reusable lesson.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Deviation Knowledge System</p>
            <h1>Part-centric QMS command center</h1>
          </div>
          <button className="ghost"><ShieldCheck size={16}/> Audit ready</button>
        </header>

        <section className="hero-card">
          <div className="search-panel">
            <div className="search-box"><Search size={20}/><input placeholder="Search part, deviation ID, supplier, root cause..." defaultValue="53180-09"/></div>
            <div className="quick-filters"><button><Filter size={14}/>Filter</button><button>Critical</button><button>Repeat only</button><button>Needs review</button></div>
          </div>
          <div className="part-summary">
            <div><p className="eyebrow">Selected part</p><h2>53180-09</h2></div>
            <div className="metric-row"><div><b>6</b><span>deviations</span></div><div><b>2</b><span>approved lessons</span></div><div><b>86%</b><span>match confidence</span></div></div>
          </div>
        </section>

        <section className="kpi-grid">
          <div className="kpi"><CircleDot/><span>Open deviations</span><b>37</b><small>12 waiting technical review</small></div>
          <div className="kpi"><TimerReset/><span>Repeat parts</span><b>24</b><small>7 critical recurrence clusters</small></div>
          <div className="kpi"><BookOpenCheck/><span>Reusable lessons</span><b>108</b><small>42 approved / 66 draft</small></div>
          <div className="kpi"><FileText/><span>Evidence links</span><b>356</b><small>Word, PDF, Excel source trail</small></div>
        </section>

        <section className="content">
          <div className="issue-board">
            <div className="section-head"><div><h3>Deviation records</h3><p>Plane-style issue table adapted for QMS review.</p></div><button className="ghost">View <ChevronDown size={14}/></button></div>
            <div className="table">
              {deviations.map((d) => (
                <div className="row" key={d.id}>
                  <div className="id"><AlertTriangle size={15}/>{d.id}</div>
                  <div className="title"><b>{d.title}</b><span>{d.supplier} · root cause: {d.root}</span></div>
                  <Badge tone={d.severity === "Critical" ? "red" : d.severity === "Major" ? "amber" : "green"}>{d.severity}</Badge>
                  <Badge tone="slate">{d.status}</Badge>
                  <div className="part-pill">{d.part}<small>{d.recurrence}x</small></div>
                  <Badge tone={d.lesson.includes("Approved") ? "green" : "blue"}>{d.lesson}</Badge>
                  <span className="age">{d.age}</span>
                  <MoreHorizontal size={16}/>
                </div>
              ))}
            </div>
          </div>

          <aside className="insight-panel">
            <div className="section-head"><div><h3>Part intelligence</h3><p>What to do if it repeats again.</p></div></div>
            <div className="recommendation"><Badge tone="blue">Recommended handling</Badge><h4>Reuse existing surface-finish containment, but require extra verification if crack depth exceeds prior scope.</h4><p>Based on 6 deviation sources and 2 approved lessons for part 53180-09.</p></div>
            <div className="patterns">
              <h4>Recurring patterns</h4>
              {patterns.map((p) => <div className="pattern" key={p.name}><span>{p.name}</span><Badge tone={p.tone}>{p.count}</Badge></div>)}
            </div>
            <div className="note"><MessageSquareText size={16}/><p>AI can draft a lesson update, but reviewer approval is required before reuse.</p></div>
          </aside>
        </section>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  desc,
  fieldAction,
  fieldDate,
  fieldDev,
  fieldIssue,
  fieldLesson,
  fieldPart,
  fieldStatus,
  getDeviations,
  type DeviationRecord,
} from "@/lib/api";

type Filters = { keyword: string; part: string; dev: string; supplier: string; customer: string; root: string };

const initialFilters: Filters = { keyword: "", part: "", dev: "", supplier: "", customer: "", root: "" };

function value(row: DeviationRecord, key: string) {
  const d = desc(row);
  return String((row as any)[key] || d[key] || d[key.replace(/_/g, " ")] || "");
}
function rootCause(row: DeviationRecord) { return row.root_cause || value(row, "Root Cause") || value(row, "Root Cause Category") || "Unidentified"; }
function supplier(row: DeviationRecord) { return value(row, "supplier") || value(row, "Supplier") || "-"; }
function customer(row: DeviationRecord) { return value(row, "customer") || value(row, "Customer") || "-"; }
function product(row: DeviationRecord) { return value(row, "product") || value(row, "Product") || "-"; }
function folder(row: DeviationRecord) { return value(row, "folder_rel") || value(row, "Folder") || "-"; }
function wordFile(row: DeviationRecord) { return value(row, "reference_word") || value(row, "Reference Word") || "-"; }
function pdfFile(row: DeviationRecord) { return value(row, "reference_pdf") || value(row, "Reference PDF") || "-"; }
function decision(row: DeviationRecord) { return row.decision || "Needs review"; }
function lessonCode(row: DeviationRecord) { return row.lesson_code || "-"; }

function badgeClass(text = "") {
  const s = text.toUpperCase();
  if (s.includes("REJECT") || s.includes("CONFLICT")) return "kh-badge kh-badge-red";
  if (s.includes("TEMP") || s.includes("BATCH")) return "kh-badge kh-badge-blue";
  if (s.includes("REUSABLE") || s.includes("APPROVED") || s.includes("CONDITION")) return "kh-badge kh-badge-green";
  return "kh-badge kh-badge-gray";
}
function includes(row: DeviationRecord, q: string) {
  if (!q) return true;
  const d = desc(row);
  const hay = [fieldPart(row), fieldDev(row), fieldIssue(row), fieldAction(row), fieldLesson(row), rootCause(row), supplier(row), customer(row), product(row), folder(row), wordFile(row), pdfFile(row), JSON.stringify(d)].join(" ").toUpperCase();
  return hay.includes(q.toUpperCase());
}
function partTokens(part: string) {
  return part.split(/[;,/\s]+/).map((x) => x.trim()).filter(Boolean).slice(0, 4);
}

export default function HomePage() {
  const [all, setAll] = useState<DeviationRecord[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [selectedPart, setSelectedPart] = useState<string>("");
  const [selected, setSelected] = useState<DeviationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getDeviations()
      .then((rows) => { setAll(rows); setError(""); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => all.filter((r) => {
    if (filters.part && !fieldPart(r).toUpperCase().includes(filters.part.toUpperCase())) return false;
    if (filters.dev && !fieldDev(r).toUpperCase().includes(filters.dev.toUpperCase())) return false;
    if (filters.supplier && !supplier(r).toUpperCase().includes(filters.supplier.toUpperCase())) return false;
    if (filters.customer && !customer(r).toUpperCase().includes(filters.customer.toUpperCase())) return false;
    if (filters.root && !rootCause(r).toUpperCase().includes(filters.root.toUpperCase())) return false;
    return includes(r, filters.keyword);
  }), [all, filters]);

  const parts = useMemo(() => {
    const map = new Map<string, DeviationRecord[]>();
    filtered.forEach((r) => partTokens(fieldPart(r)).forEach((p) => map.set(p, [...(map.get(p) || []), r])));
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  }, [filtered]);

  const visibleRows = useMemo(() => selectedPart ? (parts.find(([p]) => p === selectedPart)?.[1] || []) : filtered, [filtered, parts, selectedPart]);

  useEffect(() => {
    if (!selected && visibleRows.length) setSelected(visibleRows[0]);
  }, [visibleRows, selected]);

  const repeated = parts.filter(([, rows]) => rows.length > 1).length;
  const latest = filtered.map(fieldDate).filter(Boolean).sort().at(-1) || "-";
  const selectedRows = selectedPart ? visibleRows : selected ? visibleRows.filter((r) => fieldPart(r) === fieldPart(selected)) : visibleRows.slice(0, 8);

  return (
    <main className="kh-app">
      <aside className="kh-sidebar">
        <section className="kh-card">
          <h2 className="kh-card-title">⌕ Search & Filter</h2>
          <Filter label="Keyword" value={filters.keyword} placeholder="Search keyword..." onChange={(v) => setFilters({ ...filters, keyword: v })} />
          <Filter label="Part Number" value={filters.part} placeholder="Enter part number..." onChange={(v) => { setFilters({ ...filters, part: v }); setSelectedPart(""); }} />
          <Filter label="DEV ID" value={filters.dev} placeholder="Enter DEV ID..." onChange={(v) => setFilters({ ...filters, dev: v })} />
          <Filter label="Supplier" value={filters.supplier} placeholder="Enter supplier..." onChange={(v) => setFilters({ ...filters, supplier: v })} />
          <Filter label="Customer" value={filters.customer} placeholder="Enter customer..." onChange={(v) => setFilters({ ...filters, customer: v })} />
          <Filter label="Root Cause" value={filters.root} placeholder="Enter root cause..." onChange={(v) => setFilters({ ...filters, root: v })} />
          <div className="kh-search-actions"><button className="kh-primary">Search</button><button className="kh-secondary" onClick={() => { setFilters(initialFilters); setSelectedPart(""); }}>Reset</button></div>
        </section>

        <section className="kh-card kh-summary">
          <h2 className="kh-card-title">◫ Part Summary</h2>
          <Metric label="Total Parts" value={String(parts.length)} />
          <Metric label="Repeated Parts" value={String(repeated)} />
          <Metric label="Total Cases" value={String(filtered.length)} />
          <Metric label="Last Updated" value={latest} />
          <div className="kh-mini-table">
            <div className="kh-mini-head"><span>Part</span><span>Cases</span><span>Top Root Cause</span></div>
            {parts.slice(0, 7).map(([p, rows]) => {
              const topRoot = rootCause(rows[0]);
              return <button key={p} className={`kh-mini-row ${selectedPart === p ? "active" : ""}`} onClick={() => { setSelectedPart(p); setSelected(rows[0]); }}><span>{p}</span><span>{rows.length}</span><span>{topRoot}</span></button>;
            })}
          </div>
        </section>

        <section className="kh-card kh-lessons">
          <h2 className="kh-card-title">✎ Part Lessons</h2>
          <div className="kh-lesson-text">
            <b>Key Lesson</b>
            <p>{selected ? fieldLesson(selected) : "Select a deviation to view reusable lessons."}</p>
            <b>Reusable For</b>
            <p>{selected?.reusable_for || fieldStatus(selected || {}) || "-"}</p>
            <b>Reference</b>
            <p>{selected ? `${wordFile(selected)} / ${pdfFile(selected)}` : "-"}</p>
          </div>
        </section>
      </aside>

      <section className="kh-main-card">
        <div className="kh-results-top">
          <div><h1>Results</h1><p>{selectedPart ? `Part ${selectedPart} • ${visibleRows.length} case(s) • ${rootCause(visibleRows[0] || {})}` : `${filtered.length} deviation(s) | ${parts.length} Part(s)`}</p></div>
          <div className="kh-api-state">{loading ? "Loading..." : error ? error : "● Connected"}</div>
        </div>

        <div className="kh-table-wrap">
          <table className="kh-table">
            <thead><tr><th>Part</th><th>DEV ID</th><th>Issue</th><th>Root Cause</th><th>Decision</th><th>Status</th><th>Lesson Code</th></tr></thead>
            <tbody>
              {visibleRows.map((r, i) => <tr key={`${fieldDev(r)}-${i}`} className={selected === r ? "selected" : ""} onClick={() => setSelected(r)} onDoubleClick={() => setSelected(r)}><td>{fieldPart(r)}</td><td className="mono">{fieldDev(r)}</td><td>{fieldIssue(r)}</td><td>{rootCause(r)}</td><td><span className={badgeClass(decision(r))}>{decision(r)}</span></td><td><span className={badgeClass(fieldStatus(r))}>{fieldStatus(r)}</span></td><td className="mono">{lessonCode(r)}</td></tr>)}
            </tbody>
          </table>
        </div>

        <div className="kh-actions"><button className="kh-primary">Open Detail</button><button className="kh-secondary">Open Folder</button><button className="kh-secondary">Open Word</button><button className="kh-secondary">Open PDF</button><button className="kh-secondary">Open Evidence</button><button className="kh-secondary right">Export Full Data</button></div>

        <section className="kh-detail-pane">
          <div className="kh-detail-left">
            <div className="kh-detail-title"><b>{selected ? `${fieldDev(selected)} • Part ${fieldPart(selected)}` : "Select a deviation"}</b><span>{selected ? `Supplier: ${supplier(selected)}   •   Customer: ${customer(selected)}   •   Root cause: ${rootCause(selected)}` : ""}</span></div>
            <DetailBlock title="ISSUE" text={selected ? fieldIssue(selected) : "Select a deviation to view the knowledge summary and evidence."} />
            <DetailBlock title="ACTION / TEST" text={selected ? fieldAction(selected) : ""} />
            <DetailBlock title="CONCLUSION / LESSON LEARNED" text={selected ? fieldLesson(selected) : ""} />
          </div>
          <div className="kh-evidence-panel">
            <div className="kh-evidence-toolbar"><b>Evidence</b><input placeholder="Search evidence" /><select><option>All</option><option>PDF</option><option>DOCX</option><option>PNG</option></select><select><option>Name</option><option>Type</option></select></div>
            <div className="kh-evidence-list"><div className="kh-evidence-head"><span>Name</span><span>Type</span><span>Folder</span><span>Size</span></div>{selected && <><div className="kh-evidence-row"><span>{wordFile(selected)}</span><span>DOCX</span><span>Source</span><span>-</span></div><div className="kh-evidence-row"><span>{pdfFile(selected)}</span><span>PDF</span><span>Source</span><span>-</span></div></>}</div>
            <div className="kh-preview"><div className="kh-preview-doc"><b>FPC DEVIATION APPROVAL</b><p>{selected ? fieldIssue(selected) : "Double-click evidence to open"}</p><p className="muted">Page 1 / 2</p></div></div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Filter({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) { return <label className="kh-filter"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="kh-metric"><span>{label}</span><b>{value}</b></div>; }
function DetailBlock({ title, text }: { title: string; text: string }) { return <div className="kh-detail-block"><h3>{title}</h3><p>{text || "-"}</p></div>; }

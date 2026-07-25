"use client";
import { useMemo, useState } from 'react'
import { dmsData, summary } from './data'

type Row = (typeof dmsData)[number]

const red = '#E1251B'

function short(text: string, n = 120) {
  if (!text) return 'No description captured'
  return text.length > n ? `${text.slice(0, n).trim()}...` : text
}

function statusFor(row: Row, index: number) {
  if (row.has_review) return index % 5 === 0 ? 'IN PROGRESS' : 'CLOSED'
  return index % 3 === 0 ? 'OPEN' : 'IN PROGRESS'
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN: 'bg-[#FDE9C2] text-[#B4690E]',
    'IN PROGRESS': 'bg-[#D7E6FB] text-[#1E4FA3]',
    CLOSED: 'bg-[#C9F0DA] text-[#0B7A46]',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${map[status]}`}>{status}</span>
}

function Sidebar() {
  const items = ['Dashboard', 'Deviations', 'Parts', 'CAPA Board', 'Reports', 'Analytics', 'Settings']
  return (
    <aside className="fixed left-0 top-[72px] hidden h-[calc(100dvh-72px)] w-[230px] border-r border-[#E5E7EB] bg-white lg:block">
      <nav className="space-y-1 p-4">
        {items.map((item, i) => (
          <a key={item} className={`flex h-11 items-center rounded-xl px-4 text-sm font-semibold ${i === 0 ? 'bg-[#14284B] text-white' : 'text-[#14284B] hover:bg-[#F4F6F9]'}`} href="#">
            <span className="mr-3 h-2 w-2 rounded-full" style={{ background: i === 0 ? red : '#CBD5E1' }} />
            {item}
          </a>
        ))}
      </nav>
    </aside>
  )
}

function Topbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#E5E7EB] bg-[#14284B] px-6 text-white shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-[#E1251B]">D</div>
        <div>
          <div className="text-lg font-extrabold tracking-tight">Deltrol Controls</div>
          <div className="text-xs text-white/70">Deviation Management System</div>
        </div>
      </div>
      <div className="hidden items-center gap-3 md:flex">
        <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15">Review Queue</button>
        <button className="rounded-lg bg-[#E1251B] px-4 py-2 text-sm font-bold text-white">+ New Deviation</button>
      </div>
    </header>
  )
}

function KpiCards({ rows }: { rows: Row[] }) {
  const open = rows.filter((r, i) => statusFor(r, i) !== 'CLOSED').length
  const closed = rows.length - open
  const missingReview = Math.max(0, summary.parts_with_deviation_without_review)
  const cards = [
    ['Open Deviations', open, 'Need engineering review'],
    ['Closed This Month', closed, 'Approved or resolved cases'],
    ['Overdue', missingReview, 'Parts with no curated lesson'],
    ['Avg Resolution', '12.4d', 'Estimated from imported history'],
  ]
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, note], i) => (
        <article key={label} className="rounded-[14px] border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_24px_rgba(20,40,75,0.06)]">
          <div className="text-sm font-semibold text-[#6b7280]">{label}</div>
          <div className={`mt-3 text-3xl font-extrabold ${i === 2 ? 'text-[#c62828]' : 'text-[#14284B]'}`}>{value}</div>
          <div className="mt-2 text-xs text-[#6b7280]">{note}</div>
        </article>
      ))}
    </section>
  )
}

function DashboardCharts({ rows }: { rows: Row[] }) {
  const causes = Object.entries(rows.reduce((acc: Record<string, number>, r) => {
    const key = r.root_cause || 'Unclassified'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const years = Object.entries(rows.reduce((acc: Record<string, number>, r) => {
    const y = String(r.date || '').slice(0, 4) || 'Unknown'
    acc[y] = (acc[y] || 0) + 1
    return acc
  }, {})).sort()
  return (
    <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-extrabold text-[#14284B]">Deviations by Year</h3>
        <div className="mt-6 flex h-64 items-end gap-5 border-b border-l border-[#E5E7EB] px-4">
          {years.map(([year, count]) => (
            <div key={year} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-lg bg-[#2563EB]" style={{ height: `${Math.max(20, Number(count) * 3)}px` }} />
              <span className="text-xs font-bold text-[#6b7280]">{year}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-extrabold text-[#14284B]">Root Cause Breakdown</h3>
        <div className="mt-5 space-y-4">
          {causes.map(([cause, count]) => (
            <div key={cause}>
              <div className="mb-1 flex justify-between text-sm"><span className="font-semibold text-[#14284B]">{cause}</span><span className="text-[#6b7280]">{count}</span></div>
              <div className="h-2 rounded-full bg-[#E5E7EB]"><div className="h-2 rounded-full bg-[#E1251B]" style={{ width: `${Math.min(100, Number(count) / rows.length * 500)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DeviationTable({ rows, onSelect }: { rows: Row[]; onSelect: (r: Row) => void }) {
  return (
    <section className="rounded-[14px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-5 md:flex-row md:items-center md:justify-between">
        <div><h2 className="text-xl font-extrabold text-[#14284B]">Deviation Reports</h2><p className="text-sm text-[#6b7280]">Live view from Excel and Word curated KnowledgeHub preview.</p></div>
        <button className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-bold text-white">+ New Deviation</button>
      </div>
      <div className="grid gap-3 border-b border-[#E5E7EB] p-5 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr]">
        <input className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" placeholder="Search DEV ID, part, issue" />
        <select className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"><option>All Years</option><option>2024</option><option>2025</option><option>2026</option></select>
        <select className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"><option>All Status</option><option>Open</option><option>Closed</option></select>
        <select className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm"><option>All Root Causes</option></select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
          <thead className="bg-[#F4F6F9] text-xs uppercase tracking-wide text-[#6b7280]"><tr>{['DEV ID','Part No / Name','Affected Product','Defect Description','Status','Date','Assigned To','Actions'].map(h => <th key={h} className="px-5 py-3 font-extrabold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {rows.slice(0, 14).map((row, i) => <tr key={`${row.business_key}-${i}`} onClick={() => onSelect(row)} className="cursor-pointer hover:bg-[#F4F6F9]"><td className="px-5 py-4 font-bold text-[#2f6bff]">{row.dev_code || `DEV-${i+1}`}</td><td className="px-5 py-4"><div className="font-bold text-[#14284B]">{row.part}</div><div className="text-xs text-[#6b7280]">{row.supplier || 'Supplier N/A'}</div></td><td className="px-5 py-4 text-[#14284B]">{row.product}</td><td className="max-w-[320px] px-5 py-4 text-[#374151]">{short(row.issue, 95)}</td><td className="px-5 py-4"><StatusPill status={statusFor(row, i)} /></td><td className="px-5 py-4 text-[#6b7280]">{String(row.date).slice(0, 10) || 'N/A'}</td><td className="px-5 py-4 text-[#14284B]">QC Engineer</td><td className="px-5 py-4 font-bold">...</td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[#E5E7EB] p-5 text-sm text-[#6b7280]"><span>Showing 1-14 of {rows.length} Deviations</span><div className="flex gap-2"><button className="rounded-lg border px-3 py-1">Previous</button><button className="rounded-lg bg-[#14284B] px-3 py-1 text-white">1</button><button className="rounded-lg border px-3 py-1">2</button><button className="rounded-lg border px-3 py-1">Next</button></div></div>
    </section>
  )
}

function DetailPanel({ row }: { row: Row }) {
  const review = row.review
  return (
    <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-[14px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-[#14284B]">Deviation Detail - {row.dev_code}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Info label="Part No" value={row.part} /><Info label="Affected Products" value={row.product} /><Info label="Supplier" value={row.supplier || 'N/A'} /><Info label="Customer" value={row.customer || 'N/A'} />
        </div>
        <h3 className="mt-6 font-extrabold text-[#14284B]">Defect Description</h3><p className="mt-2 rounded-xl bg-[#F4F6F9] p-4 text-sm leading-6 text-[#374151]">{row.issue}</p>
        <h3 className="mt-6 font-extrabold text-[#14284B]">Root Cause Analysis</h3><div className="mt-2 rounded-xl border border-[#E5E7EB] p-4"><span className="rounded-lg bg-[#FDE9C2] px-3 py-1 text-sm font-bold text-[#B4690E]">{row.root_cause || 'Unclassified'}</span><p className="mt-3 text-sm text-[#374151]">{row.solution || 'No solution captured in source row.'}</p></div>
        <h3 className="mt-6 font-extrabold text-[#14284B]">Corrective Actions</h3><label className="mt-2 flex items-start gap-3 rounded-xl border border-[#E5E7EB] p-4 text-sm"><input type="checkbox" className="mt-1" />{row.actions || 'Review original evidence folder before release.'}</label>
      </article>
      <aside className="space-y-5">
        <article className="rounded-[14px] border border-[#E5E7EB] bg-white p-6 shadow-sm"><h3 className="font-extrabold text-[#14284B]">Part Intelligence</h3>{review ? <div className="mt-4 space-y-3 text-sm leading-6 text-[#374151]"><p><b>Risk:</b> {review.technical_risk}</p><p><b>Engineering review:</b> {review.engineering_review}</p><p><b>Next time:</b> {review.next_time_action}</p></div> : <p className="mt-4 text-sm text-[#c62828]">No curated lesson yet. Add to Review Queue.</p>}</article>
        <article className="rounded-[14px] border border-[#E5E7EB] bg-white p-6 shadow-sm"><h3 className="font-extrabold text-[#14284B]">Activity Timeline</h3><div className="mt-4 space-y-4 text-sm"><Timeline color="#2563EB" text="Deviation imported from KnowledgeHub Excel." /><Timeline color="#E1251B" text="Raw evidence folder linked from Cloudflare R2 manifest." /><Timeline color="#0B7A46" text={review ? 'Curated part lesson matched from Word review.' : 'Pending engineering review.'} /></div></article>
      </aside>
    </section>
  )
}
function Info({ label, value }: { label: string; value: string }) { return <div><div className="text-xs font-bold uppercase text-[#6b7280]">{label}</div><div className="mt-1 font-semibold text-[#14284B]">{value}</div></div> }
function Timeline({ color, text }: { color: string; text: string }) { return <div className="flex gap-3"><span className="mt-1 h-3 w-3 rounded-full" style={{ background: color }} /><span className="text-[#374151]">{text}</span></div> }

export default function App() {
  const [selected, setSelected] = useState<Row>(dmsData[0])
  const rows = useMemo(() => [...dmsData], [])
  return <div><Topbar /><Sidebar /><main className="min-h-[100dvh] pt-[72px] lg:pl-[230px]"><div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-8"><div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-bold text-[#E1251B]">KnowledgeHub connected prototype</p><h1 className="text-3xl font-extrabold tracking-tight text-[#14284B]">Deviation Management Dashboard</h1><p className="mt-2 text-[#6b7280]">Showing {summary.excel_rows} Excel deviation rows, {summary.word_review_parts} reviewed parts and R2 raw-folder manifest integration.</p></div><div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#14284B]">DB: Supabase Postgres · Files: Cloudflare R2</div></div><KpiCards rows={rows} /><DashboardCharts rows={rows} /><DeviationTable rows={rows} onSelect={setSelected} /><DetailPanel row={selected} /></div></main></div>
}

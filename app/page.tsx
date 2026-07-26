"use client";

const cards = [
  ["Total Parts", "5", "Part-centered library."],
  ["Total Cases", "5", "Imported structured cases."],
  ["Repeated Issue Parts", "3", "Watch these first."],
  ["Missing Evidence", "1", "Need review."],
  ["Temporary / Lot Specific", "1", "Batch only."],
  ["Rejected Cases", "1", "Do not reuse."],
  ["Reusable Lessons", "2", "Approved knowledge."],
  ["Conditional Reuse", "2", "Needs verification."],
];

export default function DashboardPrototype() {
  return (
    <div className="h-full overflow-auto bg-white p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Part-centered deviation knowledge, lessons and evidence readiness.</p>
        </div>
        <button className="rounded bg-[#2563EB] px-4 py-2 text-sm font-bold text-white">Clear Filter</button>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {cards.map(([title, value, sub], i) => (
          <div key={title} className={`rounded-lg border p-5 shadow-sm ${i === 5 ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">{title}</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
            <div className="mt-1 text-xs text-slate-500">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Panel title="Recent Part Issues">
          <table className="w-full text-sm"><thead><tr className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500"><th className="p-3">Part</th><th>DEV ID</th><th>Issue</th><th>Decision</th><th>Status</th></tr></thead><tbody><tr className="border-b"><td className="p-3 font-bold text-blue-600">34320-02</td><td>DEV250928</td><td>Crimp height below minimum</td><td>REJECT</td><td><span className="badge badge-red">REJECTED</span></td></tr></tbody></table>
        </Panel>
        <Panel title="Need Review" right="Evidence driven">
          <table className="w-full text-sm"><thead><tr className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500"><th className="p-3">Part</th><th>Reason</th><th>Action</th></tr></thead><tbody>{[["53180-09","TEMPORARY / LOT-SPECIFIC"],["34320-02","REJECTED"],["88901-08","Missing evidence"]].map(r=><tr key={r[0]} className="border-b"><td className="p-3 font-bold text-blue-600">{r[0]}</td><td>{r[1]}</td><td>Review condition</td></tr>)}</tbody></table>
        </Panel>
        <Panel title="Top Repeated Parts" right="Click part to review">
          <table className="w-full text-sm"><thead><tr className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500"><th className="p-3">Part</th><th>Cases</th><th>Main Pattern</th><th>Latest Lesson</th></tr></thead><tbody>{[["70196-03","Crack","LL-00017"],["53180-09","Dimension out of specification","LL-00012"],["54101-09","Dimension out of specification","LL-00045"]].map(r=><tr key={r[0]} className="border-b"><td className="p-3 font-bold text-blue-600">{r[0]}</td><td>1</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table>
        </Panel>
        <Panel title="Latest Approved Lessons" right="Reusable knowledge">
          <table className="w-full text-sm"><thead><tr className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500"><th className="p-3">Lesson</th><th>Part</th><th>Scope</th></tr></thead><tbody><tr className="border-b"><td className="p-3 font-bold">LL-00017</td><td className="font-bold text-blue-600">70196-03</td><td>Thông số cần giữ: .41</td></tr><tr><td className="p-3 font-bold">LL-00045</td><td className="font-bold text-blue-600">54101-09</td><td>Approved lot and directly tested bobbins only.</td></tr></tbody></table>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, right, children }: any) { return <section className="rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b p-4"><h2 className="font-extrabold text-slate-800">{title}</h2>{right && <span className="text-xs font-semibold text-slate-400">{right}</span>}</div>{children}</section>; }

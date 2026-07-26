"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getEvidence,
  getPartDeviations,
  fieldAction,
  fieldDate,
  fieldDev,
  fieldIssue,
  fieldLesson,
  fieldPart,
  fieldStatus,
  type DeviationRecord,
} from "@/lib/api";

function badge(value = "") {
  const s = value.toUpperCase();
  if (s.includes("REJECT")) return "bg-[#FEE2E2] text-[#DC2626]";
  if (s.includes("TEMP") || s.includes("BATCH")) return "bg-[#DBEAFE] text-[#1D4ED8]";
  return "bg-[#D1FAE5] text-[#047857]";
}

export default function PartDetailPage() {
  const params = useParams<{ partNo: string }>();
  const partNo = decodeURIComponent(params.partNo || "");
  const [rows, setRows] = useState<DeviationRecord[]>([]);
  const [selected, setSelected] = useState<DeviationRecord | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPartDeviations(partNo)
      .then((data) => {
        setRows(data);
        setSelected(data[0] || null);
      })
      .finally(() => setLoading(false));
  }, [partNo]);

  useEffect(() => {
    if (!selected) return;
    getEvidence(fieldDev(selected)).then(setFiles).catch(() => setFiles([]));
  }, [selected]);

  const current = selected || rows[0];
  const summary = useMemo(
    () => ({ total: rows.length, repeated: Math.max(0, rows.length - 1), last: rows[0]?.updated_at || rows[0]?.created_at || "-" }),
    [rows]
  );

  if (loading) return <main className="p-6 text-sm text-[#6B7280]">Loading part detail...</main>;

  return (
    <main className="grid min-h-[calc(100dvh-72px)] grid-cols-[230px_1fr_400px] overflow-hidden bg-[#F4F6F9]">
      <aside className="overflow-y-auto border-r border-[#E5E7EB] bg-white p-4">
        <div className="mb-4 text-[15px] font-bold text-[#14284B]">Part {partNo}</div>
        <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-sm">
          <div className="font-bold text-[#14284B]">Part Summary</div>
          <div>Total Cases: {summary.total}</div>
          <div>Repeated Parts: {summary.repeated}</div>
          <div>Last Updated: {summary.last}</div>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
          <div className="font-bold text-[#14284B]">Part Lessons</div>
          <div className="mt-2 text-[#374151]">{current?.key_lesson || current?.what_to_remember || "-"}</div>
        </div>
      </aside>

      <section className="overflow-y-auto p-5">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] pb-3">
            <div>
              <div className="text-[22px] font-extrabold text-[#14284B]">PART {partNo}</div>
              <div className="text-xs text-[#6B7280]">{rows.length} case found</div>
            </div>
            {current && (
              <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${badge(current.status || current.decision || "")}`}>
                {current.status || current.decision || "Reviewed"}
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-4">
            <Card n="1" title="VẤN ĐỀ ĐÃ GẶP" accent="orange" text={current?.what_happened || current?.defect_description || current?.issue || "-"} />
            <Card n="2" title="CÁCH ĐÃ XỬ LÝ" accent="blue" text={current ? current.what_was_done || fieldAction(current) : "-"} />
            <Card n="3" title="KINH NGHIỆM KHI LẶP LẠI" accent="green" text={current ? current.what_to_remember || fieldLesson(current) : "-"} />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-bold text-[#14284B]">LỊCH SỬ VẤN ĐỀ CÙNG PART</div>
            <div className="text-xs text-[#6B7280]">{rows.length} records</div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-[#6B7280]"><tr><th className="pb-2">DEV ID</th><th className="pb-2">Date</th><th className="pb-2">Issue</th><th className="pb-2">Root Cause</th></tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i} onClick={() => setSelected(r)} className={`cursor-pointer border-t border-[#E5E7EB] ${selected === r ? "bg-[#EFF6FF]" : ""}`}><td className="py-3 font-mono font-semibold text-[#1B4C8C]"><Link href={`/parts/${encodeURIComponent(fieldPart(r))}`}>{fieldDev(r)}</Link></td><td>{fieldDate(r)}</td><td>{fieldIssue(r)}</td><td>{r.root_cause || "-"}</td></tr>)}</tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="font-bold text-[#14284B]">EVIDENCE & REVIEW</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <Info label="Lesson Code" value={current?.lesson_code || "-"} />
            <Info label="Review Status" value={current ? fieldStatus(current) : "-"} />
            <Info label="Decision" value={current?.decision || "-"} />
            <Info label="Verification Needed" value={current?.verification_needed || "Yes"} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2"><button className="btn">Open Word</button><button className="btn">Open PDF</button><button className="btn">Open Folder</button><button className="btn">Open Evidence</button></div>
        </div>
      </section>

      <aside className="overflow-y-auto border-l border-[#E5E7EB] bg-white p-4">
        <div className="mb-3 text-[15px] font-bold text-[#14284B]">Evidence Panel</div>
        <input className="mb-3 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" placeholder="Search evidence..." />
        {files.length ? files.map((f, i) => <div key={i} className="mb-2 rounded-lg border border-[#E5E7EB] p-3 text-sm"><div className="font-semibold">{f.filename || f.name}</div><div className="text-xs text-[#6B7280]">{f.media_type || "file"} · {f.size || "-"} bytes</div></div>) : <div className="rounded-lg border border-dashed border-[#E5E7EB] p-4 text-sm text-[#6B7280]">No evidence loaded yet.</div>}
        <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-sm"><div className="mb-2 font-bold text-[#14284B]">Preview</div><div className="h-64 rounded border border-[#E5E7EB] bg-white p-3 text-xs text-[#6B7280]">PDF/Image preview area</div></div>
      </aside>
    </main>
  );
}

function Card({ n, title, accent, text }: { n: string; title: string; accent: "orange" | "blue" | "green"; text: string }) {
  const color = { orange: "bg-orange-50 text-orange-600", blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600" }[accent];
  return <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm"><div className="mb-2 flex items-center gap-2"><div className={`grid h-8 w-8 place-items-center rounded-lg font-bold ${color}`}>{n}</div><div className="font-bold text-[#14284B]">{title}</div></div><div className="text-sm leading-6 text-[#374151]">{text}</div></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[#E5E7EB] p-3"><div className="text-xs text-[#6B7280]">{label}</div><div className="font-semibold text-[#14284B]">{value}</div></div>;
}

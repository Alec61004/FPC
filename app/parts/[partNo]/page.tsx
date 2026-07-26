"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

export default function PartDetailPage() {
  const { partNo } = useParams();
  const [cases, setCases] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/deviations/part/${partNo}`).then((data) => {
      setCases(data);
      if (data.length > 0) setSelected(data[0]);
      setLoading(false);
    });
  }, [partNo]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <main className="grid h-[calc(100dvh-56px)] grid-cols-[260px_1fr_400px] overflow-hidden bg-[#F5F7FA]">
      {/* Cột 1: Sidebar Filter & Summary */}
      <aside className="border-r border-[#E2E6EC] bg-white p-4">
        <h2 className="font-bold text-[#0F2540] mb-4">Part: {partNo}</h2>
        <div className="bg-blue-50 p-3 rounded border border-blue-100 text-xs text-blue-900 mb-6">
          <div className="font-bold">Summary</div>
          <div>Total Cases: {cases.length}</div>
        </div>
        <div className="text-xs text-gray-500">Filters thu gọn...</div>
      </aside>

      {/* Cột 2: Case Content */}
      <section className="p-6 overflow-y-auto">
        {selected ? (
          <div className="space-y-4">
            <div className="bg-[#14284B] text-white p-4 rounded-lg flex justify-between items-center">
              <h1 className="text-xl font-bold">Part {partNo}</h1>
              <span className="bg-green-500 px-2 py-0.5 rounded text-[10px] font-bold">{selected.decision}</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Card title="VẤN ĐỀ ĐÃ GẶP" icon="⚠️" color="orange" text={selected.defect_description} />
              <Card title="CÁCH ĐÃ XỬ LÝ" icon="🔧" color="blue" text={selected.root_cause} />
              <Card title="KINH NGHIỆM KHI LẶP LẠI" icon="🛡️" color="green" text={selected.key_lesson} />
            </div>

            <div className="bg-white border rounded p-4 mt-6">
               <h3 className="font-bold mb-2">Lịch sử vấn đề</h3>
               <table className="w-full text-xs">
                 <thead className="text-left text-gray-400 border-b"><tr><th>DEV ID</th><th>Date</th></tr></thead>
                 <tbody>{cases.map(c => <tr key={c.id} className="border-b"><td>{c.dev_code}</td><td>{c.deviation_date}</td></tr>)}</tbody>
               </table>
            </div>
          </div>
        ) : <div>No case selected</div>}
      </section>

      {/* Cột 3: Evidence Panel */}
      <aside className="border-l bg-white p-4">
        <h2 className="font-bold text-[#0F2540] mb-4">Evidence</h2>
        <div className="text-xs text-gray-500 italic">Preview pane ready...</div>
      </aside>
    </main>
  );
}

function Card({title, icon, color, text}: any) {
  const colors = { orange: "text-orange-600 bg-orange-50", blue: "text-blue-600 bg-blue-50", green: "text-green-600 bg-green-50" };
  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className={`p-1.5 rounded ${colors[color as keyof typeof colors]}`}>{icon}</span>
        <h3 className="font-bold text-[#0F2540]">{title}</h3>
      </div>
      <p className="text-sm text-gray-700">{text || "..."}</p>
    </div>
  );
}

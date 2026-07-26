"use client";
import { cases } from "@/lib/mockData";
import Link from "next/link";
export default function Dashboard() {
  const open = cases.filter(c=>c.status.includes('REUSABLE')||c.status.includes('MISSING')).length;
  const closed = cases.filter(c=>c.decision==='REJECTED').length;
  const overdue = 1;
  const avg = 3.5;
  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Parts" value={new Set(cases.map(c=>c.partNo)).size} color="navy"/>
        <KPICard title="Total Cases" value={cases.length} color="blue"/>
        <KPICard title="Missing Evidence" value={cases.filter(c=>c.status.includes('MISSING')).length} color="orange"/>
        <KPICard title="Rejected Cases" value={closed} color="red"/>
      </div>
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="font-bold mb-4 text-sm uppercase text-gray-500">Recent Issues</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-gray-400 text-left"><th className="pb-2 font-medium">Part</th><th className="pb-2 font-medium">Issue</th><th className="pb-2 font-medium">Status</th></tr></thead>
          <tbody>{cases.map(c=>(
            <tr key={c.devId} className="border-b hover:bg-gray-50">
              <td className="py-3 text-[#14284B] font-mono font-semibold"><Link href={`/parts/${c.partNo}`}>{c.partNo}</Link></td>
              <td className="py-3">{c.issue}</td>
              <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.decision==='REJECTED'?'bg-red-100 text-red-700':c.decision==='MISSING_EVIDENCE'?'bg-orange-100 text-orange-700':'bg-green-100 text-green-700'}`}>{c.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
function KPICard({title,value,color}:any){
  const colors={navy:"text-[#14284B]",blue:"text-[#2563EB]",red:"text-[#c62828]",orange:"text-[#B4690E]"};
  return <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"><div className="text-gray-500 text-xs mb-1 uppercase">{title}</div><div className={`text-3xl font-bold ${colors[color as keyof typeof colors]}`}>{value}</div></div>
}

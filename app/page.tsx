"use client";
import { useEffect, useState } from "react";
import CreateDeviation from "./deviation/create";

type Deviation = {
  id: string;
  business_key: string;
  title: string | null;
  description: string | null;
  part_id: number | null;
};

export default function KnowledgeHub() {
  const [list, setList] = useState<Deviation[]>([]);
  const [selected, setSelected] = useState<Deviation | null>(null);

  useEffect(() => {
    // Gọi thẳng vào server FastAPI đang chạy local hoặc production
    // Nếu deploy Vercel, anh cần đổi URL này thành URL của server backend đã deploy
    fetch("http://localhost:8000/api/deviations") 
      .then(res => res.json())
      .then(data => setList(data))
      .catch(e => console.error("Fetch error:", e));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/3 border-r overflow-y-auto bg-white p-4">
        <h2 className="font-bold text-lg mb-4">Deviation List</h2>
        {list.map((item: any) => (
          <div key={item.id} className="p-3 border-b cursor-pointer hover:bg-blue-50 transition" onClick={() => setSelected(item)}>
            <div className="font-semibold text-blue-900">{item.business_key}</div>
            <div className="text-sm text-gray-600 truncate">{item.title}</div>
          </div>
        ))}
      </div>
      <div className="w-2/3 p-8 bg-white">
        {selected ? (
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950">{selected.title}</h1>
            <p className="mt-6 text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">{selected.description}</p>
            <div className="mt-6 text-sm text-gray-400 font-mono">ID: {selected.business_key} | Part: {selected.part_id}</div>
          </div>
        ) : (
          <div>
             <h2 className="text-xl font-bold mb-6">Create New Deviation</h2>
             <CreateDeviation />
          </div>
        )}
      </div>
    </div>
  );
}

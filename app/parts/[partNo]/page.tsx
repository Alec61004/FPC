"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPartDeviations, fieldAction, fieldDev, fieldIssue, fieldLesson, type DeviationRecord } from "@/lib/api";

export default function PartDetailPage(){
  const params = useParams<{ partNo:string }>();
  const partNo = decodeURIComponent(params.partNo || "");
  const [rows,setRows]=useState<DeviationRecord[]>([]);
  const [selected,setSelected]=useState<DeviationRecord|null>(null);
  useEffect(()=>{ getPartDeviations(partNo).then(d=>{ setRows(d); setSelected(d[0]||null); }); },[partNo]);
  
  if(!selected) return <main className="p-4">Loading detail...</main>;
  
  return (
    <main className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="w-[1000px] bg-white rounded shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#14284B] text-white px-4 py-2 flex justify-between items-center">
                <span className="font-bold text-sm">Case Detail | {fieldDev(selected)} | Part {partNo}</span>
                <button onClick={()=>window.history.back()} className="text-white hover:text-red-400">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4 overflow-y-auto">
                <div className="col-span-1 border p-3 text-xs"><div className="font-bold mb-1">VẤN ĐỀ ĐÃ GẶP</div>{fieldIssue(selected)}</div>
                <div className="col-span-1 border p-3 text-xs"><div className="font-bold mb-1">CÁCH ĐÃ XỬ LÝ</div>{fieldAction(selected)}</div>
                <div className="col-span-1 border p-3 text-xs"><div className="font-bold mb-1">KINH NGHIỆM</div>{fieldLesson(selected)}</div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex gap-2">
                <button className="btn text-xs">Edit</button>
                <button className="btn bg-[#14284B] text-white text-xs">Approve</button>
            </div>
        </div>
    </main>
  );
}
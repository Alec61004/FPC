"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateDeviation() {
  const router = useRouter();
  const [form, setForm] = useState({ part_id: "", business_key: "", title: "", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/deviations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, part_id: parseInt(form.part_id) }),
    });
    if (res.ok) window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm max-w-md">
      <input className="block w-full mb-3 p-3 border rounded-lg" placeholder="Part ID" type="number" onChange={e => setForm({...form, part_id: e.target.value})} />
      <input className="block w-full mb-3 p-3 border rounded-lg" placeholder="Business Key" onChange={e => setForm({...form, business_key: e.target.value})} />
      <input className="block w-full mb-3 p-3 border rounded-lg" placeholder="Title (Root Cause)" onChange={e => setForm({...form, title: e.target.value})} />
      <textarea className="block w-full mb-4 p-3 border rounded-lg" placeholder="Description" onChange={e => setForm({...form, description: e.target.value})} />
      <button className="bg-blue-600 text-white p-3 w-full rounded-xl font-bold hover:bg-blue-700" type="submit">Create Deviation</button>
    </form>
  );
}

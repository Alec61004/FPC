import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function partOf(row: any) {
  try { const d = JSON.parse(row.description || "{}"); return d.Part || (row.business_key || "").split("|")[1] || ""; }
  catch { return (row.business_key || "").split("|")[1] || ""; }
}

export async function GET(_: Request, { params }: { params: Promise<{ partNo: string }> }) {
  try {
    const { partNo } = await params;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase env missing");
    const res = await fetch(`${url}/rest/v1/deviations?select=*&order=created_at.desc`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const wanted = decodeURIComponent(partNo);
    return NextResponse.json(data.filter((r: any) => partOf(r) === wanted));
  } catch (error) { return NextResponse.json({ error: String(error) }, { status: 500 }); }
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function fetchSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env missing");
  const res = await fetch(`${url}/rest/v1/deviations?select=*&order=created_at.desc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function GET() {
  try { return NextResponse.json(await fetchSupabase()); }
  catch (error) { return NextResponse.json({ error: String(error) }, { status: 500 }); }
}

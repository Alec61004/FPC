export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchApi(endpoint: string) {
  const res = await fetch(`${API_BASE}/api${endpoint}`);
  if (!res.ok) throw new Error("API call failed");
  return res.json();
}

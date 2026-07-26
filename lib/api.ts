export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export type DeviationRecord = {
  id?: string;
  deviation_id?: string;
  dev_code?: string;
  part?: string;
  part_no?: string;
  part_number?: string;
  product?: string;
  issue?: string;
  defect_description?: string;
  description?: string | Record<string, any>;
  business_key?: string;
  what_happened?: string;
  what_was_done?: string;
  what_to_remember?: string;
  actions?: string;
  action_test?: string;
  conclusion?: string;
  root_cause?: string;
  decision?: string;
  status?: string;
  status_detail?: string;
  lesson_code?: string;
  key_lesson?: string;
  applicable_scope?: string;
  required_verification?: string;
  verification_needed?: string;
  review_status?: string;
  reusable_for?: string;
  author?: string;
  date?: string;
  deviation_date?: string;
  updated_at?: string;
  created_at?: string;
};

export type EvidenceFile = { id?: string; filename?: string; name?: string; url?: string; signed_url?: string; media_type?: string; size?: number; modified?: string; created_at?: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const endpoint = `${API_BASE}${path.startsWith('/api') ? path : `/api${path}`}`;
  const res = await fetch(endpoint, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function getDeviations(): Promise<DeviationRecord[]> { return request<DeviationRecord[]>("/api/deviations"); }
export async function getPartDeviations(part: string): Promise<DeviationRecord[]> { return request<DeviationRecord[]>(`/api/deviations/part/${encodeURIComponent(part)}`); }
export async function getEvidence(id: string): Promise<EvidenceFile[]> { return request<EvidenceFile[]>(`/api/evidence/${encodeURIComponent(id)}`); }
export async function getMeta(name: string): Promise<string[]> { return request<string[]>(`/api/meta/${name}`); }


export function desc(r: DeviationRecord): Record<string, any> {
  if (!r.description) return {};
  try { return typeof r.description === "string" ? JSON.parse(r.description) : r.description as any; } catch { return {}; }
}

export function fieldPart(r: DeviationRecord) { const d=desc(r); return r.part || r.part_no || r.part_number || d.Part || (r.business_key||"").split("|")[1] || "UNKNOWN"; }
export function fieldDev(r: DeviationRecord) { const d=desc(r); return r.deviation_id || r.dev_code || d["Deviation ID"] || (r.business_key||"").split("|")[0] || r.id || "DEV"; }
export function fieldIssue(r: DeviationRecord) { const d=desc(r); return r.issue || r.what_happened || r.defect_description || d.Issue || "No issue text"; }
export function fieldAction(r: DeviationRecord) { const d=desc(r); return r.what_was_done || r.actions || r.action_test || r.conclusion || d["Actions / Process"] || d.Solution || "No action text"; }
export function fieldLesson(r: DeviationRecord) { const d=desc(r); return r.what_to_remember || r.key_lesson || r.reusable_for || d.Conclusion || "No lesson text"; }
export function fieldStatus(r: DeviationRecord) { return r.status_detail || r.status || "Reviewed"; }
export function fieldDate(r: DeviationRecord) { const d=desc(r); return r.date || r.deviation_date || d.Date || (r.created_at || "").slice(0,10) || "-"; }

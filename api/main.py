from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

class Deviation(BaseModel):
    dev_code: str
    part_id: Optional[str] = None
    affected_products: Optional[List[str]] = []
    defect_description: Optional[str] = None
    detected_at: Optional[str] = None
    deviation_date: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = "open"
    root_cause: Optional[str] = None
    decision: Optional[str] = None
    status_detail: Optional[str] = None
    lesson_code: Optional[str] = None
    key_lesson: Optional[str] = None
    applicable_scope: Optional[str] = None
    required_verification: Optional[str] = None
    what_happened: Optional[str] = None
    what_was_done: Optional[str] = None
    what_to_remember: Optional[str] = None
    reusable_for: Optional[str] = None
    author: Optional[str] = None

@app.get("/api/deviations")
def get_deviations(status: str = None, part_id: str = None, search: str = None):
    query = supabase.table("deviations").select("*")
    if status: query = query.eq("status", status)
    if part_id: query = query.eq("part_id", part_id)
    return query.execute().data

@app.post("/api/deviations")
def create_deviation(dev: Deviation):
    return supabase.table("deviations").insert(dev.dict()).execute().data

@app.get("/api/deviations/part/{part_number}")
def get_part_deviations(part_number: str):
    # Lấy ID của part từ bảng parts
    part = supabase.table("parts").select("id").eq("part_no", part_number).single().execute().data
    if not part: raise HTTPException(status_code=404, detail="Part not found")
    return supabase.table("deviations").select("*").eq("part_id", part['id']).execute().data

@app.get("/api/meta/suppliers")
def get_suppliers():
    data = supabase.table("parts").select("supplier", count="exact").execute().data
    return list(set(d['supplier'] for d in data if d['supplier']))

@app.get("/api/meta/root-causes")
def get_root_causes():
    data = supabase.table("deviations").select("root_cause").execute().data
    return list(set(d['root_cause'] for d in data if d['root_cause']))

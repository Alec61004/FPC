#!/usr/bin/env python3
from __future__ import annotations
import json, os, sys
from pathlib import Path
from urllib import request, error, parse

ROOT = Path(__file__).resolve().parents[1]

def load_env(p: Path):
    if p.exists():
        for line in p.read_text().splitlines():
            line=line.strip()
            if line and not line.startswith('#') and '=' in line:
                k,v=line.split('=',1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

def reqenv(k):
    v=os.environ.get(k,'').strip()
    if not v: raise SystemExit(f'Missing env {k}')
    return v

def postgrest(method, table, payload=None, query=''):
    url=reqenv('SUPABASE_URL').rstrip('/')+f'/rest/v1/{table}'+query
    data=None if payload is None else json.dumps(payload, ensure_ascii=False).encode()
    r=request.Request(url, data=data, method=method)
    key=reqenv('SUPABASE_SERVICE_ROLE_KEY')
    r.add_header('apikey', key); r.add_header('Authorization', f'Bearer {key}')
    r.add_header('Content-Type','application/json'); r.add_header('Prefer','return=representation,resolution=merge-duplicates')
    try:
        with request.urlopen(r, timeout=90) as resp:
            txt=resp.read().decode()
            return json.loads(txt) if txt else []
    except error.HTTPError as e:
        body=e.read().decode(errors='replace')
        raise RuntimeError(f'{method} {table}{query} failed {e.code}: {body[:500]}')

def norm_status(s): return 'review' if s else 'review'

def main():
    load_env(ROOT/'.env.ingest'); load_env(ROOT/'.env')
    data=json.loads((ROOT/'data/ingestion/knowledgehub_curated_preview.json').read_text())
    parts=data['parts']
    part_rows=[]
    dev_rows=[]
    lesson_rows=[]
    for item in parts:
        part=item['part']
        review=item.get('review') or {}
        first=(item.get('deviations') or [{}])[0]
        part_rows.append({'part_no':part,'name':part,'category':first.get('Product') or 'Deltrol Part','status':'review' if item.get('has_review') else 'active','supplier':first.get('Supplier') or None})
        if review:
            lesson_rows.append({'part_no':part,'overview':review.get('overview',''),'issue':review.get('issue',''),'pattern_source':review.get('pattern_source',''),'technical_risk':review.get('technical_risk',''),'engineering_review':review.get('engineering_review',''),'next_time_action':review.get('next_time_action',''),'status':'approved'})
        for d in item.get('deviations') or []:
            dev_rows.append({'dev_code':str(d.get('ID') or d.get('Business Key') or f'DEV-{part}'),'part_no':part,'business_key':d.get('Business Key') or f"{part}-{d.get('ID','')}",'affected_product':d.get('Product') or None,'customer':d.get('Customer') or None,'supplier':d.get('Supplier') or None,'defect_description':d.get('Issue') or '', 'root_cause':d.get('Root Cause Category') or None,'solution':d.get('Solution') or None,'actions':d.get('Actions') or None,'reference':d.get('Reference') or None,'deviation_date':str(d.get('Date') or '')[:10] or None,'status':'closed' if review else 'open','severity':'major' if (d.get('Root Cause Category') or '').lower() in ('dimension','drawing') else 'minor'})
    # de-dupe
    parts_unique=list({r['part_no']:r for r in part_rows}.values())
    lessons_unique=list({r['part_no']:r for r in lesson_rows}.values())
    dev_unique=list({r['business_key']:r for r in dev_rows}.values())
    print(json.dumps({'prepared_parts':len(parts_unique),'prepared_deviations':len(dev_unique),'prepared_lessons':len(lessons_unique)},indent=2))
    for table, rows, conflict in [('parts',parts_unique,'part_no'),('deviations',dev_unique,'business_key'),('lessons',lessons_unique,'part_no')]:
        if not rows: continue
        for i in range(0,len(rows),100):
            postgrest('POST', table, rows[i:i+100], f'?on_conflict={parse.quote(conflict)}')
        print(f'upserted {len(rows)} -> {table}')

if __name__=='__main__': main()

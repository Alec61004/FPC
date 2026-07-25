#!/usr/bin/env python3
"""Local-first KnowledgeHub deviation folder scanner.

This prototype scans a root deviation folder, groups files by case folder,
extracts lightweight metadata (DEV ids, part numbers, file types, text snippets),
and compares each case against reviewed lessons JSON. It does NOT write to
Supabase or mutate source files.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

DEV_RE = re.compile(r"\bDEV\d{6,8}(?:-\d{3})?\b", re.I)
# FPC part-like codes observed in folders/files: 70196-03, 57479.60, 00534-31, 80097-01
PART_RE = re.compile(r"(?<!\d)(?:\d{5}[-.]\d{2}|\d{5}-\d{1,3}|\d{3,5}\.\d{2})(?!\d)")
IGNORED_EXT = {".db", ".tmp", ".lnk"}
TEXT_EXT = {".txt", ".md"}
SUPPORTED_EXT = {".pdf", ".docx", ".xlsx", ".xls", ".doc", ".msg", ".jpg", ".jpeg", ".png", ".pptx"} | TEXT_EXT

@dataclass
class CasePreview:
    case_key: str
    folder: str
    year_bucket: str | None
    dev_ids: list[str]
    parts: list[str]
    files: list[dict]
    primary_doc: str | None
    text_snippet: str
    matched_lessons: list[dict]
    needs_review: bool = True


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(chunk_size), b''):
            h.update(chunk)
    return h.hexdigest()


def extract_docx(path: Path, max_chars: int) -> str:
    try:
        import docx
        doc = docx.Document(str(path))
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        return text[:max_chars]
    except Exception as e:
        return f"[DOCX extraction failed: {e}]"


def extract_pdf(path: Path, max_chars: int) -> str:
    try:
        import fitz  # PyMuPDF
        out = []
        with fitz.open(str(path)) as pdf:
            for page in pdf[: min(3, len(pdf))]:
                out.append(page.get_text())
                if sum(map(len, out)) >= max_chars:
                    break
        return "\n".join(out)[:max_chars]
    except Exception as e:
        return f"[PDF extraction failed: {e}]"


def extract_xlsx(path: Path, max_chars: int) -> str:
    try:
        import openpyxl
        wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
        chunks = []
        for ws in wb.worksheets[:3]:
            chunks.append(f"[Sheet: {ws.title}]")
            for i, row in enumerate(ws.iter_rows(values_only=True)):
                if i > 30:
                    break
                vals = [str(v) for v in row if v is not None]
                if vals:
                    chunks.append(" | ".join(vals))
                if sum(map(len, chunks)) >= max_chars:
                    break
        return "\n".join(chunks)[:max_chars]
    except Exception as e:
        return f"[XLSX extraction failed: {e}]"


def extract_text(path: Path, max_chars: int) -> str:
    ext = path.suffix.lower()
    if ext in TEXT_EXT:
        return path.read_text(errors='ignore')[:max_chars]
    if ext == '.docx':
        return extract_docx(path, max_chars)
    if ext == '.pdf':
        return extract_pdf(path, max_chars)
    if ext in {'.xlsx', '.xls'}:
        return extract_xlsx(path, max_chars)
    return ''


def case_folder_for(path: Path, root: Path) -> Path:
    rel = path.relative_to(root)
    # Root utility files stay as their own path; deviation cases are normally year/case-folder/files.
    if len(rel.parts) >= 2 and re.match(r"\d{2}.*20\d{2}|\d{4}", rel.parts[0]):
        return root / rel.parts[0] / rel.parts[1]
    if len(rel.parts) >= 2:
        return root / rel.parts[0] / rel.parts[1]
    return path.parent


def load_lessons(path: Path) -> list[dict]:
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding='utf-8'))
    records = data.get('records') or []
    lessons = []
    for r in records:
        part_field = str(r.get('part', ''))
        parts = sorted(set(PART_RE.findall(part_field))) or [p.strip() for p in part_field.split(',') if p.strip()]
        lessons.append({
            'review_id': r.get('review_id'),
            'dev': r.get('dev'),
            'parts': parts,
            'mechanism': r.get('mechanism'),
            'review_decision': r.get('review_decision'),
            'review_status': r.get('review_status'),
            'issue': r.get('issue'),
            'reusable_lesson': r.get('reusable_lesson'),
        })
    return lessons


def find_matches(parts: Iterable[str], lessons: list[dict], limit: int) -> list[dict]:
    partset = set(parts)
    hits = []
    for l in lessons:
        overlap = sorted(partset.intersection(l.get('parts') or []))
        if overlap:
            hits.append({
                'matched_parts': overlap,
                'review_id': l['review_id'],
                'dev': l['dev'],
                'mechanism': l['mechanism'],
                'review_decision': l['review_decision'],
                'review_status': l['review_status'],
                'lesson_excerpt': (l.get('reusable_lesson') or '')[:240],
            })
    return hits[:limit]


def scan(root: Path, lessons_json: Path, limit_cases: int, max_chars_per_file: int) -> dict:
    lessons = load_lessons(lessons_json)
    all_files = [p for p in root.rglob('*') if p.is_file()]
    usable_files = [p for p in all_files if p.suffix.lower() not in IGNORED_EXT]

    groups: dict[Path, list[Path]] = defaultdict(list)
    for p in usable_files:
        groups[case_folder_for(p, root)].append(p)

    previews: list[CasePreview] = []
    for folder, files in sorted(groups.items(), key=lambda kv: str(kv[0])):
        # Prefer deviation docx/pdf/xlsx for text preview; skip image-only if no text docs.
        searchable = " ".join([folder.name, *[f.name for f in files]])
        devs = sorted(set(x.upper() for x in DEV_RE.findall(searchable)))
        parts = sorted(set(PART_RE.findall(searchable)))
        text_chunks = []
        primary = None
        for f in sorted(files, key=lambda p: (p.suffix.lower() not in {'.docx', '.pdf', '.xlsx'}, len(p.name))):
            if f.suffix.lower() in {'.docx', '.pdf', '.xlsx', '.xls', '.txt'}:
                txt = extract_text(f, max_chars_per_file)
                if txt:
                    primary = primary or str(f.relative_to(root))
                    text_chunks.append(f"--- {f.name} ---\n{txt}")
                    parts = sorted(set(parts) | set(PART_RE.findall(txt)))
                    devs = sorted(set(devs) | set(x.upper() for x in DEV_RE.findall(txt)))
                if sum(map(len, text_chunks)) >= max_chars_per_file:
                    break
        case_key = devs[0] if devs else folder.name
        year_bucket = folder.relative_to(root).parts[0] if folder != root and len(folder.relative_to(root).parts) else None
        previews.append(CasePreview(
            case_key=case_key,
            folder=str(folder.relative_to(root)),
            year_bucket=year_bucket,
            dev_ids=devs,
            parts=parts,
            files=[{'name': f.name, 'relative_path': str(f.relative_to(root)), 'ext': f.suffix.lower(), 'size': f.stat().st_size} for f in sorted(files)],
            primary_doc=primary,
            text_snippet="\n\n".join(text_chunks)[:2000],
            matched_lessons=find_matches(parts, lessons, 5),
        ))
        if 0 < limit_cases <= len(previews):
            break

    return {
        'root': str(root),
        'total_files': len(all_files),
        'usable_files': len(usable_files),
        'extension_counts': Counter(p.suffix.lower() or '<noext>' for p in all_files),
        'case_folder_count': len(groups),
        'lesson_records_loaded': len(lessons),
        'cases': [asdict(c) for c in previews],
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='/home/bao/temp_knowledge_hub')
    ap.add_argument('--lessons', default='/home/bao/temp_knowledge_hub/lessons_learned_reviewed_2024_2026.json')
    ap.add_argument('--out', default='/home/bao/knowledge_hub_qms_v2/data/ingestion/local_ingest_preview.json')
    ap.add_argument('--limit-cases', type=int, default=20)
    ap.add_argument('--max-chars-per-file', type=int, default=2500)
    args = ap.parse_args()

    result = scan(Path(args.root), Path(args.lessons), args.limit_cases, args.max_chars_per_file)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2, default=dict), encoding='utf-8')

    print(f"Wrote {out}")
    print(f"files={result['total_files']} usable={result['usable_files']} case_folders={result['case_folder_count']} lessons={result['lesson_records_loaded']}")
    print('extensions:', dict(result['extension_counts'].most_common(15)))
    print('first_cases:')
    for c in result['cases'][:10]:
        print(f"- {c['case_key']} | folder={c['folder']} | parts={','.join(c['parts'][:8])} | files={len(c['files'])} | matches={len(c['matched_lessons'])}")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

import pandas as pd
from docx import Document


def clean(value: object) -> str:
    if value is None:
        return ""
    if pd.isna(value):
        return ""
    text = str(value).replace("\r", "\n").replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalize_part(value: object) -> str:
    return re.sub(r"[^A-Z0-9.\-]+", "", clean(value).upper())


def split_part_cell(value: object) -> list[str]:
    text = clean(value)
    if not text:
        return []
    # Keep true part separators while not splitting decimal dot or hyphen.
    pieces = re.split(r"[,;\n]+|\s+/\s+|\s+AND\s+", text, flags=re.IGNORECASE)
    out: list[str] = []
    seen: set[str] = set()
    for piece in pieces:
        part = clean(piece).strip(" .,/;")
        if not part:
            continue
        key = normalize_part(part)
        if key and key not in seen:
            seen.add(key)
            out.append(part)
    return out


def parse_word_review(path: Path) -> dict[str, dict[str, Any]]:
    doc = Document(path)
    paragraphs = [clean(p.text) for p in doc.paragraphs if clean(p.text)]
    header_re = re.compile(r"^[\-+•\s]*(?P<part>[A-Za-z0-9][A-Za-z0-9./\-]{2,80})\s*:\s*(?P<title>.*)$")
    sections: dict[str, dict[str, Any]] = {}
    current_key = ""

    for paragraph in paragraphs:
        m = header_re.match(paragraph)
        if m:
            part = clean(m.group("part"))
            # Exclude document metadata lines such as +Tổng dữ liệu: ...
            if any(ch.isdigit() for ch in part) and not part.lower().startswith(("153", "115")):
                current_key = normalize_part(part)
                sections[current_key] = {
                    "part": part,
                    "title_context": clean(m.group("title")),
                    "overview": "",
                    "issue": "",
                    "pattern_source": "",
                    "technical_risk": "",
                    "engineering_review": "",
                    "next_time_action": "",
                    "raw_lines": [],
                }
                continue

        if not current_key:
            continue
        line = paragraph.lstrip("+•- ").strip()
        sections[current_key]["raw_lines"].append(line)
        field_map = [
            ("Tổng quan part:", "overview"),
            ("Lỗi:", "issue"),
            ("Pattern/nguồn lỗi:", "pattern_source"),
            ("Rủi ro kỹ thuật:", "technical_risk"),
            ("Đánh giá kỹ sư:", "engineering_review"),
            ("Lần sau gặp lại:", "next_time_action"),
        ]
        for prefix, key in field_map:
            if line.startswith(prefix):
                sections[current_key][key] = clean(line[len(prefix):])
                break

    return sections


def excel_row_to_deviation(row: pd.Series) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for col in row.index:
        val = row[col]
        if hasattr(val, "isoformat"):
            out[col] = val.isoformat()
        else:
            out[col] = clean(val)
    out["split_parts"] = split_part_cell(row.get("Part"))
    out["normalized_split_parts"] = [normalize_part(p) for p in out["split_parts"]]
    return out


def build_preview(excel_path: Path, word_path: Path) -> dict[str, Any]:
    df = pd.read_excel(excel_path)
    review_by_part = parse_word_review(word_path)
    deviations = [excel_row_to_deviation(row) for _, row in df.iterrows()]

    deviations_by_part: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for dev in deviations:
        for part_key in dev["normalized_split_parts"]:
            deviations_by_part[part_key].append(dev)

    all_part_keys = sorted(set(deviations_by_part) | set(review_by_part))
    parts: list[dict[str, Any]] = []
    for key in all_part_keys:
        review = review_by_part.get(key)
        part_name = review["part"] if review else (deviations_by_part[key][0]["split_parts"][0] if deviations_by_part[key] else key)
        devs = deviations_by_part.get(key, [])
        parts.append({
            "part": part_name,
            "normalized_part": key,
            "has_review": review is not None,
            "review": review,
            "deviation_count": len(devs),
            "deviations": devs,
        })

    reviewed_with_deviation = [p for p in parts if p["has_review"] and p["deviation_count"] > 0]
    reviewed_without_deviation = [p for p in parts if p["has_review"] and p["deviation_count"] == 0]
    deviation_without_review = [p for p in parts if not p["has_review"] and p["deviation_count"] > 0]

    return {
        "source_files": {
            "excel": str(excel_path),
            "word_review": str(word_path),
        },
        "summary": {
            "excel_rows": len(df),
            "excel_unique_raw_part_cells": int(df["Part"].dropna().astype(str).nunique()) if "Part" in df else 0,
            "word_review_parts": len(review_by_part),
            "normalized_parts_total": len(parts),
            "reviewed_parts_with_deviation": len(reviewed_with_deviation),
            "reviewed_parts_without_deviation": len(reviewed_without_deviation),
            "parts_with_deviation_without_review": len(deviation_without_review),
        },
        "reviewed_parts_with_deviation_sample": reviewed_with_deviation[:10],
        "reviewed_parts_without_deviation": [p["part"] for p in reviewed_without_deviation],
        "parts_with_deviation_without_review": [p["part"] for p in deviation_without_review],
        "parts": parts,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--excel", default="/home/bao/.hermes/cache/documents/doc_896c813f0d4d_Deviation_Knowledge_Hub_Root_Cause.xlsx")
    ap.add_argument("--word", default="/home/bao/.hermes/cache/documents/doc_2c8d0a16ee8f_Deviation_Review_Report.docx")
    ap.add_argument("--out", default="data/ingestion/knowledgehub_curated_preview.json")
    args = ap.parse_args()
    preview = build_preview(Path(args.excel), Path(args.word))
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(preview, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    print(json.dumps(preview["summary"], ensure_ascii=False, indent=2))
    print(f"Preview written: {out}")


if __name__ == "__main__":
    main()

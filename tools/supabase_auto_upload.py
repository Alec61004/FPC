#!/usr/bin/env python3
"""Auto-upload KnowledgeHub scan output to Supabase using knowledge_hub_core logic.

This script reuses Bao's proven `knowledge_hub_core.py` grouping/parser rules instead of
simple folder-level heuristics. It scans deviation folders locally, builds rows compatible
with the current Supabase schema, writes a detailed preview JSON, and optionally uploads.

Writes:
- deviations(business_key, title, description)
- lessons(lesson_code, part, title, problem, lesson, verification, prevention, status)
- audit_logs(actor, action, table_name, record_id)

Safety:
- Source files are never modified.
- Default mode is dry-run. Pass --upload to write to Supabase.
- Uses REST API with SERVICE_ROLE_KEY from .env.ingest or environment variables.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
from pathlib import Path
from typing import Any
from urllib import error, parse, request
import boto3
from botocore.config import Config

DEFAULT_CORE_PATH = Path(
    "/home/bao/.hermes/cache/documents/doc_0b60656c502a_knowledge_hub_core.py"
)


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value or value.startswith("YOUR_") or "..." in value:
        raise SystemExit(f"Missing/invalid {name}. Put it in .env.ingest or export it.")
    return value


def clean(value: object) -> str:
    if value is None:
        return ""
    text = str(value).replace("\r", "\n").replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def compact_text(s: object, max_len: int = 6000) -> str:
    text = re.sub(r"\s+", " ", clean(s)).strip()
    return text[:max_len]


def clean_url(url: str) -> str:
    return url.rstrip("/")


def load_core_module(core_path: Path):
    if not core_path.exists():
        raise FileNotFoundError(f"knowledge_hub_core.py not found: {core_path}")
    spec = importlib.util.spec_from_file_location("knowledge_hub_core_runtime", core_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot import knowledge_hub_core from {core_path}")
    module = importlib.util.module_from_spec(spec)
    import sys as _sys
    _sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def r2_client() -> Any:
    account_id = require_env("R2_ACCOUNT_ID")
    access_key = require_env("R2_ACCESS_KEY_ID")
    secret_key = require_env("R2_SECRET_ACCESS_KEY")
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def r2_public_url(object_key: str) -> str:
    base = os.environ.get("R2_PUBLIC_URL", "").strip().rstrip("/")
    return f"{base}/{object_key}" if base else object_key


def put_json_to_r2(client: Any, bucket: str, key: str, payload: Any) -> str:
    body = json.dumps(payload, ensure_ascii=False, indent=2, default=str).encode("utf-8")
    client.put_object(
        Bucket=bucket,
        Key=key,
        Body=body,
        ContentType="application/json; charset=utf-8",
    )
    return r2_public_url(key)


def configure_core_module(core, root: Path) -> None:
    core.SOURCE_ROOT = root
    core.PROJECT_ROOT = root


def scan_with_core(core, root: Path, limit_cases: int = 0) -> dict[str, Any]:
    configure_core_module(core, root)
    folders = core.folders_with_docx()
    groups_out: list[dict[str, Any]] = []
    skipped_non_deviation: list[dict[str, Any]] = []
    incomplete_words: list[dict[str, Any]] = []
    total_profiles = 0
    total_groups = 0

    for folder in folders:
        groups, profiles = core.scan_deviation_groups(folder)
        total_profiles += len(profiles)
        folder_rel = core.portable_path(folder, root)

        if not groups:
            skipped_non_deviation.append(
                {
                    "folder": folder_rel,
                    "profiles": [
                        {
                            "path": p.path.name,
                            "score": p.score,
                            "semantic_fields": p.semantic_fields,
                            "is_deviation": p.is_deviation,
                            "markers": list(p.markers),
                            "error": p.error,
                        }
                        for p in profiles
                    ],
                }
            )
            continue

        for profile in profiles:
            if not profile.is_deviation and not profile.error:
                incomplete_words.append(
                    {
                        "folder": folder_rel,
                        "path": profile.path.name,
                        "score": profile.score,
                        "semantic_fields": profile.semantic_fields,
                        "markers": list(profile.markers),
                    }
                )

        for group in groups:
            record = dict(group.record)
            word = group.primary.profile.path
            pdf = core.choose_primary_pdf(folder, word, clean(record.get("ID")))
            word_rel = os.path.relpath(str(word.resolve()), str(folder.resolve()))
            pdf_rel = (
                os.path.relpath(str(pdf.resolve()), str(folder.resolve())) if pdf else ""
            )
            record["Reference"] = str(Path(folder_rel) / word_rel)
            total_groups += 1
            groups_out.append(
                {
                    "folder": folder_rel,
                    "absolute_folder": str(folder),
                    "deviation_id": group.deviation_id,
                    "case_id": group.case_id,
                    "business_key": group.business_key,
                    "primary_word": word.name,
                    "primary_word_rel": word_rel,
                    "primary_pdf_rel": pdf_rel,
                    "candidate_files": [c.profile.path.name for c in group.candidates],
                    "candidate_count": len(group.candidates),
                    "record": record,
                }
            )
            if limit_cases and total_groups >= limit_cases:
                return {
                    "folders_with_docx": len(folders),
                    "groups": groups_out,
                    "skipped_non_deviation": skipped_non_deviation,
                    "incomplete_words": incomplete_words,
                    "profile_count": total_profiles,
                }

    return {
        "folders_with_docx": len(folders),
        "groups": groups_out,
        "skipped_non_deviation": skipped_non_deviation,
        "incomplete_words": incomplete_words,
        "profile_count": total_profiles,
    }


def build_rows(scan_result: dict[str, Any]) -> tuple[list[dict], list[dict], list[dict], dict[str, Any]]:
    deviations: list[dict] = []
    lessons: list[dict] = []
    audits: list[dict] = []
    folder_summary: dict[str, list[str]] = {}

    for item in scan_result.get("groups", []):
        record = item["record"]
        business_key = clean(item.get("business_key"))
        folder = item.get("folder") or ""
        folder_summary.setdefault(folder, []).append(business_key)

        issue = clean(record.get("Issue"))
        solution = clean(record.get("Solution"))
        actions = clean(record.get("Actions"))
        part = clean(record.get("Part"))
        root_cause = clean(record.get("Root Cause Category"))
        title_bits = [clean(record.get("ID")), part, root_cause]
        title = " | ".join(bit for bit in title_bits if bit)[:500] or business_key

        desc_obj = {
            "deviation_id": clean(record.get("ID")),
            "case_id": item.get("case_id"),
            "folder": folder,
            "primary_word": item.get("primary_word"),
            "primary_word_rel": item.get("primary_word_rel"),
            "primary_pdf_rel": item.get("primary_pdf_rel"),
            "candidate_files": item.get("candidate_files") or [],
            "candidate_count": item.get("candidate_count") or 0,
            "date": str(record.get("Date") or ""),
            "part": part,
            "supplier": clean(record.get("Supplier")),
            "product": clean(record.get("Product")),
            "customer": clean(record.get("Customer")),
            "issue": issue,
            "root_cause_category": root_cause,
            "solution": solution,
            "actions": actions,
            "reference": clean(record.get("Reference")),
            "warnings": record.get("_Warnings", []),
            "id_source": clean(record.get("_IDSource")),
            "word_id": clean(record.get("_WordID")),
            "filename_id": clean(record.get("_FilenameID")),
            "folder_id": clean(record.get("_FolderID")),
            "id_mismatch": bool(record.get("_IDMismatch")),
            "id_conflict_review": bool(record.get("_IDConflictReview")),
            "ingest_source": "knowledge_hub_core",
        }
        deviations.append(
            {
                "business_key": business_key,
                "title": title,
                "description": json.dumps(desc_obj, ensure_ascii=False),
            }
        )
        audits.append(
            {
                "actor": "knowledge_hub_core_importer",
                "action": "upsert_deviation_group",
                "table_name": "deviations",
                "record_id": business_key,
            }
        )

        lesson_code = f"LESSON-{business_key}"
        lesson_text = clean("\n\n".join(part for part in [solution, actions] if part))
        verification = clean(
            " | ".join(
                part
                for part in [clean(record.get("Reference")), "; ".join(record.get("_Warnings", [])[:5])]
                if part
            )
        )
        lessons.append(
            {
                "lesson_code": lesson_code[:500],
                "part": part[:500],
                "title": (issue[:200] or title[:500] or business_key)[:500],
                "problem": compact_text(issue, 4000),
                "lesson": compact_text(lesson_text, 4000),
                "verification": verification[:4000],
                "prevention": compact_text(actions, 4000),
                "status": "approved",
            }
        )

    lessons = list({row["lesson_code"]: row for row in lessons}.values())
    explanation = {
        "deviation_count_explainer": (
            "Count equals number of DeviationGroup records produced by knowledge_hub_core: "
            "DOCX-qualified deviation forms after filtering, DEV ID resolution, and revision/case grouping."
        ),
        "folders_to_business_keys": folder_summary,
    }
    return deviations, lessons, audits, explanation


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--env-file", default=".env.ingest")
    ap.add_argument("--r2-env-file", default=".env.r2")
    ap.add_argument("--core-path", default=None, help="Path to knowledge_hub_core.py")
    ap.add_argument("--root", default=None)
    ap.add_argument("--limit-cases", type=int, default=0, help="0 = all grouped cases")
    ap.add_argument("--upload", action="store_true", help="Actually write JSON objects to Cloudflare R2. Without this, dry-run only.")
    ap.add_argument("--preview-out", default="data/ingestion/r2_upload_preview.json")
    ap.add_argument("--r2-prefix", default="knowledgehub", help="Object key prefix in R2 bucket")
    args = ap.parse_args()

    load_env_file(Path(args.env_file))
    load_env_file(Path(args.r2_env_file))
    root = Path(args.root or os.environ.get("KNOWLEDGE_ROOT", "/home/bao/temp_knowledge_hub")).resolve()
    core_path = Path(args.core_path or os.environ.get("KNOWLEDGE_HUB_CORE", str(DEFAULT_CORE_PATH))).resolve()

    core = load_core_module(core_path)
    scan_result = scan_with_core(core, root, limit_cases=args.limit_cases)
    deviation_rows, lesson_rows, audit_rows, explanation = build_rows(scan_result)

    preview = {
        "scan_summary": {
            "root": str(root),
            "core_path": str(core_path),
            "folders_with_docx": scan_result.get("folders_with_docx", 0),
            "profile_count": scan_result.get("profile_count", 0),
            "group_count": len(scan_result.get("groups", [])),
            "skipped_non_deviation_folders": len(scan_result.get("skipped_non_deviation", [])),
            "incomplete_word_files": len(scan_result.get("incomplete_words", [])),
        },
        "deviation_count": len(deviation_rows),
        "lesson_count": len(lesson_rows),
        "audit_count": len(audit_rows),
        "count_explanation": explanation,
        "sample_deviations": deviation_rows[:5],
        "sample_lessons": lesson_rows[:5],
        "sample_group_sources": scan_result.get("groups", [])[:10],
        "skipped_non_deviation": scan_result.get("skipped_non_deviation", [])[:20],
        "incomplete_words": scan_result.get("incomplete_words", [])[:50],
    }
    out = Path(args.preview_out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(preview, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    print(f"Prepared deviations={len(deviation_rows)} lessons={len(lesson_rows)} audits={len(audit_rows)}")
    print(f"Preview written: {out}")

    if not args.upload:
        print("DRY RUN ONLY. Add --upload to write JSON objects to Cloudflare R2.")
        return

    bucket = require_env("R2_BUCKET_NAME")
    prefix = args.r2_prefix.strip("/")
    client = r2_client()
    print("Uploading JSON objects to Cloudflare R2...")

    manifest = {
        "summary": preview["scan_summary"],
        "deviation_count": len(deviation_rows),
        "lesson_count": len(lesson_rows),
        "audit_count": len(audit_rows),
        "objects": [],
    }

    for row in deviation_rows:
        safe_key = re.sub(r"[^A-Za-z0-9_.=-]+", "_", row["business_key"])
        object_key = f"{prefix}/deviations/{safe_key}.json"
        url = put_json_to_r2(client, bucket, object_key, row)
        manifest["objects"].append({"table": "deviations", "business_key": row["business_key"], "key": object_key, "url": url})

    for row in lesson_rows:
        safe_key = re.sub(r"[^A-Za-z0-9_.=-]+", "_", row["lesson_code"])
        object_key = f"{prefix}/lessons/{safe_key}.json"
        url = put_json_to_r2(client, bucket, object_key, row)
        manifest["objects"].append({"table": "lessons", "lesson_code": row["lesson_code"], "key": object_key, "url": url})

    for index, row in enumerate(audit_rows, start=1):
        safe_key = re.sub(r"[^A-Za-z0-9_.=-]+", "_", row["record_id"])
        object_key = f"{prefix}/audit_logs/{safe_key}-{index:04d}.json"
        url = put_json_to_r2(client, bucket, object_key, row)
        manifest["objects"].append({"table": "audit_logs", "record_id": row["record_id"], "key": object_key, "url": url})

    manifest_key = f"{prefix}/manifest.json"
    manifest_url = put_json_to_r2(client, bucket, manifest_key, manifest)
    preview_key = f"{prefix}/preview/r2_upload_preview.json"
    preview_url = put_json_to_r2(client, bucket, preview_key, preview)
    print(f"UPLOAD COMPLETE: R2 bucket={bucket}")
    print(f"Manifest: {manifest_url}")
    print(f"Preview : {preview_url}")


if __name__ == "__main__":
    main()

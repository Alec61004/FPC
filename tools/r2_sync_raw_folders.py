#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required environment variable: {name}")
    return value


def make_client() -> Any:
    account_id = require_env("R2_ACCOUNT_ID")
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=require_env("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=require_env("R2_SECRET_ACCESS_KEY"),
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def safe_segment(value: str) -> str:
    value = value.replace("\\", "/").strip("/")
    parts = []
    for segment in value.split("/"):
        segment = segment.strip()
        segment = re.sub(r"[^A-Za-z0-9._()=+,& -]+", "_", segment)
        segment = re.sub(r"\s+", " ", segment).strip()
        parts.append(segment or "_")
    return "/".join(parts)


def file_sha256(path: Path, chunk_size: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def iter_files(root: Path) -> list[Path]:
    ignored_dirs = {"__pycache__", ".git", ".DS_Store", "_parser_debug"}
    out = []
    for path in root.rglob("*"):
        if any(part in ignored_dirs for part in path.parts):
            continue
        if path.is_file():
            out.append(path)
    return sorted(out)


def head_exists(client: Any, bucket: str, key: str) -> bool:
    try:
        client.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code")
        if code in {"404", "NoSuchKey", "NotFound"}:
            return False
        raise


def upload_file(client: Any, bucket: str, local_path: Path, key: str) -> dict[str, Any]:
    content_type, _ = mimetypes.guess_type(local_path.name)
    extra_args = {"ContentType": content_type or "application/octet-stream"}
    client.upload_file(str(local_path), bucket, key, ExtraArgs=extra_args)
    return {
        "key": key,
        "size": local_path.stat().st_size,
        "content_type": extra_args["ContentType"],
    }


def public_url(base: str, key: str) -> str:
    base = base.rstrip("/")
    return f"{base}/{key}" if base else key


def main() -> None:
    ap = argparse.ArgumentParser(description="Sync raw deviation folders to Cloudflare R2 while preserving folder structure.")
    ap.add_argument("--env-file", default=".env.r2")
    ap.add_argument("--root", default="/home/bao/temp_knowledge_hub")
    ap.add_argument("--prefix", default="raw-deviation-folders")
    ap.add_argument("--manifest-out", default="data/ingestion/r2_raw_folder_manifest.json")
    ap.add_argument("--upload", action="store_true", help="Actually upload to R2. Without this, dry-run only.")
    ap.add_argument("--skip-existing", action="store_true", help="Do not overwrite existing R2 objects.")
    ap.add_argument("--hash", action="store_true", help="Compute sha256 for each file. Slower but useful for audit.")
    args = ap.parse_args()

    load_env_file(Path(args.env_file))
    root = Path(args.root).resolve()
    if not root.exists():
        raise SystemExit(f"Root folder not found: {root}")

    bucket = require_env("R2_BUCKET_NAME")
    public_base = os.environ.get("R2_PUBLIC_URL", "").strip()
    prefix = safe_segment(args.prefix)
    files = iter_files(root)
    total_bytes = sum(p.stat().st_size for p in files)

    manifest: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "root": str(root),
        "bucket": bucket,
        "prefix": prefix,
        "file_count": len(files),
        "total_bytes": total_bytes,
        "total_mb": round(total_bytes / (1024 * 1024), 2),
        "uploaded": args.upload,
        "objects": [],
        "errors": [],
    }

    client = make_client() if args.upload else None
    uploaded_count = 0
    skipped_count = 0

    for path in files:
        rel = path.relative_to(root).as_posix()
        key = f"{prefix}/{safe_segment(rel)}"
        item: dict[str, Any] = {
            "local_path": str(path),
            "relative_path": rel,
            "r2_key": key,
            "size": path.stat().st_size,
            "url": public_url(public_base, key),
        }
        if args.hash:
            item["sha256"] = file_sha256(path)

        if args.upload:
            try:
                if args.skip_existing and head_exists(client, bucket, key):
                    item["status"] = "skipped_existing"
                    skipped_count += 1
                else:
                    upload_meta = upload_file(client, bucket, path, key)
                    item.update(upload_meta)
                    item["status"] = "uploaded"
                    uploaded_count += 1
            except Exception as e:
                item["status"] = "error"
                item["error"] = repr(e)
                manifest["errors"].append(item)
        else:
            item["status"] = "dry_run"
        manifest["objects"].append(item)

    manifest["uploaded_count"] = uploaded_count
    manifest["skipped_count"] = skipped_count
    out = Path(args.manifest_out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Root: {root}")
    print(f"Bucket: {bucket}")
    print(f"Prefix: {prefix}")
    print(f"Files: {len(files)}")
    print(f"Total: {manifest['total_mb']} MB")
    print(f"Manifest written: {out}")
    if args.upload:
        print(f"Uploaded: {uploaded_count}, skipped: {skipped_count}, errors: {len(manifest['errors'])}")
    else:
        print("DRY RUN ONLY. Add --upload to sync raw folders to R2.")


if __name__ == "__main__":
    main()

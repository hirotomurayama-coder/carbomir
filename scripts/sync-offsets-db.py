#!/usr/bin/env python3
"""
CarbonPlan OffsetsDB 同期スクリプト.

S3 から最新 zip をダウンロードして、Carbomir 向けに以下を生成:
  - src/lib/data/atlas/offsets-db/aggregates.json  集計サマリー
  - src/lib/data/atlas/offsets-db/projects.json    11k+ project master (trimmed)

credits.csv (65MB) はバンドルしない。aggregates 計算のみ使う。

実行:
  python3 scripts/sync-offsets-db.py
"""

import io
import json
import os
import sys
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

SRC_URL = "https://carbonplan-offsets-db.s3.us-west-2.amazonaws.com/production/latest/offsets-db.csv.zip"
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src" / "lib" / "data" / "atlas" / "offsets-db"


def fetch_zip(url: str) -> zipfile.ZipFile:
    print(f"Downloading {url} ...", file=sys.stderr)
    with urllib.request.urlopen(url) as resp:
        data = resp.read()
    print(f"  fetched {len(data) / 1024 / 1024:.1f} MB", file=sys.stderr)
    return zipfile.ZipFile(io.BytesIO(data))


def parse_csv(text: str) -> list[dict]:
    """軽量 CSV パーサ (quoted commas を考慮)."""
    import csv

    return list(csv.DictReader(io.StringIO(text)))


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    zf = fetch_zip(SRC_URL)
    files = zf.namelist()
    print(f"  files: {files}", file=sys.stderr)

    meta = json.loads(zf.read("metadata.json"))
    print(f"  generated_at: {meta.get('generated_at')}", file=sys.stderr)

    projects = parse_csv(zf.read("projects.csv").decode("utf-8-sig"))
    credits = parse_csv(zf.read("credits.csv").decode("utf-8-sig"))
    print(
        f"  projects: {len(projects)}, credits: {len(credits)}",
        file=sys.stderr,
    )

    # === Aggregates ===
    by_registry = defaultdict(
        lambda: {"projects": 0, "issued": 0.0, "retired": 0.0}
    )
    by_category = defaultdict(lambda: {"projects": 0, "issued": 0.0, "retired": 0.0})
    by_country = defaultdict(lambda: {"projects": 0, "issued": 0.0})
    by_status = defaultdict(int)
    by_year = defaultdict(lambda: {"issued": 0.0, "retired": 0.0})
    project_type_count = defaultdict(int)

    for p in projects:
        registry = p.get("registry") or "unknown"
        category = p.get("category") or "unknown"
        country = p.get("country") or "unknown"
        status = p.get("status") or "unknown"
        ptype = p.get("project_type") or "Unknown"
        issued = float(p.get("issued") or 0)
        retired = float(p.get("retired") or 0)

        by_registry[registry]["projects"] += 1
        by_registry[registry]["issued"] += issued
        by_registry[registry]["retired"] += retired
        by_category[category]["projects"] += 1
        by_category[category]["issued"] += issued
        by_category[category]["retired"] += retired
        by_country[country]["projects"] += 1
        by_country[country]["issued"] += issued
        by_status[status] += 1
        project_type_count[ptype] += 1

    for c in credits:
        date = (c.get("transaction_date") or "")[:4]
        tx = c.get("transaction_type") or ""
        qty = float(c.get("quantity") or 0)
        if not date.isdigit():
            continue
        if tx == "issuance":
            by_year[date]["issued"] += qty
        elif tx == "retirement":
            by_year[date]["retired"] += qty

    # Top-N country, project type
    def top_n(d: dict, n: int, sort_by: str | None = None) -> list[dict]:
        items = [{"label": k, **v} if isinstance(v, dict) else {"label": k, "count": v} for k, v in d.items()]
        key_fn = (lambda x: x.get(sort_by, x.get("count", 0))) if sort_by else (lambda x: x.get("count", 0))
        items.sort(key=key_fn, reverse=True)
        return items[:n]

    aggregates = {
        "source": {
            "name": "CarbonPlan OffsetsDB",
            "url": "https://carbonplan.org/research/offsets-db",
            "terms_url": "https://offsets-db-data.readthedocs.io/en/latest/TERMS-OF-DATA-ACCESS.html",
            "generated_at": meta.get("generated_at"),
            "synced_at_utc": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        },
        "totals": {
            "projects": len(projects),
            "credits_transactions": len(credits),
            "registries": len(by_registry),
            "countries": len(by_country),
            "total_issued": sum(d["issued"] for d in by_registry.values()),
            "total_retired": sum(d["retired"] for d in by_registry.values()),
        },
        "by_registry": [
            {"registry": k, **v} for k, v in sorted(by_registry.items(), key=lambda x: -x[1]["projects"])
        ],
        "by_category": [
            {"category": k, **v} for k, v in sorted(by_category.items(), key=lambda x: -x[1]["projects"])
        ],
        "by_country_top30": top_n(by_country, 30, sort_by="projects"),
        "by_status": [{"status": k, "count": v} for k, v in sorted(by_status.items(), key=lambda x: -x[1])],
        "by_year": [
            {"year": int(k), **v}
            for k, v in sorted(by_year.items())
            if int(k) >= 2000 and int(k) <= 2030
        ],
        "project_types_top20": top_n(project_type_count, 20),
    }

    # === Projects (trimmed) ===
    trimmed = []
    for p in projects:
        trimmed.append({
            "project_id": p.get("project_id"),
            "name": p.get("name"),
            "registry": p.get("registry"),
            "country": p.get("country"),
            "category": p.get("category"),
            "project_type": p.get("project_type"),
            "status": p.get("status"),
            "is_compliance": (p.get("is_compliance") == "True"),
            "issued": float(p.get("issued") or 0),
            "retired": float(p.get("retired") or 0),
            "proponent": p.get("proponent"),
            "project_url": p.get("project_url"),
            "first_issuance_at": (p.get("first_issuance_at") or "")[:10] or None,
        })

    (OUT_DIR / "aggregates.json").write_text(
        json.dumps(aggregates, ensure_ascii=False, indent=2)
    )
    (OUT_DIR / "projects.json").write_text(
        json.dumps(trimmed, ensure_ascii=False, separators=(",", ":"))
    )

    agg_size = (OUT_DIR / "aggregates.json").stat().st_size
    proj_size = (OUT_DIR / "projects.json").stat().st_size
    print(f"  aggregates.json: {agg_size / 1024:.1f} KB", file=sys.stderr)
    print(f"  projects.json: {proj_size / 1024 / 1024:.1f} MB", file=sys.stderr)
    print(f"Done. Output: {OUT_DIR}", file=sys.stderr)


if __name__ == "__main__":
    main()

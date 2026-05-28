"""
全 content/*.json に paywall_tier フィールドを一括挿入する一回限りのスクリプト.

対象:
- entities/*.json: sections の中で heading="編集部の論点" のオブジェクトに paywall_tier="standard"
- case-studies/*.json: 同上
- matrices/*.json: dimensions の中で key が carbomir_view または carbomir_quality_view のものに
  paywall_tier="standard"

既に paywall_tier が定義されているオブジェクトは触らない (idempotent).

JSON フォーマットは 2 種類混在 (flat 2-indent / standard nested-indent).
インデントを動的に検出して保持する.

Usage:
    python3 scripts/add-paywall-tier.py
"""

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = REPO_ROOT / "data" / "content"

ENTITY_DIR = CONTENT_DIR / "entities"
CASE_STUDY_DIR = CONTENT_DIR / "case-studies"
MATRIX_DIR = CONTENT_DIR / "matrices"

# 「編集部の論点」セクション (entities / case-studies で同じ構造).
# - (?P<i>[ \t]+) で heading/body のインデントを捕捉
# - 閉じブレース行のインデント (closing) はそれより 2 少ない (nested) または同じ (flat)
# - 末尾の閉じブレースの直前に paywall_tier を挿入する
EDITORIAL_SECTION_PATTERN = re.compile(
    r'(\{\n'
    r'(?P<i>[ \t]+)"heading": "編集部の論点",\n'
    r'(?P=i)"body": "(?:[^"\\]|\\.)*"'
    r'(?:,\n(?P=i)"source_urls": \[[\s\S]*?\])?'
    r')\n(?P<closing>[ \t]*\})',
    re.DOTALL,
)

# matrices の dimensions: carbomir_view / carbomir_quality_view の dimension オブジェクト
CARBOMIR_DIMENSION_PATTERN = re.compile(
    r'(\{\n'
    r'(?P<i>[ \t]+)"key": "(?:carbomir_view|carbomir_quality_view)",\n'
    r'(?P=i)"label_ja": "[^"]*"'
    r'(?:,\n(?P=i)"description": "[^"]*")?'
    r')\n(?P<closing>[ \t]*\})',
)


def _replace_section(m: re.Match) -> tuple[str, bool]:
    inner = m.group(1)
    indent = m.group("i")
    closing = m.group("closing")
    if '"paywall_tier"' in inner:
        return m.group(0), False
    return (
        f'{inner},\n{indent}"paywall_tier": "standard"\n{closing}',
        True,
    )


def patch_with(src: str, pattern: re.Pattern) -> tuple[str, int]:
    count = 0

    def replace(m: re.Match) -> str:
        nonlocal count
        replacement, did_change = _replace_section(m)
        if did_change:
            count += 1
        return replacement

    new_src = pattern.sub(replace, src)
    return new_src, count


def process(path: Path, pattern: re.Pattern) -> int:
    if not path.is_file() or path.suffix != ".json":
        return 0
    src = path.read_text(encoding="utf-8")
    new_src, count = patch_with(src, pattern)
    if count > 0 and new_src != src:
        path.write_text(new_src, encoding="utf-8")
    return count


def main() -> int:
    totals: dict[str, int] = {"entities": 0, "case-studies": 0, "matrices": 0}
    skipped: dict[str, list[str]] = {"entities": [], "case-studies": [], "matrices": []}

    targets = [
        ("entities", ENTITY_DIR, EDITORIAL_SECTION_PATTERN, "編集部の論点"),
        ("case-studies", CASE_STUDY_DIR, EDITORIAL_SECTION_PATTERN, "編集部の論点"),
        ("matrices", MATRIX_DIR, CARBOMIR_DIMENSION_PATTERN, None),
    ]

    for kind, directory, pattern, target_str in targets:
        for f in sorted(directory.glob("*.json")):
            n = process(f, pattern)
            totals[kind] += n
            if n == 0:
                text = f.read_text(encoding="utf-8")
                if target_str and target_str in text:
                    # 対象キーワードはあるのにマッチしなかった → regex 漏れ
                    skipped[kind].append(f.name)
                elif kind == "matrices" and re.search(
                    r'"carbomir_view"|"carbomir_quality_view"', text
                ):
                    skipped[kind].append(f.name)

    print("Inserted paywall_tier='standard':")
    for k, v in totals.items():
        print(f"  {k}: {v}")
    if any(skipped.values()):
        print()
        print("WARN: regex did not match these files (target keyword present):")
        for k, files in skipped.items():
            if files:
                print(f"  {k}: {files}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

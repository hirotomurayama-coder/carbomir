"""
全 seed ファイルに next_review_at を一括挿入する一回限りのスクリプト.

ルール (STYLE_GUIDE 準拠の保守的デフォルト):
- entity の type=regulation → +60 日 (規制関連は短サイクル)
- それ以外 → +120 日 (約 4 ヶ月)

既に next_review_at が定義されているオブジェクトは触らない (idempotent).

Usage:
    python3 scripts/fill-next-review-at.py
"""

import re
import sys
from datetime import date, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SEED_FILES = [
    REPO_ROOT / "src/lib/data/entities.ts",
    REPO_ROOT / "src/lib/data/comparisons.ts",
    REPO_ROOT / "src/lib/data/case-studies.ts",
    REPO_ROOT / "src/lib/data/faqs.ts",
]

# 規制系 type を持つ entity を識別するための inline tag
REGULATION_TYPE_PATTERN = re.compile(r'type:\s*"regulation"')

# `last_reviewed_at: "YYYY-MM-DD",` (後続行に next_review_at が無い)
LAST_REVIEWED_PATTERN = re.compile(
    r'((?:^|\n)([ \t]+))last_reviewed_at: "(\d{4})-(\d{2})-(\d{2})",'
    r'(?!\s*\n[ \t]+next_review_at)'
)


def add_days(y: int, m: int, d: int, n: int) -> str:
    return (date(y, m, d) + timedelta(days=n)).strftime("%Y-%m-%d")


def patch_file(path: Path) -> int:
    src = path.read_text(encoding="utf-8")
    inserted = 0

    # entity ファイルは type 周辺を見て、type=regulation の判定を行う
    is_entities = path.name == "entities.ts"

    # 各マッチごとに、その近傍に type: "regulation" があるか確認
    def replace(m: re.Match) -> str:
        nonlocal inserted
        prefix = m.group(1)
        indent = m.group(2)
        y, mo, d = int(m.group(3)), int(m.group(4)), int(m.group(5))

        # オブジェクト境界を雑に推定: 直前 1000 字を見て type: を探す
        start = max(0, m.start() - 2000)
        context = src[start:m.start()]
        # 最後の `{` 以降を「同一オブジェクトの先頭」とみなす
        last_open = context.rfind("{")
        obj_head = context[last_open:] if last_open >= 0 else context

        is_regulation = bool(is_entities and REGULATION_TYPE_PATTERN.search(obj_head))
        days = 60 if is_regulation else 120
        next_date = add_days(y, mo, d, days)

        inserted += 1
        return (
            f'{prefix}last_reviewed_at: "{y:04d}-{mo:02d}-{d:02d}",\n'
            f'{indent}next_review_at: "{next_date}",'
        )

    new_src = LAST_REVIEWED_PATTERN.sub(replace, src)
    if new_src != src:
        path.write_text(new_src, encoding="utf-8")
    return inserted


def main() -> int:
    total = 0
    for f in SEED_FILES:
        if not f.exists():
            print(f"[skip] {f}")
            continue
        n = patch_file(f)
        total += n
        print(f"[patched] {f.relative_to(REPO_ROOT)}: +{n}")
    print(f"\nTotal next_review_at inserted: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

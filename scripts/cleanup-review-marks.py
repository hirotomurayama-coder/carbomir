"""
公開コンテンツに残る (要確認: ...) の機械的整理.

ルール (STYLE_GUIDE 準拠):
- 「予定、要確認」「予定 (YYYY 年X月)、要確認」のような **予定であること自体を冗長表記している** 要確認 → 削除
- 「要確認: 第2フェーズ細目」「要確認: 法案進捗」「要確認: 主要協定の進捗」「要確認: 細部運用」「要確認: 海運統合後」「要確認: 直近の議論」「要確認: 直近の運用変更」「要確認: 最新法案ステータス」「要確認: 最新ガイダンス」「要確認: SBT FLAG 最新ガイダンス」のような **制度・規制が動的に変わる領域** → 「運用注視: ...」 に置換
- 単独 `(要確認)` や数値・実勢系 「要確認: 直近実勢」等は今回は触らない (個別判断)
"""

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SEED_FILES = [
    REPO_ROOT / "src/lib/data/entities.ts",
    REPO_ROOT / "src/lib/data/comparisons.ts",
    REPO_ROOT / "src/lib/data/case-studies.ts",
    REPO_ROOT / "src/lib/data/faqs.ts",
]

# Pattern 1: 予定 + 要確認 の冗長削除
# 例: (2026 年4月予定、要確認) → (2026 年4月予定)
PATTERN_SCHEDULED = re.compile(
    r'\((20\d\d 年[\d 月\-]*?予定)、要確認\)'
)

# Pattern 1b: 「YYYY 年X月時点、要確認」も削除 (時点 + 要確認 は冗長)
PATTERN_TIMEPOINT = re.compile(
    r'\s*\((20\d\d 年\d+月時点、要確認)\)'
)

# Pattern 1c: 「YYYY 年買収、要確認」も削除 (歴史事実 + 要確認 は冗長)
PATTERN_ACQUISITION = re.compile(
    r'\((20\d\d 年買収)、要確認\)'
)

# Pattern 2: 構造的不確実性は「運用注視: ...」 へリラベル
# 個別キーワードを列挙 (機械的に置換するための whitelist)
RUNNING_KEYWORDS = [
    "第2フェーズ移行時の細目",
    "細部運用",
    "法案進捗",
    "最新法案ステータス",
    "主要協定の進捗",
    "最新進捗",
    "海運統合後",
    "直近の議論",
    "直近の運用変更",
    "最新ガイダンス",
    "SBT FLAG 最新ガイダンス",
    "第2フェーズで明確化",
    "vintage 等条件",
    "直近変動",
    "直近詳細",
    "公式リストとの一致",
    "詳細条件",
]

# Pattern 3: 「最新の運用規程要確認」 など、コロンなしの「○○要確認」
COLON_LESS_REPLACEMENTS = [
    ("(最新の運用規程要確認)", "(運用注視: 最新の運用規程)"),
]


def patch_file(path: Path) -> tuple[int, int]:
    src = path.read_text(encoding="utf-8")

    # Pattern 1 (予定 + 要確認 → 予定だけ残す)
    new_src, scheduled_n = PATTERN_SCHEDULED.subn(r'(\1)', src)
    # Pattern 1b (時点 + 要確認 → 丸ごと削除)
    new_src, timepoint_n = PATTERN_TIMEPOINT.subn('', new_src)
    # Pattern 1c (買収 + 要確認 → 買収のみ残す)
    new_src, acquisition_n = PATTERN_ACQUISITION.subn(r'(\1)', new_src)

    # Pattern 2 (運用注視: 化)
    runtime_n = 0
    for kw in RUNNING_KEYWORDS:
        before = new_src
        new_src = new_src.replace(f"要確認: {kw}", f"運用注視: {kw}")
        runtime_n += before.count(f"要確認: {kw}")

    # Pattern 3 (コロンなし)
    colonless_n = 0
    for old, new in COLON_LESS_REPLACEMENTS:
        before = new_src
        new_src = new_src.replace(old, new)
        colonless_n += before.count(old)

    if new_src != src:
        path.write_text(new_src, encoding="utf-8")

    return scheduled_n + timepoint_n + acquisition_n, runtime_n + colonless_n


def main() -> int:
    total_sched, total_rt = 0, 0
    for f in SEED_FILES:
        if not f.exists():
            print(f"[skip] {f}")
            continue
        s, r = patch_file(f)
        total_sched += s
        total_rt += r
        print(f"[patched] {f.relative_to(REPO_ROOT)}: scheduled={s}, runtime={r}")
    print(f"\nTotal: scheduled-deleted={total_sched}, runtime-relabeled={total_rt}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

/**
 * carboncredits.jp 記事 corpus と entity / case-study のタイトル照合 (純粋関数).
 *
 * 媒体 (column/global 等の記事) を「関連ニュース」として entity / case-study に
 * 結びつける。slug マップ (glossary) と違い 1:N・時間軸のニュースなので、
 * entity 名 (name_ja / name_en / 別名) を記事タイトルに部分一致させて拾う。
 * 照合元は `scripts/sync-media.ts` が書き出す media-articles.json。
 */

export type MediaArticle = {
  id: number;
  title: string;
  link: string;
  modified: string;
  /** link パス先頭セグメント (column / global / japan 等) */
  section?: string;
  /** 抜粋 (タグ除去済み・短縮) */
  excerpt?: string;
};

/**
 * slug 別の照合別名 (主に英字名の企業が日本語記事ではカタカナ表記になるケース)。
 * 編集が増やせる最小辞書。name_ja/name_en で拾えるものはここに載せない。
 */
const ALIASES: Record<string, string[]> = {
  microsoft: ["マイクロソフト"],
  apple: ["アップル"],
  salesforce: ["セールスフォース"],
  shopify: ["ショッピファイ"],
  climeworks: ["クライムワークス"],
  frontier: ["フロンティア"],
  "mitsubishi-corporation": ["三菱商事"],
  "mitsui-co": ["三井物産"],
};

type NameLike = {
  slug: string;
  name_ja?: string;
  name_en?: string;
  abbreviation?: string;
};

/** entity / case-study から照合キーワード集合を作る (2 文字未満は除外) */
export function mediaMatchTerms(e: NameLike & { company?: string; title?: string }): string[] {
  const raw = [
    e.name_ja,
    e.name_en,
    e.abbreviation,
    e.company,
    ...(ALIASES[e.slug] ?? []),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    const v = t?.trim();
    if (!v || v.length < 2 || seen.has(v.toLowerCase())) continue;
    seen.add(v.toLowerCase());
    out.push(v);
  }
  return out;
}

function hasCJK(s: string): boolean {
  return /[　-〿぀-ヿ㐀-鿿＀-￯]/.test(s);
}

/**
 * 1 つの照合語に対するマッチャを作る。
 * - 英数字語: 単語境界マッチ ([a-z0-9] に挟まれた部分一致は弾く)。
 *   例: "k-ets" は "uk-ets" に、"shop" は "shops" に一致させない。
 * - 日本語 (CJK) を含む語: 部分一致 (日本語に語境界が無いため。CJK は十分特異)。
 * 入力 term は小文字化済みを前提。
 */
function makeMatcher(term: string): (loweredTitle: string) => boolean {
  if (hasCJK(term)) return (title) => title.includes(term);
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`);
  return (title) => re.test(title);
}

/**
 * terms のいずれかがタイトルにマッチする記事を modified 降順で返す。
 * 英数字語は単語境界、日本語語は部分一致。大文字小文字は無視。
 */
export function matchArticles(
  terms: string[],
  articles: MediaArticle[],
  limit = 8,
): MediaArticle[] {
  const matchers = terms
    .filter((t) => t.length >= 2)
    .map((t) => makeMatcher(t.toLowerCase()));
  if (matchers.length === 0) return [];
  const hits = articles.filter((a) => {
    const title = a.title.toLowerCase();
    return matchers.some((m) => m(title));
  });
  hits.sort((a, b) => (a.modified < b.modified ? 1 : a.modified > b.modified ? -1 : 0));
  return hits.slice(0, limit);
}

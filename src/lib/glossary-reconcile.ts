/**
 * glossary-map と wp-sitemap の照合 (PROVENANCE.md §7).
 *
 * 純粋関数。`scripts/sync-glossary.ts` が wp-sitemap から取得した
 * `{wp_slug, lastmod}` 集合と現在の glossary-map を突き合わせ、
 *   - drift    : 媒体記事が前回記録から更新された (要再レビュー)
 *   - dangling : マップ先 wp_slug が sitemap に無い (媒体側で削除/改名)
 *   - orphan   : sitemap にあるが entries にも unmapped にも無い (新規記事候補)
 * を検出し、machine フィールドのみ更新した entries を返す。
 * hand-authored フィールド (wp_slug / excerpt) は保持する。
 *
 * テスト容易性のため現在時刻は `now` 引数で受け取る (Date 非依存)。
 */
import type {
  GlossaryEntry,
  GlossaryMap,
  GlossaryReviewState,
} from "./data/glossary-map";

export type SitemapEntry = { wp_slug: string; lastmod: string };

export type DriftItem = {
  carbomir_slug: string;
  wp_slug: string;
  media_lastmod: string;
  prev_media_lastmod: string | null;
};
export type DanglingItem = { carbomir_slug: string; wp_slug: string };
export type OrphanItem = { wp_slug: string; lastmod: string };

export type ReconcileResult = {
  drift: DriftItem[];
  dangling: DanglingItem[];
  orphan: OrphanItem[];
  /** machine フィールドを更新した entries (hand-authored は保持) */
  updatedEntries: Record<string, GlossaryEntry>;
};

/**
 * glossary-map と sitemap を照合する。
 * @param map    現在の glossary-map (entries + unmapped)
 * @param sitemap wp-sitemap から得た {wp_slug, lastmod} 集合
 * @param now    照合時刻 (ISO)。synced_at に書き込む
 */
export function reconcile(
  map: GlossaryMap,
  sitemap: SitemapEntry[],
  now: string,
): ReconcileResult {
  const sm = new Map<string, string>();
  for (const s of sitemap) sm.set(s.wp_slug, s.lastmod);

  const drift: DriftItem[] = [];
  const dangling: DanglingItem[] = [];
  const updatedEntries: Record<string, GlossaryEntry> = {};
  const mappedWpSlugs = new Set<string>();

  for (const [slug, entry] of Object.entries(map.entries)) {
    mappedWpSlugs.add(entry.wp_slug);
    const sitemapLastmod = sm.get(entry.wp_slug);

    if (sitemapLastmod === undefined) {
      // 媒体側に記事が無い → dangling。media_lastmod は据え置き。
      dangling.push({ carbomir_slug: slug, wp_slug: entry.wp_slug });
      updatedEntries[slug] = {
        ...entry,
        synced_at: now,
        review_state: "dangling",
      };
      continue;
    }

    const changed =
      entry.media_lastmod !== null && entry.media_lastmod !== sitemapLastmod;
    let state: GlossaryReviewState;
    if (changed || entry.review_state === "drifted") {
      // 新規更新、または前回 drift で未レビューのまま → drift 継続
      state = "drifted";
      drift.push({
        carbomir_slug: slug,
        wp_slug: entry.wp_slug,
        media_lastmod: sitemapLastmod,
        prev_media_lastmod: entry.media_lastmod,
      });
    } else {
      state = "fresh";
    }

    updatedEntries[slug] = {
      ...entry,
      media_lastmod: sitemapLastmod,
      synced_at: now,
      review_state: state,
    };
  }

  // orphan: sitemap にあるが、どの entry の wp_slug でもなく unmapped にも無い
  const unmappedSet = new Set(map.unmapped);
  const orphan: OrphanItem[] = sitemap
    .filter((s) => !mappedWpSlugs.has(s.wp_slug) && !unmappedSet.has(s.wp_slug))
    .map((s) => ({ wp_slug: s.wp_slug, lastmod: s.lastmod }));

  return { drift, dangling, orphan, updatedEntries };
}

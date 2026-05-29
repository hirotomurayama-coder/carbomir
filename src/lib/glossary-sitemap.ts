/**
 * wp-sitemap (glossary post type) のパース (PROVENANCE.md §6).
 *
 * `<url><loc>https://carboncredits.jp/glossary/{slug}/</loc>
 *   <lastmod>ISO8601</lastmod></url>` から {wp_slug, lastmod} を取り出す純粋関数。
 * 本文は取り込まない (参照＋抜粋) ので、必要なのは slug と lastmod だけ。
 */
import type { SitemapEntry } from "./glossary-reconcile";

/** wp-sitemap XML から glossary の {wp_slug, lastmod} 配列を抽出する */
export function parseSitemap(xml: string): SitemapEntry[] {
  const out: SitemapEntry[] = [];
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  for (const block of blocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (!loc || !lastmod) continue;
    const slug = loc.match(/\/glossary\/([^/]+)\/?$/)?.[1];
    if (!slug) continue;
    out.push({ wp_slug: slug, lastmod });
  }
  return out;
}

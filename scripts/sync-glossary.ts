/**
 * glossary-map 同期 CLI (PROVENANCE.md §6, 取り込み経路 A).
 *
 * carboncredits.jp の WP コアサイトマップ (glossary post type) から
 * {wp_slug, lastmod} を取得し、`src/lib/glossary-reconcile.ts` で照合して
 * `data/content/glossary-map.json` に書き戻す。
 *
 *   - 本文は取り込まない (参照＋抜粋)。必要なのは slug と lastmod だけ。
 *   - 媒体は AI クローラーを robots.txt で Disallow している (同社ポリシー)。
 *     本スクリプトは UA を偽装して回避しない。403 等は log してスキップ
 *     (exit 0)。許可済みコンテキスト (WAF allowlist / 自社回線) から実行する。
 *
 * 使い方:  npm run sync:glossary
 * 環境変数: GLOSSARY_SYNC_UA  許可済み User-Agent (任意)
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { GlossaryMap } from "../src/lib/data/glossary-map";
import { reconcile } from "../src/lib/glossary-reconcile";
import { parseSitemap } from "../src/lib/glossary-sitemap";

const SITEMAP_URL =
  "https://carboncredits.jp/wp-sitemap-posts-glossary-1.xml";
const UA =
  process.env.GLOSSARY_SYNC_UA ??
  "carbomir-glossary-sync (+https://carboncredits.jp/carbomir)";
const MAP_FILE = path.join(process.cwd(), "data", "content", "glossary-map.json");

async function main(): Promise<void> {
  let xml: string;
  try {
    const res = await fetch(SITEMAP_URL, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.error(
        `[sync-glossary] ${SITEMAP_URL} → HTTP ${res.status}. スキップ (bot ポリシー: WAF allowlist / 許可済み回線が必要)。`,
      );
      process.exit(0);
    }
    xml = await res.text();
  } catch (e) {
    console.error(`[sync-glossary] fetch 失敗: ${(e as Error).message}. スキップ。`);
    process.exit(0);
  }

  const sitemap = parseSitemap(xml);
  console.log(`[sync-glossary] sitemap entries: ${sitemap.length}`);
  if (sitemap.length === 0) {
    console.error("[sync-glossary] glossary slug が 0 件。サイトマップ構造変化の可能性。書き戻しを中止。");
    process.exit(0);
  }

  const map = JSON.parse(readFileSync(MAP_FILE, "utf8")) as GlossaryMap;
  const now = new Date().toISOString();
  const r = reconcile(map, sitemap, now);

  const next: GlossaryMap = {
    ...map,
    last_synced_at: now,
    entries: { ...map.entries, ...r.updatedEntries },
    last_orphans: r.orphan,
  };
  writeFileSync(MAP_FILE, `${JSON.stringify(next, null, 2)}\n`);

  console.log(
    `[sync-glossary] drift=${r.drift.length} dangling=${r.dangling.length} orphan=${r.orphan.length} → ${MAP_FILE}`,
  );
  if (r.drift.length)
    console.log("  drift:", r.drift.map((d) => d.carbomir_slug).join(", "));
  if (r.dangling.length)
    console.log(
      "  dangling:",
      r.dangling.map((d) => `${d.carbomir_slug}(${d.wp_slug})`).join(", "),
    );
  if (r.orphan.length)
    console.log("  orphan:", r.orphan.map((o) => o.wp_slug).join(", "));
}

void main();

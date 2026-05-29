/**
 * carboncredits.jp 用語集リンクの後方互換シム (PROVENANCE Phase 2).
 *
 * 実データは `glossary-map.ts` (= `data/content/glossary-map.json`) に升格した。
 * 本ファイルは既存 consumer の import 互換を保つための薄いラッパー:
 *   - carbonCreditsUrl(slug)       … 媒体記事 URL (canonical /glossary/ 形)
 *   - listLinkedSlugs()            … 対応のある Carbomir slug 一覧
 *   - CARBONCREDITS_SLUG_MAP       … slug → wp_slug の派生 map (後方互換)
 *   - CARBONCREDITS_UNMAPPED_SLUGS … 媒体にあるが未収録の slug
 *
 * consumer: entities/page.tsx, entities/metadata-panel.tsx, entities/entities-explorer.tsx
 */
import { getGlossaryEntry, getGlossaryMap } from "./glossary-map";

/** Carbomir slug から carboncredits.jp の用語記事 URL を返す. 対応なしは undefined. */
export function carbonCreditsUrl(carbomirSlug: string): string | undefined {
  return getGlossaryEntry(carbomirSlug)?.canonical_url;
}

/**
 * 対応マッピングが存在する Carbomir slug 一覧.
 * "用語集として何件が carboncredits.jp と相互参照可能か" の集計に使う.
 */
export function listLinkedSlugs(): string[] {
  return Object.keys(getGlossaryMap().entries);
}

/**
 * Carbomir slug → carboncredits.jp の wp_slug (派生 map, 後方互換).
 * 真実の源は glossary-map.json。直接参照より carbonCreditsUrl() を推奨。
 */
export const CARBONCREDITS_SLUG_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(getGlossaryMap().entries).map(([slug, entry]) => [slug, entry.wp_slug]),
);

/**
 * carboncredits.jp に存在するが Carbomir には未収録の slug 一覧.
 * 補完計画の入力として使う。真実の源は glossary-map.json の unmapped。
 */
export const CARBONCREDITS_UNMAPPED_SLUGS: string[] = getGlossaryMap().unmapped;

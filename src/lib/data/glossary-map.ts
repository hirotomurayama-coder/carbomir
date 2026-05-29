/**
 * glossary-map backbone (PROVENANCE.md §7).
 *
 * carboncredits.jp の用語集 (媒体レーンの正準) と Carbomir entity の対応表.
 * 旧 `glossary-links.ts` の flat map を升格したもので、媒体記事ごとに
 * canonical_url / 抜粋 / 最終更新 (media_lastmod) / 照合状態を持つ.
 *
 * - 手保守フィールド: wp_slug, excerpt (origin: "tool")
 * - sync 自動更新フィールド: media_lastmod, synced_at, review_state, last_synced_at
 *   (`scripts/sync-glossary.ts` が wp-sitemap から照合して書き戻す。PROVENANCE.md §6)
 *
 * 実体は `data/content/glossary-map.json`。**静的 import** で読み込むため
 * client component からも安全に使える (fs / server-only にしない)。
 */
import glossaryMapData from "../../../data/content/glossary-map.json";

/** 照合状態。unsynced=未同期, fresh=最新, drifted=媒体更新あり, dangling=媒体側に記事なし */
export type GlossaryReviewState = "unsynced" | "fresh" | "drifted" | "dangling";

export type GlossaryEntry = {
  /** carboncredits.jp 側の slug (同期キー) */
  wp_slug: string;
  /** 媒体記事の正準 URL (/glossary/{wp_slug}/) */
  canonical_url: string;
  /** ツール編集の短い抜粋 (origin: "tool")。未設定は null */
  excerpt: string | null;
  /** 媒体記事の最終更新 (sitemap lastmod, ISO)。未同期は null */
  media_lastmod: string | null;
  /** 最終照合時刻 (ISO)。未同期は null */
  synced_at: string | null;
  review_state: GlossaryReviewState;
};

export type GlossaryMap = {
  /** 全体の最終同期時刻 (ISO)。未同期は null */
  last_synced_at: string | null;
  /** Carbomir entity slug → エントリ */
  entries: Record<string, GlossaryEntry>;
  /** 媒体に存在するが Carbomir 未収録の wp_slug 一覧 (補完計画の入力) */
  unmapped: string[];
};

const GLOSSARY_MAP = glossaryMapData as unknown as GlossaryMap;

/** backbone 全体を返す (server: /editorial 照合表示, sync 書き戻し前の読み込み) */
export function getGlossaryMap(): GlossaryMap {
  return GLOSSARY_MAP;
}

/** Carbomir slug に対応する媒体エントリを返す. 対応なしは undefined. */
export function getGlossaryEntry(carbomirSlug: string): GlossaryEntry | undefined {
  return GLOSSARY_MAP.entries[carbomirSlug];
}

import "server-only";

import fs from "node:fs";
import path from "node:path";

/**
 * Filesystem-backed content store for the seed layer.
 *
 * Phase Ε (軽量編集 UI) で導入。
 * これまで TS リテラルで持っていたシードデータを `data/content/<type>/<slug>.json` に
 * 1 ファイル 1 オブジェクトで分割保存する。
 *
 * 設計:
 *   - 読み込みは初回アクセス時にディレクトリスキャン (lazy load)
 *   - 開発時は毎回 require/cache が走るが、SSG build 後は固定
 *   - dev でも production でも server side のみ (server-only)
 *   - 書き込みは `/admin/edit/*` の Server Action からのみ
 *   - Vercel etc. のサーバレス環境では writes が persist しないため dev 専用
 *
 * Cache の挙動:
 *   - listAll/readBySlug は ContentMode に応じて cache 戦略を変える
 *   - "snapshot": モジュール初期化時に全件読み込み (production / build) → 高速
 *   - "fresh": リクエストごとに ディスクから再読み込み (dev) → 編集の即時反映
 */

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, "data", "content");

/** モジュール識別子 ↔ ディレクトリ名のマップ */
export type ContentTypeKey =
  | "entities"
  | "matrices"
  | "timeline"
  | "case-studies"
  | "faqs";

const CONTENT_DIR: Record<ContentTypeKey, string> = {
  entities: "entities",
  matrices: "matrices",
  timeline: "timeline",
  "case-studies": "case-studies",
  faqs: "faqs",
};

/** 開発時は fresh, 本番は snapshot */
const MODE: "fresh" | "snapshot" =
  process.env.NODE_ENV === "production" ? "snapshot" : "fresh";

/** snapshot 用キャッシュ */
const snapshotCache: Partial<Record<ContentTypeKey, unknown[]>> = {};

function safeSlug(slug: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(slug)) {
    throw new Error(`Invalid slug for content file: ${slug}`);
  }
  return slug;
}

function dirFor(type: ContentTypeKey): string {
  return path.join(CONTENT_ROOT, CONTENT_DIR[type]);
}

function readJson<T>(filePath: string): T | undefined {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw err;
  }
}

function readAll<T>(type: ContentTypeKey): T[] {
  const dir = dirFor(type);
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir);
  const out: T[] = [];
  for (const name of entries) {
    if (!name.endsWith(".json")) continue;
    const item = readJson<T>(path.join(dir, name));
    if (item) out.push(item);
  }
  return out;
}

/* ============================================================
 * Public API
 * ============================================================ */

/** ある type の全レコードを取得 */
export function listAll<T>(type: ContentTypeKey): T[] {
  if (MODE === "snapshot") {
    if (!snapshotCache[type]) {
      snapshotCache[type] = readAll<T>(type);
    }
    return snapshotCache[type] as T[];
  }
  return readAll<T>(type);
}

/** ある type の slug 指定 1 件取得 */
export function findBySlug<T>(
  type: ContentTypeKey,
  slug: string
): T | undefined {
  const file = path.join(dirFor(type), `${safeSlug(slug)}.json`);
  return readJson<T>(file);
}

/** ある type の slug 一覧 (ファイル名から抽出) */
export function listSlugs(type: ContentTypeKey): string[] {
  const dir = dirFor(type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".json"))
    .map((n) => n.replace(/\.json$/, ""));
}

/** 書き込み (Server Action から) — 書き込み後は snapshot cache を invalidate */
export function saveBySlug<T extends { slug: string }>(
  type: ContentTypeKey,
  data: T
): void {
  if (!data.slug) throw new Error("Cannot save: missing slug");
  const dir = dirFor(type);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${safeSlug(data.slug)}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
  // invalidate snapshot
  delete snapshotCache[type];
}

/** 削除 */
export function deleteBySlug(type: ContentTypeKey, slug: string): boolean {
  const file = path.join(dirFor(type), `${safeSlug(slug)}.json`);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  delete snapshotCache[type];
  return true;
}

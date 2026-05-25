import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import type {
  AiDraft,
  AiDraftStatus,
  AiDraftType,
} from "@/lib/types";

/**
 * AI ドラフトのファイルシステムストア.
 *
 * 設計判断:
 *   - 当面は Supabase に置かず、`data/ai-drafts/*.json` で運用する
 *   - 編集ワークフローが軽量 (1日数件程度) なので RDB は overkill
 *   - git で diff が見られる利点 (監査 / レビュー履歴の透明性)
 *   - 将来 Supabase 化する際もこのモジュール経由で隠蔽できる
 */

const DRAFTS_DIR = path.join(process.cwd(), "data", "ai-drafts");

// 書込時のみ呼ぶ. Vercel serverless はランタイム fs が read-only なので
// read パス (listDrafts / findDraftById) では呼んではならない (EROFS → 500).
async function ensureDir(): Promise<void> {
  try {
    await fs.mkdir(DRAFTS_DIR, { recursive: true });
  } catch (err: unknown) {
    // 既存ディレクトリ + 書込不可 fs (Vercel 本番) の両方を握りつぶす.
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EEXIST" || code === "EROFS" || code === "EACCES") return;
    throw err;
  }
}

function safeId(id: string): string {
  // パストラバーサル防止: 英数 + ハイフン + アンダースコアのみ許可
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid draft id: ${id}`);
  }
  return id;
}

export function generateDraftId(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6);
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}-${rand}`;
}

export async function saveDraft(draft: AiDraft): Promise<void> {
  await ensureDir();
  const file = path.join(DRAFTS_DIR, `${safeId(draft.id)}.json`);
  await fs.writeFile(file, JSON.stringify(draft, null, 2), "utf-8");
}

export async function findDraftById(id: string): Promise<AiDraft | undefined> {
  try {
    const file = path.join(DRAFTS_DIR, `${safeId(id)}.json`);
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as AiDraft;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw err;
  }
}

export async function listDrafts(filter?: {
  status?: AiDraftStatus;
  type?: AiDraftType;
}): Promise<AiDraft[]> {
  // 読込専用パス. ensureDir() は呼ばない (Vercel 本番で EROFS 500 になるため).
  // ディレクトリ未存在の場合は ENOENT を空配列で返す.
  let entries: string[];
  try {
    entries = await fs.readdir(DRAFTS_DIR);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const out: AiDraft[] = [];
  for (const name of entries) {
    if (!name.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(DRAFTS_DIR, name), "utf-8");
      const d = JSON.parse(raw) as AiDraft;
      if (filter?.status && d.status !== filter.status) continue;
      if (filter?.type && d.type !== filter.type) continue;
      out.push(d);
    } catch {
      // 壊れた JSON は無視 (将来は warning に)
    }
  }
  // 新しい順
  out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return out;
}

export async function updateDraftStatus(
  id: string,
  next: { status: AiDraftStatus; reviewer_notes?: string }
): Promise<AiDraft | undefined> {
  const existing = await findDraftById(id);
  if (!existing) return undefined;
  const updated: AiDraft = {
    ...existing,
    status: next.status,
    reviewer_notes: next.reviewer_notes ?? existing.reviewer_notes,
    reviewed_at: new Date().toISOString(),
  };
  await saveDraft(updated);
  return updated;
}

export async function deleteDraft(id: string): Promise<boolean> {
  try {
    const file = path.join(DRAFTS_DIR, `${safeId(id)}.json`);
    await fs.unlink(file);
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw err;
  }
}

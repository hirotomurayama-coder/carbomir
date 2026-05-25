"use server";

import { revalidatePath } from "next/cache";
import {
  deleteBySlug,
  saveBySlug,
  type ContentTypeKey,
} from "@/lib/data/content-store";

/**
 * /admin/edit/* 用 Server Actions.
 *
 * 認証は未実装 (Phase 4 で middleware に組み込む想定).
 * 本番デプロイ環境では filesystem 書込が不可能なので dev only.
 */

const PUBLIC_PATHS_BY_TYPE: Record<ContentTypeKey, (slug: string) => string[]> = {
  entities: (slug) => [`/entities`, `/entities/${slug}`, `/players`, `/policies`],
  matrices: (slug) => [`/matrices`, `/matrices/${slug}`],
  timeline: (slug) => [`/timeline`, `/timeline/${slug}`],
  "case-studies": (slug) => [`/case-studies`, `/case-studies/${slug}`],
  faqs: (_slug) => [`/faq`],
};

export async function saveContentAction<T extends { slug: string }>(
  type: ContentTypeKey,
  data: T
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!data || typeof data !== "object" || typeof data.slug !== "string") {
      return { ok: false, error: "Invalid data: missing slug" };
    }
    saveBySlug(type, data);
    // admin と public 両方の cache を invalidate
    revalidatePath(`/admin/edit/${type}`);
    revalidatePath(`/admin/edit/${type}/${data.slug}`);
    revalidatePath("/"); // ホームの「追う」など
    for (const p of PUBLIC_PATHS_BY_TYPE[type](data.slug)) {
      revalidatePath(p);
    }
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function deleteContentAction(
  type: ContentTypeKey,
  slug: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const removed = deleteBySlug(type, slug);
    if (!removed) return { ok: false, error: "Not found" };
    revalidatePath(`/admin/edit/${type}`);
    revalidatePath("/");
    for (const p of PUBLIC_PATHS_BY_TYPE[type](slug)) {
      revalidatePath(p);
    }
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: (err as Error).message };
  }
}

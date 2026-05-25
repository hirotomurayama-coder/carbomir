"use server";

import { revalidatePath } from "next/cache";
import {
  deleteDraft,
  updateDraftStatus,
} from "@/lib/data/ai-drafts";
import type { AiDraftStatus } from "@/lib/types";

/**
 * Server Actions for /admin/drafts.
 *
 * 認証は Phase 4 で middleware に組み込む想定。
 * 現状は誰でも叩ける状態であることを CLAUDE.md に明記する。
 */

const ALLOWED: AiDraftStatus[] = ["approved", "rejected", "applied", "pending"];

export async function setDraftStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as AiDraftStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id) throw new Error("missing id");
  if (!ALLOWED.includes(status)) throw new Error(`invalid status: ${status}`);

  const updated = await updateDraftStatus(id, {
    status,
    reviewer_notes: notes || undefined,
  });
  if (!updated) throw new Error(`draft not found: ${id}`);

  revalidatePath("/admin/drafts");
  revalidatePath(`/admin/drafts/${id}`);
}

export async function deleteDraftAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("missing id");
  await deleteDraft(id);
  revalidatePath("/admin/drafts");
}

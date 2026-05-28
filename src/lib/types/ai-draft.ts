/**
 * AI ドラフト (編集サイドツール) の型定義.
 *
 * AI で生成した entity / faq / case_study のドラフトを編集者が
 * レビュー (approve / reject) するための中間状態。
 * 本番採用時は seed TS / Supabase に手作業で適用する想定。
 */

export type AiDraftType = "entity" | "faq" | "case_study";

export const AI_DRAFT_TYPE_LABEL: Record<AiDraftType, string> = {
  entity: "Entity",
  faq: "FAQ",
  case_study: "Case Study",
};

export type AiDraftStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "applied"; // approved 後、seed に取り込み済み

export const AI_DRAFT_STATUS_LABEL: Record<AiDraftStatus, string> = {
  pending: "未レビュー",
  approved: "承認済み",
  rejected: "却下",
  applied: "適用済み",
};

export type AiDraft = {
  id: string; // ULID-ish (yyyymmddhhmmss + 短いランダム)
  type: AiDraftType;
  topic: string; // 編集者が指定したテーマ (e.g. "Cercarbono レジストリの最新動向")
  target_slug?: string; // 既存更新の場合は対象 slug、新規作成は undefined
  prompt: string; // 実際に使われた system + user prompt の連結 (監査用)
  model: string; // 利用した Claude モデル名
  content: unknown; // JSON 化された draft 本体 (entity / faq / case_study の型)
  status: AiDraftStatus;
  created_at: string; // ISO 8601
  reviewed_at?: string; // ISO 8601
  reviewer_notes?: string;
};

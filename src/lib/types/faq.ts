/**
 * FAQ (実務 Q&A) の型定義.
 */

export type FaqCategory =
  | "procurement" // 調達
  | "reporting" // 報告
  | "regulation" // 制度
  | "quality"; // 品質

export const FAQ_CATEGORY_LABEL: Record<FaqCategory, string> = {
  procurement: "調達",
  reporting: "報告",
  regulation: "制度",
  quality: "品質",
};

export type FAQItem = {
  slug: string;
  question: string;
  short_answer: string; // 1-2 文の要約
  detailed_md: string; // Markdown 詳細解説
  category: FaqCategory;
  related_entity_slugs: string[];
  related_matrix_slugs?: string[];
  source_urls?: { label: string; url: string }[];
  tags: string[];
  last_reviewed_at: string;
  /** 次回レビュー予定日 (任意, YYYY-MM-DD) */
  next_review_at?: string;
  status: "draft" | "published" | "archived";
};

export type EntityType =
  | "methodology"
  | "regulation"
  | "player"
  | "market"
  | "technology"
  | "project";

export type EntityRef = {
  slug: string;
  name_ja: string;
  name_en?: string;
};

export type RelationType =
  | "parent_of"
  | "depends_on"
  | "supersedes"
  | "competes_with"
  | "equivalent_to";

export type EntityRelation = {
  to_slug: string;
  relation: RelationType;
  note?: string;
};

export type EntitySection = {
  heading: string;
  body: string;
  source_urls?: { label: string; url: string }[];
};

export type Entity = {
  slug: string;
  type: EntityType;
  name_ja: string;
  name_en?: string;
  abbreviation?: string;
  summary: string;
  sections: EntitySection[];
  related: EntityRelation[];
  related_matrix_slugs: string[];
  tags: string[];
  last_reviewed_at: string;
  status: "draft" | "published" | "archived";
};

export type ComparisonDimension = {
  key: string;
  label_ja: string;
  description?: string;
};

export type ComparisonCell = {
  value: string;
  source_url?: string;
  source_label?: string;
  note?: string;
};

export type ComparisonMatrix = {
  slug: string;
  title: string;
  description: string;
  dimensions: ComparisonDimension[];
  entities: EntityRef[];
  cells: Record<string, Record<string, ComparisonCell>>;
  last_reviewed_at: string;
  status: "draft" | "published" | "archived";
};

/* Entity type の UI ラベル (社内記号ではなく一般語) */
export const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  methodology: "メソドロジー",
  regulation: "制度・規制",
  player: "プレイヤー",
  market: "市場",
  technology: "技術",
  project: "プロジェクト",
};

export const RELATION_LABEL: Record<RelationType, string> = {
  parent_of: "上位概念",
  depends_on: "依存先",
  supersedes: "後継",
  competes_with: "競合",
  equivalent_to: "同等",
};

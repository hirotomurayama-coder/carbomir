/**
 * Supabase DB スキーマの TS 型 (手書き)。
 *
 * 将来的に `supabase gen types typescript --project-id <id>` で
 * 自動生成版に置換可能。その際の構造を踏襲した形にしてある。
 *
 * 参照スキーマ:
 *  - supabase/migrations/0001_initial_schema.sql
 *  - supabase/migrations/0002_align_with_types.sql
 *  - supabase/migrations/0003_timeline_slug.sql
 */

import type {
  ComparisonCell,
  ComparisonDimension,
  EntityRef,
  EntitySection,
  EntityType,
  MatrixCategory,
  PolicyStatus,
  RelationType,
  TimelineCategory,
  TimelineSource,
} from "@/lib/types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ContentStatus = "draft" | "published" | "archived";

export type Database = {
  public: {
    Tables: {
      entities: {
        Row: {
          id: string;
          type: EntityType;
          slug: string;
          name_ja: string;
          name_en: string | null;
          summary: string | null;
          content_md: string | null;
          category: string | null;
          tags: string[];
          status: ContentStatus;
          version: number;
          last_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
          sections: EntitySection[];
          abbreviation: string | null;
          related_matrix_slugs: string[];
          jurisdiction: string | null;
          established_year: number | null;
          operator: string | null;
          geographic_scope: string | null;
          website_url: string | null;
          credit_unit: string | null;
          parent_company: string | null;
          business_role: string | null;
          policy_status: PolicyStatus | null;
          next_milestone: string | null;
        };
        Insert: {
          id?: string;
          type: EntityType;
          slug: string;
          name_ja: string;
          name_en?: string | null;
          summary?: string | null;
          content_md?: string | null;
          category?: string | null;
          tags?: string[];
          status?: ContentStatus;
          version?: number;
          last_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          sections?: EntitySection[];
          abbreviation?: string | null;
          related_matrix_slugs?: string[];
          jurisdiction?: string | null;
          established_year?: number | null;
          operator?: string | null;
          geographic_scope?: string | null;
          website_url?: string | null;
          credit_unit?: string | null;
          parent_company?: string | null;
          business_role?: string | null;
          policy_status?: PolicyStatus | null;
          next_milestone?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["entities"]["Insert"]>;
      };
      entity_relations: {
        Row: {
          id: string;
          from_entity_id: string;
          to_entity_id: string;
          relation_type: RelationType;
          weight: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_entity_id: string;
          to_entity_id: string;
          relation_type: RelationType;
          weight?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["entity_relations"]["Insert"]
        >;
      };
      timeline_events: {
        Row: {
          id: string;
          event_date: string;
          title: string;
          summary: string | null;
          content_md: string | null;
          affected_entity_ids: string[];
          category: TimelineCategory | null;
          importance: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
          slug: string;
          affected_entity_slugs: string[];
          source_urls: TimelineSource[];
        };
        Insert: {
          id?: string;
          event_date: string;
          title: string;
          summary?: string | null;
          content_md?: string | null;
          affected_entity_ids?: string[];
          category?: TimelineCategory | null;
          importance?: number;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
          slug: string;
          affected_entity_slugs?: string[];
          source_urls?: TimelineSource[];
        };
        Update: Partial<
          Database["public"]["Tables"]["timeline_events"]["Insert"]
        >;
      };
      comparison_matrices: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          dimensions: ComparisonDimension[];
          entity_ids: string[];
          cells: Record<string, Record<string, ComparisonCell>>;
          status: ContentStatus;
          last_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
          entity_refs: EntityRef[];
          category: MatrixCategory | null;
          tags: string[];
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          dimensions?: ComparisonDimension[];
          entity_ids?: string[];
          cells?: Record<string, Record<string, ComparisonCell>>;
          status?: ContentStatus;
          last_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          entity_refs?: EntityRef[];
          category?: MatrixCategory | null;
          tags?: string[];
        };
        Update: Partial<
          Database["public"]["Tables"]["comparison_matrices"]["Insert"]
        >;
      };
      ai_drafts: {
        Row: {
          id: string;
          target_table: "entities" | "timeline_events" | "comparison_matrices";
          target_id: string | null;
          draft_content: Json;
          generated_at: string;
          generated_by: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          status: "pending" | "approved" | "rejected";
          reviewer_notes: string | null;
        };
        Insert: {
          id?: string;
          target_table: "entities" | "timeline_events" | "comparison_matrices";
          target_id?: string | null;
          draft_content: Json;
          generated_at?: string;
          generated_by?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          status?: "pending" | "approved" | "rejected";
          reviewer_notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ai_drafts"]["Insert"]>;
      };
    };
  };
};

/** 便利な抜き出し型 */
export type DbEntityRow = Database["public"]["Tables"]["entities"]["Row"];
export type DbTimelineEventRow =
  Database["public"]["Tables"]["timeline_events"]["Row"];
export type DbComparisonMatrixRow =
  Database["public"]["Tables"]["comparison_matrices"]["Row"];
export type DbEntityRelationRow =
  Database["public"]["Tables"]["entity_relations"]["Row"];
export type DbAiDraftRow = Database["public"]["Tables"]["ai_drafts"]["Row"];

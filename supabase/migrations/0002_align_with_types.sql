-- Carbomir migration 0002: TS 型定義との整合
-- 0001 で定義した entities.content_md は markdown 全文用に温存しつつ、
-- UI が必要とする構造化フィールド (sections / abbreviation / related_matrix_slugs)
-- を JSONB / text[] で並列に持つ。エンティティ間関係は entity_relations を利用する。

-- ========================================
-- entities: 構造化セクション・略称・関連行列スラッグ
-- ========================================
alter table public.entities
  add column if not exists sections jsonb not null default '[]'::jsonb;

alter table public.entities
  add column if not exists abbreviation text;

alter table public.entities
  add column if not exists related_matrix_slugs text[] not null default '{}';

create index if not exists idx_entities_related_matrix_slugs
  on public.entities using gin(related_matrix_slugs);

-- ========================================
-- comparison_matrices: dimensions/cells/entities の整合
-- ========================================
-- 既存 entity_ids (uuid[]) は内部参照用に残し、UI 表示用に
-- スラッグ・表示名を保持した entity_refs (jsonb) を追加する。
-- これにより matrix 表示時に entities テーブルへ join せずに描画可能。
alter table public.comparison_matrices
  add column if not exists entity_refs jsonb not null default '[]'::jsonb;

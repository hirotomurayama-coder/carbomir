-- Carbomir migration 0004: 比較行列にカテゴリとタグを追加
-- /matrices インデックスでのグルーピング・絞り込み用。
-- カテゴリは下記 5 種のいずれかまたは NULL。
--   scheme / standard / methodology / market / eligibility

alter table public.comparison_matrices
  add column if not exists category text
    check (
      category is null
      or category in ('scheme', 'standard', 'methodology', 'market', 'eligibility')
    );

alter table public.comparison_matrices
  add column if not exists tags text[] not null default '{}';

create index if not exists idx_matrices_category
  on public.comparison_matrices(category);

create index if not exists idx_matrices_tags
  on public.comparison_matrices using gin(tags);

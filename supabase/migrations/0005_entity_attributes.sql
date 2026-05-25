-- Carbomir migration 0005: entities に構造化属性を追加
-- 事業会社の実務者向けに「いつ・誰が・どこで」を一目で示すフィールド群。
-- すべて任意 (NULL 可)。

alter table public.entities
  add column if not exists jurisdiction text;

alter table public.entities
  add column if not exists established_year int;

alter table public.entities
  add column if not exists operator text;

alter table public.entities
  add column if not exists geographic_scope text;

alter table public.entities
  add column if not exists website_url text;

alter table public.entities
  add column if not exists credit_unit text;

-- 検索・フィルタを想定する列にインデックス
create index if not exists idx_entities_jurisdiction
  on public.entities(jurisdiction);

create index if not exists idx_entities_established_year
  on public.entities(established_year);

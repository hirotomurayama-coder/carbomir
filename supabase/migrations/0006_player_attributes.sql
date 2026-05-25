-- Carbomir migration 0006: entities に player 型向け属性を追加
-- player type の entity (Climeworks, 三菱商事 等) を扱うための補助属性。
-- 任意 (NULL 可)。regulation/methodology 型でも使える可能性があるが、
-- 主に player 型を想定。

alter table public.entities
  add column if not exists parent_company text;

alter table public.entities
  add column if not exists business_role text;

create index if not exists idx_entities_business_role
  on public.entities(business_role);

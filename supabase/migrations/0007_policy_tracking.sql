-- Carbomir migration 0007: entities にポリシー追跡属性を追加
-- 制度・規制系 entity (type=regulation) で進捗ステータスと次マイルストーンを管理する。
-- 任意 (NULL 可)。他 type でも使える設計。

alter table public.entities
  add column if not exists policy_status text
    check (
      policy_status is null
      or policy_status in ('active', 'transition', 'pilot', 'draft', 'discontinued')
    );

alter table public.entities
  add column if not exists next_milestone text;

create index if not exists idx_entities_policy_status
  on public.entities(policy_status);

-- Carbomir migration 0003: timeline_events に slug と affected_entity_slugs を追加
-- 0001 の timeline_events.affected_entity_ids (uuid[]) は内部参照用に残し、
-- UI 表示用に slug ベースの affected_entity_slugs (text[]) を並列で保持する。
-- /timeline/[slug] ルーティングのため slug カラムを必須化する。

alter table public.timeline_events
  add column if not exists slug text;

-- 既存行を埋めるためのプレースホルダー (空の場合のみ)。本番投入前に seed が必ず実値を入れる。
update public.timeline_events
  set slug = id::text
  where slug is null;

alter table public.timeline_events
  alter column slug set not null;

create unique index if not exists idx_timeline_slug_unique
  on public.timeline_events(slug);

alter table public.timeline_events
  add column if not exists affected_entity_slugs text[] not null default '{}';

create index if not exists idx_timeline_affected_slugs
  on public.timeline_events using gin(affected_entity_slugs);

-- 出典をラベル付きで保持するために source_urls を text[] -> jsonb に置換
-- 0001 時点で text[] として作っていたが、UI ではラベル + URL のペアが必須なため。
alter table public.timeline_events
  drop column if exists source_urls;

alter table public.timeline_events
  add column source_urls jsonb not null default '[]'::jsonb;

-- published 行の公開ポリシー (0001 で他テーブルに既存。明示性のため再掲)
drop policy if exists "published timeline is readable" on public.timeline_events;
create policy "published timeline is readable"
  on public.timeline_events for select
  using (status = 'published');

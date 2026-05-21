-- Carbomir initial schema (S層)
-- 参照: CLAUDE.md §10 Knowledge Base コアスキーマ

-- ========================================
-- entities: A/D/E すべての参照元となる統一エンティティ
-- ========================================
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('methodology','regulation','player','market','technology','project')),
  slug text unique not null,
  name_ja text not null,
  name_en text,
  summary text,
  content_md text,
  category text,
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  version int not null default 1,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_entities_type on public.entities(type);
create index if not exists idx_entities_status on public.entities(status);
create index if not exists idx_entities_tags on public.entities using gin(tags);

-- ========================================
-- entity_relations: エンティティ間関係
-- ========================================
create table if not exists public.entity_relations (
  id uuid primary key default gen_random_uuid(),
  from_entity_id uuid not null references public.entities(id) on delete cascade,
  to_entity_id uuid not null references public.entities(id) on delete cascade,
  relation_type text not null check (relation_type in ('parent_of','depends_on','supersedes','competes_with','equivalent_to')),
  weight numeric not null default 1.0,
  notes text,
  created_at timestamptz not null default now(),
  unique (from_entity_id, to_entity_id, relation_type)
);

create index if not exists idx_relations_from on public.entity_relations(from_entity_id);
create index if not exists idx_relations_to on public.entity_relations(to_entity_id);

-- ========================================
-- timeline_events: L2-D 時系列体系化
-- ========================================
create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  title text not null,
  summary text,
  content_md text,
  affected_entity_ids uuid[] default '{}',
  category text check (category in ('regulatory','market','technology','methodology')),
  importance int not null default 3 check (importance between 1 and 5),
  source_urls text[] default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_timeline_date on public.timeline_events(event_date desc);
create index if not exists idx_timeline_importance on public.timeline_events(importance desc);
create index if not exists idx_timeline_status on public.timeline_events(status);

-- ========================================
-- comparison_matrices: L2-E 比較体系化 (主力商品)
-- ========================================
create table if not exists public.comparison_matrices (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  dimensions jsonb not null default '[]'::jsonb,
  entity_ids uuid[] default '{}',
  cells jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_matrices_status on public.comparison_matrices(status);

-- ========================================
-- ai_drafts: AI 生成下書き管理
-- ========================================
create table if not exists public.ai_drafts (
  id uuid primary key default gen_random_uuid(),
  target_table text not null check (target_table in ('entities','timeline_events','comparison_matrices')),
  target_id uuid,
  draft_content jsonb not null,
  generated_at timestamptz not null default now(),
  generated_by text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_notes text
);

create index if not exists idx_drafts_status on public.ai_drafts(status);
create index if not exists idx_drafts_target on public.ai_drafts(target_table, target_id);

-- ========================================
-- updated_at 自動更新トリガー
-- ========================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_entities_updated_at on public.entities;
create trigger trg_entities_updated_at
  before update on public.entities
  for each row execute function public.set_updated_at();

drop trigger if exists trg_timeline_updated_at on public.timeline_events;
create trigger trg_timeline_updated_at
  before update on public.timeline_events
  for each row execute function public.set_updated_at();

drop trigger if exists trg_matrices_updated_at on public.comparison_matrices;
create trigger trg_matrices_updated_at
  before update on public.comparison_matrices
  for each row execute function public.set_updated_at();

-- ========================================
-- Row-Level Security (公開コンテンツの読み取り公開)
-- ========================================
alter table public.entities enable row level security;
alter table public.entity_relations enable row level security;
alter table public.timeline_events enable row level security;
alter table public.comparison_matrices enable row level security;
alter table public.ai_drafts enable row level security;

-- published 状態のみ anon に公開 (Free プラン UI 用)
-- Paid プランの content_md 等の出し分けは別マイグレーションで RLS を拡張する想定
drop policy if exists "published entities are readable" on public.entities;
create policy "published entities are readable"
  on public.entities for select
  using (status = 'published');

drop policy if exists "published timeline is readable" on public.timeline_events;
create policy "published timeline is readable"
  on public.timeline_events for select
  using (status = 'published');

drop policy if exists "published matrices are readable" on public.comparison_matrices;
create policy "published matrices are readable"
  on public.comparison_matrices for select
  using (status = 'published');

-- ai_drafts は service_role のみアクセス (anon/authenticated は読めない)
-- 何もポリシーを定義しないことで RLS がデフォルトですべて拒否する

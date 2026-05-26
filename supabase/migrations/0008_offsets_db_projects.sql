-- Carbomir migration 0008: OffsetsDB projects テーブル
-- CarbonPlan OffsetsDB が集約する 11,640 件のオフセットプロジェクト個別。
-- 元データは MIT ライセンス公開。Carbomir 側では同期スクリプト
-- (scripts/sync-offsets-db.py) で upsert する。
--
-- 取引履歴 (credits.csv 53 万件) は当面 Carbomir に取り込まない
-- (per-project の集計値のみを保持)。将来 0009 で transactions テーブルを追加する想定。

create table if not exists public.offsets_db_projects (
  -- レジストリ固有 ID (例: "VCS6027"). 全 registry 横断でユニーク。
  project_id text primary key,
  name text not null,
  -- "verra" / "gold-standard" / "american-carbon-registry" 等の OffsetsDB 内部コード
  registry text not null,
  country text,
  category text,
  project_type text,
  status text,
  is_compliance boolean not null default false,
  -- 累計発行・償却 (tCO2e). credits.csv の集計値。
  issued numeric(20, 2) not null default 0,
  retired numeric(20, 2) not null default 0,
  proponent text,
  project_url text,
  first_issuance_at date,
  -- 同期元 snapshot 識別子と同期時刻
  source_generated_at timestamptz,
  synced_at timestamptz not null default now()
);

create index if not exists idx_offsets_db_projects_registry
  on public.offsets_db_projects(registry);
create index if not exists idx_offsets_db_projects_category
  on public.offsets_db_projects(category);
create index if not exists idx_offsets_db_projects_country
  on public.offsets_db_projects(country);
create index if not exists idx_offsets_db_projects_status
  on public.offsets_db_projects(status);
create index if not exists idx_offsets_db_projects_issued
  on public.offsets_db_projects(issued desc);

-- 全文検索 (name + proponent + project_id). 簡易 'simple' 構成
-- (日本語形態素解析は不要、英語名と Project ID の部分一致用途のため).
create index if not exists idx_offsets_db_projects_fts
  on public.offsets_db_projects
  using gin (
    to_tsvector(
      'simple',
      coalesce(name, '') || ' ' ||
      coalesce(proponent, '') || ' ' ||
      project_id
    )
  );

-- RLS: 外部公開データなので anon 含め全員に読み取りを許可。
-- 書き込みは service_role のみ (policy を定義しないことで暗黙拒否).
alter table public.offsets_db_projects enable row level security;

drop policy if exists "offsets_db_projects are readable by anyone"
  on public.offsets_db_projects;
create policy "offsets_db_projects are readable by anyone"
  on public.offsets_db_projects for select
  using (true);

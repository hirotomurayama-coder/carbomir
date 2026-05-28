import "server-only";

import { getSupabaseClient } from "@/lib/supabase";
import type { OffsetsDbProject } from "@/lib/types";
import {
  listInstruments as seedListInstruments,
  listMechanisms as seedListMechanisms,
  listCooperativeAgreements as seedListCooperativeAgreements,
  getOffsetsDbAggregates as seedGetOffsetsDbAggregates,
  listOffsetsDbProjects as seedListOffsetsDbProjects,
  findOffsetsDbProject as seedFindOffsetsDbProject,
} from "@/lib/data/atlas";

/* ------------------------------------------------------------
 * World Bank データセット (静的、現状 seed 直読み)
 * ------------------------------------------------------------ */

export async function listInstruments() {
  return seedListInstruments();
}

export async function listMechanisms() {
  return seedListMechanisms();
}

export async function listCooperativeAgreements() {
  return seedListCooperativeAgreements();
}

/* ------------------------------------------------------------
 * OffsetsDB
 * ------------------------------------------------------------ */

export async function getOffsetsDbAggregates() {
  return seedGetOffsetsDbAggregates();
}

const OFFSETS_DB_PROJECT_COLUMNS =
  "project_id, name, registry, country, category, project_type, status, is_compliance, issued, retired, proponent, project_url, first_issuance_at";

export async function listOffsetsDbProjects() {
  const sb = getSupabaseClient();
  if (!sb) return seedListOffsetsDbProjects();

  // 11,640 件 ≦ デフォルトの PostgREST limit (1000) を超えるので
  // batch (range) で取得する。Supabase の `.range()` は inclusive。
  const BATCH = 1000;
  const out: OffsetsDbProjectRow[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from("offsets_db_projects")
      .select(OFFSETS_DB_PROJECT_COLUMNS)
      .order("issued", { ascending: false })
      .range(from, from + BATCH - 1);
    if (error) {
      console.error("[queries.listOffsetsDbProjects]", error);
      return seedListOffsetsDbProjects();
    }
    const rows = (data as OffsetsDbProjectRow[]) ?? [];
    out.push(...rows);
    if (rows.length < BATCH) break;
    from += BATCH;
  }
  return out.map(rowToOffsetsDbProject);
}

export async function findOffsetsDbProject(projectId: string) {
  const sb = getSupabaseClient();
  if (!sb) return seedFindOffsetsDbProject(projectId);

  const { data, error } = await sb
    .from("offsets_db_projects")
    .select(OFFSETS_DB_PROJECT_COLUMNS)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    console.error("[queries.findOffsetsDbProject]", error);
    return seedFindOffsetsDbProject(projectId);
  }
  if (!data) return undefined;
  return rowToOffsetsDbProject(data as OffsetsDbProjectRow);
}

/* ------------------------------------------------------------
 * Filtered query (server-side filter/sort/pagination)
 * ------------------------------------------------------------ */

export type OffsetsDbSortKey = "issued" | "retired" | "name";

export type OffsetsDbProjectsQuery = {
  /** name / proponent / project_id への部分一致検索 */
  query?: string;
  registries?: string[];
  categories?: string[];
  statuses?: string[];
  /** issued > 0 のみ */
  onlyIssued?: boolean;
  sortKey?: OffsetsDbSortKey;
  /** 0-indexed */
  page?: number;
  pageSize?: number;
};

export type OffsetsDbProjectsResult = {
  rows: OffsetsDbProject[];
  totalCount: number;
};

export type OffsetsDbFilterOptions = {
  registries: string[];
  categories: string[];
  statuses: string[];
};

const OFFSETS_DEFAULT_PAGE_SIZE = 50;

/**
 * フィルタ・ソート・ページネーション付きで OffsetsDB プロジェクトを取得する。
 * Supabase 接続時は PostgREST、未接続時は seed in-memory フィルタ。
 */
export async function listOffsetsDbProjectsFiltered(
  params: OffsetsDbProjectsQuery
): Promise<OffsetsDbProjectsResult> {
  const sortKey: OffsetsDbSortKey = params.sortKey ?? "issued";
  const page = Math.max(0, params.page ?? 0);
  const pageSize = params.pageSize ?? OFFSETS_DEFAULT_PAGE_SIZE;

  const sb = getSupabaseClient();
  if (!sb) {
    return seedListOffsetsDbProjectsFiltered(params, sortKey, page, pageSize);
  }

  // ---- Supabase クエリ構築 ----
  let q = sb
    .from("offsets_db_projects")
    .select(OFFSETS_DB_PROJECT_COLUMNS, { count: "exact" });

  if (params.registries && params.registries.length > 0) {
    q = q.in("registry", params.registries);
  }
  if (params.categories && params.categories.length > 0) {
    q = q.in("category", params.categories);
  }
  if (params.statuses && params.statuses.length > 0) {
    q = q.in("status", params.statuses);
  }
  if (params.onlyIssued) {
    q = q.gt("issued", 0);
  }
  if (params.query) {
    // ilike pattern の % / _ と PostgREST .or() 区切り文字 , ) ( を strip して安全化
    const safe = params.query
      .replace(/[%_]/g, " ")
      .replace(/[,()]/g, " ")
      .trim();
    if (safe.length > 0) {
      q = q.or(
        [
          `name.ilike.%${safe}%`,
          `proponent.ilike.%${safe}%`,
          `project_id.ilike.%${safe}%`,
        ].join(",")
      );
    }
  }

  if (sortKey === "name") {
    q = q.order("name", { ascending: true });
  } else {
    q = q.order(sortKey, { ascending: false, nullsFirst: false });
  }

  const from = page * pageSize;
  q = q.range(from, from + pageSize - 1);

  const { data, error, count } = await q;
  if (error) {
    console.error("[queries.listOffsetsDbProjectsFiltered]", error);
    return seedListOffsetsDbProjectsFiltered(params, sortKey, page, pageSize);
  }
  return {
    rows: ((data as OffsetsDbProjectRow[]) ?? []).map(rowToOffsetsDbProject),
    totalCount: count ?? 0,
  };
}

function seedListOffsetsDbProjectsFiltered(
  params: OffsetsDbProjectsQuery,
  sortKey: OffsetsDbSortKey,
  page: number,
  pageSize: number
): OffsetsDbProjectsResult {
  const all = seedListOffsetsDbProjects();
  const registrySet =
    params.registries && params.registries.length > 0
      ? new Set(params.registries)
      : null;
  const categorySet =
    params.categories && params.categories.length > 0
      ? new Set(params.categories)
      : null;
  const statusSet =
    params.statuses && params.statuses.length > 0
      ? new Set(params.statuses)
      : null;
  const queryLower = params.query?.trim().toLowerCase();

  const filtered = all.filter((p) => {
    if (registrySet && !registrySet.has(p.registry)) return false;
    if (categorySet && !categorySet.has(p.category ?? "unknown")) return false;
    if (statusSet && !statusSet.has(p.status ?? "unknown")) return false;
    if (params.onlyIssued && (!p.issued || p.issued <= 0)) return false;
    if (queryLower) {
      const hay = [
        p.name,
        p.proponent ?? "",
        p.project_id,
        p.country ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(queryLower)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortKey === "name") return a.name.localeCompare(b.name);
    return (b[sortKey] ?? 0) - (a[sortKey] ?? 0);
  });

  const start = page * pageSize;
  return {
    rows: filtered.slice(start, start + pageSize),
    totalCount: filtered.length,
  };
}

/**
 * フィルタドロップダウン用の選択肢一覧。
 * aggregates.json (集計済) を流用するので Supabase 接続有無に関係なく定数コスト。
 */
export async function getOffsetsDbFilterOptions(): Promise<OffsetsDbFilterOptions> {
  const agg = seedGetOffsetsDbAggregates();
  return {
    registries: agg.by_registry.map((r) => r.registry).sort(),
    categories: agg.by_category.map((r) => r.category).sort(),
    statuses: agg.by_status.map((r) => r.status).sort(),
  };
}

type OffsetsDbProjectRow = {
  project_id: string;
  name: string;
  registry: string;
  country: string | null;
  category: string | null;
  project_type: string | null;
  status: string | null;
  is_compliance: boolean;
  issued: number | string; // numeric は string で返ることがある
  retired: number | string;
  proponent: string | null;
  project_url: string | null;
  first_issuance_at: string | null;
};

function rowToOffsetsDbProject(row: OffsetsDbProjectRow) {
  return {
    project_id: row.project_id,
    name: row.name,
    registry: row.registry,
    country: row.country ?? undefined,
    category: row.category ?? undefined,
    project_type: row.project_type ?? undefined,
    status: row.status ?? undefined,
    is_compliance: row.is_compliance,
    issued: typeof row.issued === "string" ? Number(row.issued) : row.issued,
    retired: typeof row.retired === "string" ? Number(row.retired) : row.retired,
    proponent: row.proponent ?? undefined,
    project_url: row.project_url ?? undefined,
    first_issuance_at: row.first_issuance_at ?? undefined,
  };
}

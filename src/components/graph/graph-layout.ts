import type { Entity, EntityType } from "@/lib/types";

/**
 * 関係グラフの座標レイアウト計算。
 * Polar 座標 + type 別セクターで各 entity の位置を決める。
 * 純粋関数。テストもしやすい。
 */

export const CANVAS_W = 960;
export const CANVAS_H = 720;
export const CENTER_X = CANVAS_W / 2;
export const CENTER_Y = CANVAS_H / 2;
export const ORBIT_RADIUS = 280;
export const PADDING = 6; // 同一タイプ内のノード間隔の最小角度 (度)

export type GraphNode = {
  slug: string;
  name: string;
  type: EntityType;
  x: number;
  y: number;
  connections: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  /** 何らかの relation_type。表示時の差別化に使う */
  relation: string;
  /** 補足 */
  note?: string;
};

/** type 別セクター (時計の 12 時を 0 度、時計回り。レイアウトは標準数学座標で計算) */
export type Sector = { start: number; end: number };

export const TYPE_SECTORS: Record<EntityType, Sector> = {
  regulation: { start: -180, end: -10 }, // 上半分 + 左
  player: { start: 10, end: 170 }, // 下半分 + 右
  methodology: { start: -190, end: -185 }, // 左下端
  technology: { start: 175, end: 180 }, // 右下端
  market: { start: 173, end: 175 },
  project: { start: -195, end: -190 },
};

const TYPE_ORDER: EntityType[] = [
  "regulation",
  "methodology",
  "technology",
  "market",
  "project",
  "player",
];

/**
 * 型別にグループ化したあと、各型内で entities を slug 順にソートして
 * 等間隔で円周上に配置する。
 */
export function computeNodes(
  entities: Entity[],
  edgeCountBySlug: Map<string, number>
): GraphNode[] {
  // type 別にグループ
  const groups = new Map<EntityType, Entity[]>();
  for (const e of entities) {
    const arr = groups.get(e.type) ?? [];
    arr.push(e);
    groups.set(e.type, arr);
  }
  // それぞれ slug 順にソート (安定)
  for (const arr of groups.values()) arr.sort((a, b) => a.slug.localeCompare(b.slug));

  // 各型に動的にセクター角度を割り当てる (count に応じて広く)
  // 一気にやるよりシンプルに: 全 entities を type 別ブロックに並べて、円周全体に均等配分
  // ただしブロック間に gap を入れて視覚的に分離する
  const totalCount = entities.length;
  const blockCount = TYPE_ORDER.filter((t) => (groups.get(t) ?? []).length > 0).length;
  const GAP_DEG = 8; // ブロック間ギャップ
  const usableArc = 360 - blockCount * GAP_DEG;

  // 一周のうち、各 type に entity 数比で角度を配分
  const nodes: GraphNode[] = [];
  let currentAngle = -90; // 12 時から開始
  for (const type of TYPE_ORDER) {
    const arr = groups.get(type) ?? [];
    if (arr.length === 0) continue;
    const arcSize = (arr.length / totalCount) * usableArc;
    // arr.length === 1 のときは中央配置
    arr.forEach((e, i) => {
      const t = arr.length === 1 ? 0.5 : i / (arr.length - 1);
      const angle = currentAngle + arcSize * t;
      const rad = (angle * Math.PI) / 180;
      nodes.push({
        slug: e.slug,
        name: e.name_ja,
        type: e.type,
        x: CENTER_X + ORBIT_RADIUS * Math.cos(rad),
        y: CENTER_Y + ORBIT_RADIUS * Math.sin(rad),
        connections: edgeCountBySlug.get(e.slug) ?? 0,
      });
    });
    currentAngle += arcSize + GAP_DEG;
  }
  return nodes;
}

/** entity.related から forward edges を抽出 */
export function computeEdges(entities: Entity[]): GraphEdge[] {
  const slugSet = new Set(entities.map((e) => e.slug));
  const out: GraphEdge[] = [];
  for (const e of entities) {
    for (const r of e.related) {
      if (!slugSet.has(r.to_slug)) continue;
      out.push({
        from: e.slug,
        to: r.to_slug,
        relation: r.relation,
        note: r.note,
      });
    }
  }
  return out;
}

/** 各 entity の接続数を集計 (forward + inbound 両方) */
export function computeConnectionCounts(edges: GraphEdge[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of edges) {
    m.set(e.from, (m.get(e.from) ?? 0) + 1);
    m.set(e.to, (m.get(e.to) ?? 0) + 1);
  }
  return m;
}

/** connection 数に応じたノード半径 (6-14) */
export function nodeRadius(connections: number): number {
  return Math.min(14, 6 + connections * 0.8);
}

/** ノード位置の Map (slug → node) */
export function indexNodes(nodes: GraphNode[]): Map<string, GraphNode> {
  const m = new Map<string, GraphNode>();
  for (const n of nodes) m.set(n.slug, n);
  return m;
}

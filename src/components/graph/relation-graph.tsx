"use client";

import * as React from "react";
import Link from "next/link";
import type { Entity, EntityType } from "@/lib/types";
import { ENTITY_TYPE_LABEL } from "@/lib/types";
import {
  CANVAS_H,
  CANVAS_W,
  computeConnectionCounts,
  computeEdges,
  computeNodes,
  indexNodes,
  nodeRadius,
  type GraphNode,
} from "./graph-layout";

/**
 * 関係グラフ: entities + entity_relations を SVG で可視化。
 * ノード = entity、エッジ = forward relation。
 * Hover で接続ノード/エッジを強調、Click で詳細ページへ。
 * Type フィルタで表示種別を絞れる。
 */

type Props = {
  entities: Entity[];
};

const TYPE_COLORS: Record<EntityType, string> = {
  regulation: "#0ea5e9", // sky-500
  player: "#10b981", // emerald-500
  methodology: "#f59e0b", // amber-500
  technology: "#a855f7", // violet-500
  market: "#ec4899", // pink-500
  project: "#f97316", // orange-500
};

const TYPE_LABEL_ORDER: EntityType[] = [
  "regulation",
  "player",
  "methodology",
  "technology",
  "market",
  "project",
];

export function RelationGraph({ entities }: Props) {
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [hiddenTypes, setHiddenTypes] = React.useState<Set<EntityType>>(new Set());

  const visibleEntities = React.useMemo(
    () => entities.filter((e) => !hiddenTypes.has(e.type)),
    [entities, hiddenTypes]
  );

  const edges = React.useMemo(() => computeEdges(visibleEntities), [visibleEntities]);
  const connectionCounts = React.useMemo(
    () => computeConnectionCounts(edges),
    [edges]
  );
  const nodes = React.useMemo(
    () => computeNodes(visibleEntities, connectionCounts),
    [visibleEntities, connectionCounts]
  );
  const nodeIndex = React.useMemo(() => indexNodes(nodes), [nodes]);

  // hover 中に強調する slugs (hover ノードとその接続先)
  const highlighted = React.useMemo(() => {
    if (!hovered) return null;
    const set = new Set<string>([hovered]);
    for (const e of edges) {
      if (e.from === hovered) set.add(e.to);
      if (e.to === hovered) set.add(e.from);
    }
    return set;
  }, [hovered, edges]);

  const toggleType = (type: EntityType) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // type 別カウント (表示前のフィルタ前データから)
  const typeCounts = React.useMemo(() => {
    const m = new Map<EntityType, number>();
    for (const e of entities) m.set(e.type, (m.get(e.type) ?? 0) + 1);
    return m;
  }, [entities]);

  const hoveredNode = hovered ? nodeIndex.get(hovered) : null;

  return (
    <div className="space-y-3">
      {/* Type filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_LABEL_ORDER.map((t) => {
            const count = typeCounts.get(t) ?? 0;
            if (count === 0) return null;
            const isHidden = hiddenTypes.has(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                aria-pressed={!isHidden}
                className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] transition-colors ${
                  isHidden
                    ? "border-border bg-muted/30 text-muted-foreground/60 line-through"
                    : "border-border bg-background text-foreground hover:bg-muted/40"
                }`}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[t], opacity: isHidden ? 0.3 : 1 }}
                />
                {ENTITY_TYPE_LABEL[t]}
                <span className="metric-number opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <span className="label-mono text-muted-foreground">
          <span className="metric-number text-foreground">{nodes.length}</span> nodes ·
          <span className="metric-number text-foreground ml-1">{edges.length}</span>{" "}
          edges
        </span>
      </div>

      {/* Canvas */}
      <div className="rounded-lg border border-border bg-card overflow-hidden relative">
        <div className="overflow-x-auto">
          <svg
            width="100%"
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            className="block min-w-[640px]"
            style={{ maxHeight: 720 }}
            role="img"
            aria-label="entity 間の関係グラフ"
          >
            {/* Edges */}
            <g>
              {edges.map((edge, i) => {
                const from = nodeIndex.get(edge.from);
                const to = nodeIndex.get(edge.to);
                if (!from || !to) return null;
                const isHighlighted =
                  highlighted && (edge.from === hovered || edge.to === hovered);
                const isDimmed = highlighted && !isHighlighted;
                return (
                  <line
                    key={`edge-${i}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isHighlighted ? "var(--accent, #0ea5e9)" : "currentColor"}
                    strokeWidth={isHighlighted ? 1.8 : 1}
                    strokeOpacity={isHighlighted ? 0.8 : isDimmed ? 0.05 : 0.15}
                    className="text-muted-foreground transition-all"
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {nodes.map((node) => {
                const r = nodeRadius(node.connections);
                const color = TYPE_COLORS[node.type];
                const isHovered = hovered === node.slug;
                const isHighlighted = highlighted?.has(node.slug);
                const isDimmed = highlighted && !isHighlighted;
                return (
                  <Link
                    key={node.slug}
                    href={`/entities/${node.slug}`}
                    aria-label={`${node.name} の詳細`}
                  >
                    <g
                      onMouseEnter={() => setHovered(node.slug)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(node.slug)}
                      onBlur={() => setHovered(null)}
                      className="cursor-pointer transition-opacity"
                      style={{ opacity: isDimmed ? 0.25 : 1 }}
                    >
                      {/* ホバー時のリング */}
                      {isHighlighted && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={r + 4}
                          fill="none"
                          stroke={color}
                          strokeOpacity={isHovered ? 0.6 : 0.3}
                          strokeWidth={2}
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={r}
                        fill={color}
                        fillOpacity={0.85}
                        stroke="var(--card)"
                        strokeWidth={1.5}
                      />
                      {/* ラベル: ホバー時または接続数が多い時のみ */}
                      {(isHovered || node.connections >= 4) && (
                        <text
                          x={node.x}
                          y={node.y + r + 12}
                          textAnchor="middle"
                          className="text-[10px] font-medium fill-foreground pointer-events-none"
                          style={{ paintOrder: "stroke" }}
                          stroke="var(--card)"
                          strokeWidth={3}
                          strokeLinejoin="round"
                        >
                          {node.name.length > 10
                            ? node.name.slice(0, 10) + "…"
                            : node.name}
                        </text>
                      )}
                    </g>
                  </Link>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Hover details overlay */}
        {hoveredNode && (
          <HoveredCard
            node={hoveredNode}
            connections={connectionCounts.get(hoveredNode.slug) ?? 0}
            entity={entities.find((e) => e.slug === hoveredNode.slug)}
          />
        )}
      </div>

      {/* Legend */}
      <p className="label-mono text-muted-foreground">
        ノードをホバーすると接続先が強調されます。クリックで詳細ページへ。タイプボタンで表示・非表示を切替。
      </p>
    </div>
  );
}

function HoveredCard({
  node,
  connections,
  entity,
}: {
  node: GraphNode;
  connections: number;
  entity?: Entity;
}) {
  return (
    <div className="absolute top-3 right-3 max-w-[280px] rounded-md border border-border bg-card/95 backdrop-blur-sm shadow-lg p-3 text-xs">
      <p className="label-mono text-muted-foreground mb-1">
        {ENTITY_TYPE_LABEL[node.type]} · {connections} connections
      </p>
      <p className="font-semibold text-foreground mb-1">{node.name}</p>
      {entity?.summary && (
        <p className="text-muted-foreground leading-relaxed line-clamp-3">
          {entity.summary}
        </p>
      )}
      <p className="label-mono text-accent mt-2">クリックで詳細 →</p>
    </div>
  );
}

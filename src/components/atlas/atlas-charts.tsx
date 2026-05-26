/**
 * Atlas index 用のシンプルな SVG チャート群.
 * 外部チャートライブラリは入れず、インライン SVG で実装.
 *
 * - DonutChart: Carbon tax vs ETS など 2-4 セグメント
 * - HorizontalBarChart: Top jurisdictions / region 別件数 等
 * - StatusBar: 全体 Status のシェア表示 (積み上げバー)
 */

import * as React from "react";

/* ============================================================
 * Donut Chart
 * ============================================================ */

type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

export function DonutChart({
  segments,
  total,
  size = 160,
  strokeWidth = 28,
  centerLabel,
  centerSubLabel,
}: {
  segments: DonutSegment[];
  total: number;
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSubLabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="inline-flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Segments */}
        {segments.map((seg, i) => {
          const fraction = total === 0 ? 0 : seg.value / total;
          const arcLength = fraction * circumference;
          const dasharray = `${arcLength} ${circumference - arcLength}`;
          const dashoffset = -cumulativeOffset;
          cumulativeOffset += arcLength;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
        })}
        {/* Center label */}
        {centerLabel && (
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="metric-number fill-foreground"
            style={{ fontSize: "22px", fontWeight: 700 }}
          >
            {centerLabel}
          </text>
        )}
        {centerSubLabel && (
          <text
            x={size / 2}
            y={size / 2 + 18}
            textAnchor="middle"
            dominantBaseline="central"
            className="label-mono fill-muted-foreground"
            style={{ fontSize: "9px" }}
          >
            {centerSubLabel}
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-1.5">
        {segments.map((s, i) => {
          const pct = total === 0 ? 0 : (s.value / total) * 100;
          return (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="text-foreground/85 font-medium">{s.label}</span>
              <span className="metric-number text-[10.5px] text-foreground/70">
                {s.value}
              </span>
              <span className="label-mono text-[9.5px] text-muted-foreground">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
 * Horizontal bar chart (top N values)
 * ============================================================ */

type BarItem = {
  label: string;
  value: number;
  sublabel?: string;
};

export function HorizontalBarChart({
  items,
  max,
  barColor = "var(--accent)",
}: {
  items: BarItem[];
  max?: number;
  barColor?: string;
}) {
  const dataMax = max ?? Math.max(1, ...items.map((d) => d.value));
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => {
        const pct = (it.value / dataMax) * 100;
        return (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="w-32 truncate text-foreground/85 shrink-0">
              {it.label}
            </span>
            <div className="flex-1 h-3 rounded-sm bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-sm transition-all"
                style={{
                  width: `${pct}%`,
                  background: barColor,
                }}
              />
            </div>
            <span className="metric-number text-[10.5px] text-foreground/70 w-10 text-right">
              {it.value}
            </span>
            {it.sublabel && (
              <span className="label-mono text-[9.5px] text-muted-foreground w-12 text-right">
                {it.sublabel}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Stacked status bar (1 row showing share of 4 status types)
 * ============================================================ */

export function StackedStatusBar({
  segments,
  total,
}: {
  segments: DonutSegment[];
  total: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex h-3 rounded-sm overflow-hidden bg-muted/30">
        {segments.map((s, i) => {
          const pct = total === 0 ? 0 : (s.value / total) * 100;
          return (
            <div
              key={i}
              className="h-full transition-all"
              style={{ width: `${pct}%`, background: s.color }}
              title={`${s.label}: ${s.value} (${pct.toFixed(0)}%)`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {segments.map((s, i) => {
          const pct = total === 0 ? 0 : (s.value / total) * 100;
          return (
            <span key={i} className="inline-flex items-center gap-1.5 text-[10.5px]">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="text-foreground/85">{s.label}</span>
              <span className="metric-number text-[10px] text-foreground/70">
                {s.value}
              </span>
              <span className="label-mono text-[9px] text-muted-foreground">
                {pct.toFixed(0)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

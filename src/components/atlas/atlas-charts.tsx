/**
 * Atlas 用のシンプルな SVG / div ベースチャート群.
 * 外部チャートライブラリは入れず、インライン SVG で実装.
 *
 * - DonutChart: Carbon tax vs ETS など 2-4 セグメント
 * - HorizontalBarChart: Top jurisdictions / region 別件数 等
 * - StatusBar: 全体 Status のシェア表示 (積み上げバー)
 * - HistogramChart: bin 別の縦棒 (価格分布 / 年別件数等)
 * - DualBarChart: 2 値同時表示 (発行 vs 償却 等)
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

/* ============================================================
 * Histogram (vertical bars with bin labels)
 * ============================================================ */

export function HistogramChart({
  bins,
  height = 160,
  barColor = "#0ea5e9",
  valueFormatter,
}: {
  bins: { label: string; count: number; sublabel?: string }[];
  height?: number;
  barColor?: string;
  valueFormatter?: (n: number) => string;
}) {
  const max = Math.max(1, ...bins.map((b) => b.count));
  const fmt = valueFormatter ?? ((n: number) => n.toString());
  return (
    <div className="w-full">
      <div className="flex items-stretch gap-1" style={{ height }}>
        {bins.map((b, i) => {
          const pct = (b.count / max) * 100;
          return (
            <div
              key={i}
              className="flex flex-col flex-1 min-w-0 group"
              title={`${b.label}: ${fmt(b.count)}${b.sublabel ? ` (${b.sublabel})` : ""}`}
            >
              <span
                className="metric-number text-[9.5px] text-foreground/70 text-center"
                style={{ height: 14, lineHeight: "14px" }}
              >
                {b.count > 0 ? fmt(b.count) : ""}
              </span>
              <div className="flex-1 flex items-end justify-center w-full min-h-0">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${pct}%`,
                    background: barColor,
                    opacity: b.count > 0 ? 0.85 : 0.15,
                    minHeight: b.count > 0 ? 2 : 0,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-1.5">
        {bins.map((b, i) => (
          <span
            key={i}
            className="flex-1 text-[9.5px] label-mono text-muted-foreground text-center truncate"
            title={b.label}
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * Dual bar chart (2 values per row, e.g. 発行 vs 償却)
 * ============================================================ */

type DualItem = {
  label: string;
  primary: number;
  secondary: number;
  sublabel?: string;
};

export function DualBarChart({
  items,
  max,
  primaryColor = "#0ea5e9",
  secondaryColor = "#94a3b8",
  primaryLabel,
  secondaryLabel,
  valueFormatter,
}: {
  items: DualItem[];
  max?: number;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel: string;
  secondaryLabel: string;
  valueFormatter?: (n: number) => string;
}) {
  const dataMax =
    max ?? Math.max(1, ...items.flatMap((d) => [d.primary, d.secondary]));
  const fmt = valueFormatter ?? ((n: number) => n.toLocaleString());
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-[10.5px] mb-1">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ background: primaryColor }}
          />
          <span className="text-foreground/85">{primaryLabel}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ background: secondaryColor }}
          />
          <span className="text-foreground/85">{secondaryLabel}</span>
        </span>
      </div>
      {items.map((it, i) => {
        const pPct = (it.primary / dataMax) * 100;
        const sPct = (it.secondary / dataMax) * 100;
        return (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="w-32 truncate text-foreground/85 shrink-0" title={it.label}>
              {it.label}
            </span>
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="h-2 rounded-sm bg-muted/30 overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{ width: `${pPct}%`, background: primaryColor }}
                />
              </div>
              <div className="h-2 rounded-sm bg-muted/30 overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{ width: `${sPct}%`, background: secondaryColor }}
                />
              </div>
            </div>
            <div className="flex flex-col text-right metric-number text-[10px] w-20 shrink-0">
              <span className="text-foreground/85">{fmt(it.primary)}</span>
              <span className="text-muted-foreground">{fmt(it.secondary)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

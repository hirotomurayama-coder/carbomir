"use client";

import * as React from "react";
import { COUNTRY_GEO } from "@/lib/data/country-geo";

/**
 * 世界 bubble マップ.
 *
 * 設計:
 *   - 外部チャートライブラリ不使用. SVG inline で実装.
 *   - 国の座標 (lat/lng) を equirectangular で投影 → 円バブル.
 *   - 円のサイズ: count (数の sqrt スケール)
 *   - 円の色: dominantType (Carbon tax / ETS / Both)
 *   - 背景: 簡略大陸シルエット (4 つの blob で世界を示す)
 *
 * 制約:
 *   - "本格的な国境付き世界地図" でなく "地理位置 + バブル" の構成.
 *   - 表現したいのは「世界網羅性 + 地理的分布」であり、国境細部は不要.
 */

type Datum = {
  iso3: string;
  count: number;
  /** "Carbon tax" | "ETS" | "Both" | "Other" */
  primaryType?: string;
  /** ホバー時に表示するラベル */
  label?: string;
  /** クリックリンク (任意) */
  href?: string;
};

type Props = {
  data: Datum[];
  /** 円のサイズ係数 (radius = sqrt(count) * sizeScale) */
  sizeScale?: number;
  /** SVG 寸法 */
  width?: number;
  height?: number;
  /** 色マッピング (key = primaryType) */
  colorMap?: Record<string, string>;
  /** 凡例ラベル */
  legend?: Array<{ key: string; label: string; color: string }>;
};

const DEFAULT_COLOR_MAP: Record<string, string> = {
  "Carbon tax": "#10b981", // emerald
  ETS: "#0ea5e9", // sky
  Both: "#a855f7", // violet
  Other: "#94a3b8", // slate
};

/** Equirectangular projection: lng [-180..180] → x [0..width], lat [90..-90] → y [0..height] */
function project(
  lat: number,
  lng: number,
  width: number,
  height: number
): { x: number; y: number } {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

export function WorldBubbleMap({
  data,
  sizeScale = 4,
  width = 1000,
  height = 500,
  colorMap = DEFAULT_COLOR_MAP,
  legend,
}: Props) {
  // ホバー中の国 iso3
  const [hovered, setHovered] = React.useState<string | null>(null);

  // データを ISO3 でマージ (同一国の複数 record を合算)
  const merged = React.useMemo(() => {
    const map = new Map<string, Datum>();
    for (const d of data) {
      const existing = map.get(d.iso3);
      if (existing) {
        existing.count += d.count;
      } else {
        map.set(d.iso3, { ...d });
      }
    }
    return Array.from(map.values()).filter((d) => COUNTRY_GEO[d.iso3]);
  }, [data]);

  // ソート: count 降順. 大きい円が下、小さい円が上 (重なり優先度).
  const sorted = React.useMemo(
    () => [...merged].sort((a, b) => b.count - a.count),
    [merged]
  );

  const maxCount = Math.max(1, ...sorted.map((d) => d.count));

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto bg-muted/10 rounded-md"
        aria-label="世界マップ"
      >
        {/* 緯度経度グリッド */}
        <Grid width={width} height={height} />

        {/* 簡略大陸シルエット (4 blob) */}
        <ContinentBlobs />

        {/* バブル */}
        {sorted.map((d) => {
          const geo = COUNTRY_GEO[d.iso3];
          if (!geo) return null;
          const { x, y } = project(geo.lat, geo.lng, width, height);
          const r = Math.max(3, Math.sqrt(d.count) * sizeScale);
          const fill = colorMap[d.primaryType ?? "Other"] ?? "#94a3b8";
          const isHovered = hovered === d.iso3;

          const circle = (
            <g
              key={d.iso3}
              onMouseEnter={() => setHovered(d.iso3)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                fillOpacity={isHovered ? 0.95 : 0.7}
                stroke={fill}
                strokeWidth={isHovered ? 2 : 0.5}
                style={{ transition: "all 120ms" }}
              />
              {/* count が大きい国はテキストラベルを表示 */}
              {d.count >= Math.max(3, maxCount * 0.3) && (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground font-mono pointer-events-none select-none"
                  style={{
                    fontSize: r * 0.55,
                    fontWeight: 600,
                  }}
                >
                  {d.count}
                </text>
              )}
            </g>
          );

          return d.href ? (
            <a key={d.iso3} href={d.href}>
              {circle}
            </a>
          ) : (
            circle
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered &&
        (() => {
          const d = merged.find((m) => m.iso3 === hovered);
          if (!d) return null;
          const geo = COUNTRY_GEO[d.iso3];
          return (
            <div className="absolute top-2 right-2 bg-popover border border-border rounded-md shadow-lg p-2.5 text-[11px] pointer-events-none">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    background: colorMap[d.primaryType ?? "Other"] ?? "#94a3b8",
                  }}
                />
                <span className="font-semibold text-foreground">
                  {geo.name_ja}
                </span>
                <span className="label-mono text-[9.5px] text-muted-foreground">
                  {d.iso3}
                </span>
              </div>
              <p className="label-mono text-muted-foreground">
                <span className="metric-number text-foreground">{d.count}</span>{" "}
                {d.label ?? "件"}
                {d.primaryType ? ` · ${d.primaryType}` : ""}
              </p>
            </div>
          );
        })()}

      {/* Legend */}
      {legend && legend.length > 0 && (
        <div className="mt-3 flex items-center gap-4 flex-wrap label-mono text-[10.5px]">
          {legend.map((l) => (
            <span
              key={l.key}
              className="inline-flex items-center gap-1.5"
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: l.color }}
              />
              <span className="text-foreground/85">{l.label}</span>
            </span>
          ))}
          <span className="ml-auto text-muted-foreground">
            円サイズ = 件数 (sqrt スケール)
          </span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Latitude/Longitude grid (faint background)
 * ============================================================ */

function Grid({ width, height }: { width: number; height: number }) {
  const lats = [-60, -30, 0, 30, 60];
  const lngs = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
  return (
    <g>
      {lats.map((lat) => {
        const y = ((90 - lat) / 180) * height;
        return (
          <line
            key={`lat-${lat}`}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="currentColor"
            strokeOpacity={lat === 0 ? 0.25 : 0.1}
            strokeDasharray="2 4"
            className="text-muted-foreground"
          />
        );
      })}
      {lngs.map((lng) => {
        const x = ((lng + 180) / 360) * width;
        return (
          <line
            key={`lng-${lng}`}
            x1={x}
            y1={0}
            x2={x}
            y2={height}
            stroke="currentColor"
            strokeOpacity={lng === 0 ? 0.25 : 0.1}
            strokeDasharray="2 4"
            className="text-muted-foreground"
          />
        );
      })}
    </g>
  );
}

/* ============================================================
 * 簡略大陸シルエット (4 つの blob = North America / South America /
 * Eurasia + Africa / Oceania).
 *
 * 正確な国境は描かず、世界マップの "地理感" を出すだけが目的.
 * 各 path は equirectangular 1000x500 viewBox 用.
 * ============================================================ */

function ContinentBlobs() {
  const fill = "currentColor";
  const opacity = 0.12;
  return (
    <g
      className="text-muted-foreground"
      fill={fill}
      fillOpacity={opacity}
      strokeOpacity={0}
    >
      {/* North America (-170 W to -50 W, 15 N to 70 N) */}
      <path d="M 60 90 Q 95 70, 175 65 L 240 80 L 250 130 Q 245 175, 235 210 L 215 245 L 195 270 L 175 280 L 155 270 L 130 250 L 105 215 L 80 175 Q 60 135, 60 90 Z" />

      {/* Central America 接続 */}
      <path d="M 215 245 L 230 275 L 240 295 L 245 305 L 250 310 L 240 305 L 220 285 L 210 265 Z" />

      {/* South America (-85 W to -35 W, -55 S to 12 N) */}
      <path d="M 235 290 Q 270 285, 295 295 L 315 320 L 320 365 L 315 405 L 305 440 L 290 460 L 275 470 L 265 455 L 260 425 L 265 395 L 260 365 L 250 335 L 240 310 Z" />

      {/* Eurasia + Africa (combined blob, -10 W to 180 E, -35 S to 75 N) */}
      <path d="M 460 75 Q 540 60, 650 65 L 800 75 L 900 90 L 960 110 L 985 140 L 990 175 L 980 200 L 940 215 L 895 215 L 855 210 L 820 220 L 780 235 L 745 240 L 720 235 L 690 220 L 660 215 L 625 220 L 590 225 L 560 240 L 540 270 L 530 310 L 525 350 L 520 390 L 510 425 L 500 450 L 485 460 L 470 455 L 460 435 L 455 405 L 460 370 L 470 335 L 480 295 L 490 255 L 495 220 L 490 190 L 475 165 L 460 140 L 455 115 Z" />

      {/* UK islands */}
      <ellipse cx="475" cy="115" rx="8" ry="14" />

      {/* Japan archipelago */}
      <path d="M 870 145 L 880 155 L 882 170 L 875 175 L 870 165 Z" />

      {/* Indonesia archipelago */}
      <ellipse cx="850" cy="265" rx="35" ry="10" />
      <ellipse cx="810" cy="255" rx="15" ry="8" />

      {/* Australia (110 E to 155 E, -45 S to -10 S) */}
      <path d="M 800 305 Q 855 295, 920 305 L 940 330 L 930 360 L 905 375 L 870 380 L 835 375 L 815 360 L 805 335 Z" />

      {/* New Zealand */}
      <ellipse cx="965" cy="395" rx="8" ry="14" />
    </g>
  );
}

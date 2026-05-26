"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import type * as LType from "leaflet";
import { COUNTRY_GEO } from "@/lib/data/country-geo";

/**
 * Leaflet ベースの世界地図.
 *
 * 設計判断:
 *   - SSR 不可なので "use client" + useEffect で Leaflet を動的 import.
 *   - leaflet.css は globals.css 経由で読み込む.
 *   - マーカー: 円 (CircleMarker). カウントの sqrt スケールで半径決定.
 *   - 色: primaryType (Carbon tax / ETS / Both / Other 等).
 *   - タイル: ライトモード = OSM Voyager (CartoDB), ダーク = Dark Matter (CartoDB).
 *   - ポップアップ: HTML inline. count + label を表示.
 *
 * WorldBubbleMap と API 互換 (Datum 型 + 主要 props 同一).
 * 内部実装が SVG 直書きから Leaflet タイルに変わるだけ.
 */

type Datum = {
  iso3: string;
  count: number;
  /** "Carbon tax" | "ETS" | "Both" | "Other" 等 */
  primaryType?: string;
  /** ホバー/クリック時に表示するラベル */
  label?: string;
  /** クリックリンク (任意, Leaflet popup から外部リンクへ) */
  href?: string;
};

type Props = {
  data: Datum[];
  /** 円のサイズ係数 (radius_px = sqrt(count) * sizeScale) */
  sizeScale?: number;
  /** 地図高さ (px) */
  height?: number;
  /** 色マッピング (key = primaryType) */
  colorMap?: Record<string, string>;
  /** 凡例ラベル */
  legend?: Array<{ key: string; label: string; color: string }>;
};

const DEFAULT_COLOR_MAP: Record<string, string> = {
  "Carbon tax": "#10b981",
  ETS: "#0ea5e9",
  Both: "#a855f7",
  Other: "#94a3b8",
};

// CartoDB のタイル URL (無料、API キー不要、商用可、Attribution 必須)
const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
const TILE_LIGHT_LABELS =
  "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png";
const TILE_DARK_LABELS =
  "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function WorldMapLeaflet({
  data,
  sizeScale = 4,
  height = 500,
  colorMap = DEFAULT_COLOR_MAP,
  legend,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<LType.Map | null>(null);
  const tileLayerRef = React.useRef<LType.TileLayer | null>(null);
  const labelLayerRef = React.useRef<LType.TileLayer | null>(null);
  const markersRef = React.useRef<LType.LayerGroup | null>(null);
  const { resolvedTheme } = useTheme();

  // データを ISO3 でマージ
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

  // Leaflet を動的 import + 地図初期化 (mount 時 1 回)
  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [20, 10],
        zoom: 2,
        minZoom: 1,
        maxZoom: 6,
        worldCopyJump: false,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false, // ページスクロール優先. dblclick / +- でズーム.
        // wrap を防ぐ
        maxBounds: [
          [-85, -200],
          [85, 200],
        ],
      });

      // タイル選択は theme に依存 → 別 effect でも更新するが初期値はここで決定
      const initialDark = document.documentElement.classList.contains("dark");
      const tileLayer = L.tileLayer(initialDark ? TILE_DARK : TILE_LIGHT, {
        attribution: TILE_ATTRIBUTION,
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      const labelLayer = L.tileLayer(
        initialDark ? TILE_DARK_LABELS : TILE_LIGHT_LABELS,
        {
          attribution: "",
          subdomains: "abcd",
          maxZoom: 19,
          pane: "shadowPane", // ラベルはマーカーの下に
        }
      ).addTo(map);
      const markers = L.layerGroup().addTo(map);

      mapRef.current = map;
      tileLayerRef.current = tileLayer;
      labelLayerRef.current = labelLayer;
      markersRef.current = markers;

      drawMarkers(L, markers);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // データ変更時に markers を再描画
  React.useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      if (!markersRef.current) return;
      drawMarkers(L, markersRef.current);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged, sizeScale, colorMap]);

  // テーマ変更時にタイル差替
  React.useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current || !labelLayerRef.current) return;
    const isDark = resolvedTheme === "dark";
    tileLayerRef.current.setUrl(isDark ? TILE_DARK : TILE_LIGHT);
    labelLayerRef.current.setUrl(isDark ? TILE_DARK_LABELS : TILE_LIGHT_LABELS);
  }, [resolvedTheme]);

  function drawMarkers(L: typeof LType, group: LType.LayerGroup) {
    group.clearLayers();
    for (const d of merged) {
      const geo = COUNTRY_GEO[d.iso3];
      if (!geo) continue;
      const radius = Math.max(
        4,
        Math.min(28, Math.sqrt(d.count) * sizeScale)
      );
      const color =
        (d.primaryType && colorMap[d.primaryType]) || colorMap.Other || "#0ea5e9";

      const marker = L.circleMarker([geo.lat, geo.lng], {
        radius,
        color: "#ffffff",
        weight: 1.5,
        opacity: 0.9,
        fillColor: color,
        fillOpacity: 0.7,
      });

      // ポップアップ HTML
      const labelText = d.label ?? `${geo.name_ja} — ${d.count}`;
      const popupHtml = `
        <div style="font-size: 12px; line-height: 1.5; min-width: 160px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${escapeHtml(geo.name_ja)}</div>
          <div style="color: #6b7280;">${escapeHtml(labelText)}</div>
          ${
            d.href
              ? `<a href="${escapeHtml(d.href)}" style="display: inline-block; margin-top: 6px; color: #0ea5e9; text-decoration: underline;">詳細を見る →</a>`
              : ""
          }
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.bindTooltip(`${geo.name_ja}: ${d.count}`, {
        direction: "top",
        offset: [0, -radius],
        opacity: 0.95,
      });

      group.addLayer(marker);
    }
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="rounded-lg border border-border overflow-hidden bg-muted/10 leaflet-host"
        style={{ height }}
        // SSR mismatch を避けるため.
        suppressHydrationWarning
      />
      {legend && legend.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
          {legend.map((l) => (
            <span key={l.key} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-full border border-white/60"
                style={{ background: l.color }}
              />
              {l.label}
            </span>
          ))}
          <span className="ml-auto text-[10px] opacity-70">
            ホバーで国名 / クリックで詳細 / +- キーまたはコントロールでズーム
          </span>
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
    }
    return ch;
  });
}

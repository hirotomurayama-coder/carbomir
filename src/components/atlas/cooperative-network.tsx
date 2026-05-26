"use client";

import * as React from "react";

/**
 * 二国間協定 (Article 6.2) ネットワーク図.
 *
 * 設計:
 *   - Sankey-light: 左カラム = Buyer (5-7 ノード), 右カラム = Seller (40+ ノード)
 *   - Buyer → Seller を SVG ベジエ曲線で接続
 *   - ノードホバーで関連 link を強調 (他は薄く)
 *   - Buyer 別の色分け (Singapore=violet, Switzerland=emerald 等)
 *
 * 制約:
 *   - 外部チャートライブラリ不使用. d3-sankey も使わない.
 *   - 完全 Sankey (横棒の太さ = volume) ではなく、本数 1 = curve 1 本のシンプル版.
 */

export type Agreement = {
  buyer: string;
  seller: string;
  year_of_agreement?: number | null;
  status?: string | null;
};

type Props = {
  agreements: Agreement[];
};

// Buyer 5-7 ノードに色を割り当て (Article 6.2 では Buyer が少数集中するため)
const BUYER_COLORS: Record<string, string> = {
  Singapore: "#a855f7",
  Switzerland: "#10b981",
  "Korea, Rep.": "#0ea5e9",
  Norway: "#f59e0b",
  Sweden: "#ef4444",
  Kuwait: "#14b8a6",
  "United Arab Emirates": "#ec4899",
  Japan: "#f97316",
};

const STATUS_LINE_OPACITY: Record<string, number> = {
  "Framework Agreement Signed": 0.35,
  "Implementing Agreement Signed": 0.65,
  "Bilateral authorization issued": 0.95,
};

const STATUS_LINE_LABEL: Record<string, string> = {
  "Framework Agreement Signed": "枠組み",
  "Implementing Agreement Signed": "実施協定",
  "Bilateral authorization issued": "個別認可",
};

export function CooperativeNetwork({ agreements }: Props) {
  const [hoveredBuyer, setHoveredBuyer] = React.useState<string | null>(null);
  const [hoveredSeller, setHoveredSeller] = React.useState<string | null>(null);

  // Buyer リスト (件数降順)
  const buyers = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const a of agreements) m.set(a.buyer, (m.get(a.buyer) ?? 0) + 1);
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [agreements]);

  // Seller リスト (件数降順、または abc)
  const sellers = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const a of agreements) m.set(a.seller, (m.get(a.seller) ?? 0) + 1);
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [agreements]);

  // レイアウト寸法
  const width = 900;
  const buyerColX = 130;
  const sellerColX = width - 130;
  const topPad = 32;
  const bottomPad = 16;
  const buyerNodeH = 36;
  const sellerNodeH = 22;
  const buyerListH = Math.max(buyers.length * buyerNodeH, 200);
  const sellerListH = Math.max(sellers.length * sellerNodeH, 200);
  const height = topPad + Math.max(buyerListH, sellerListH) + bottomPad;

  // y position helpers
  const buyerY = (i: number) =>
    topPad + buyerNodeH / 2 + i * buyerNodeH +
    (Math.max(sellerListH - buyerListH, 0) / 2);
  const sellerY = (i: number) =>
    topPad + sellerNodeH / 2 + i * sellerNodeH +
    (Math.max(buyerListH - sellerListH, 0) / 2);

  const buyerIndex = new Map(buyers.map((b, i) => [b.name, i]));
  const sellerIndex = new Map(sellers.map((s, i) => [s.name, i]));

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: 720 }}
          aria-label="二国間協定ネットワーク図"
        >
          {/* === Curves (Buyer → Seller) === */}
          {agreements.map((a, i) => {
            const bi = buyerIndex.get(a.buyer);
            const si = sellerIndex.get(a.seller);
            if (bi === undefined || si === undefined) return null;
            const y1 = buyerY(bi);
            const y2 = sellerY(si);
            const ctrlX1 = buyerColX + (sellerColX - buyerColX) * 0.4;
            const ctrlX2 = buyerColX + (sellerColX - buyerColX) * 0.6;
            const color = BUYER_COLORS[a.buyer] ?? "#94a3b8";
            const baseOpacity = STATUS_LINE_OPACITY[a.status ?? ""] ?? 0.5;

            const isDimmed =
              (hoveredBuyer && hoveredBuyer !== a.buyer) ||
              (hoveredSeller && hoveredSeller !== a.seller);
            const isHighlighted =
              (hoveredBuyer && hoveredBuyer === a.buyer) ||
              (hoveredSeller && hoveredSeller === a.seller);

            const opacity = isDimmed
              ? baseOpacity * 0.15
              : isHighlighted
                ? Math.min(1, baseOpacity + 0.3)
                : baseOpacity;
            const strokeWidth = isHighlighted ? 2 : 1.2;

            return (
              <path
                key={i}
                d={`M ${buyerColX} ${y1} C ${ctrlX1} ${y1}, ${ctrlX2} ${y2}, ${sellerColX} ${y2}`}
                fill="none"
                stroke={color}
                strokeOpacity={opacity}
                strokeWidth={strokeWidth}
                style={{ transition: "all 150ms" }}
              />
            );
          })}

          {/* === Buyer nodes (left) === */}
          {buyers.map((b, i) => {
            const y = buyerY(i);
            const color = BUYER_COLORS[b.name] ?? "#94a3b8";
            const isActive = hoveredBuyer === b.name || hoveredBuyer === null;
            return (
              <g
                key={b.name}
                onMouseEnter={() => setHoveredBuyer(b.name)}
                onMouseLeave={() => setHoveredBuyer(null)}
                style={{ cursor: "pointer", transition: "all 150ms" }}
              >
                <rect
                  x={buyerColX - 110}
                  y={y - 12}
                  width={110}
                  height={24}
                  rx={4}
                  fill={color}
                  fillOpacity={isActive ? 0.9 : 0.3}
                />
                <text
                  x={buyerColX - 55}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white font-mono select-none"
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  {b.name}
                </text>
                <text
                  x={buyerColX + 8}
                  y={y}
                  textAnchor="start"
                  dominantBaseline="central"
                  className="fill-foreground font-mono select-none"
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  {b.count}
                </text>
              </g>
            );
          })}

          {/* === Seller nodes (right) === */}
          {sellers.map((s, i) => {
            const y = sellerY(i);
            const isActive =
              hoveredSeller === s.name ||
              (hoveredBuyer !== null &&
                agreements.some(
                  (a) => a.buyer === hoveredBuyer && a.seller === s.name
                ));
            return (
              <g
                key={s.name}
                onMouseEnter={() => setHoveredSeller(s.name)}
                onMouseLeave={() => setHoveredSeller(null)}
                style={{ cursor: "pointer", transition: "all 150ms" }}
              >
                <rect
                  x={sellerColX}
                  y={y - 9}
                  width={5}
                  height={18}
                  rx={1}
                  fill="currentColor"
                  fillOpacity={isActive ? 0.7 : 0.25}
                  className="text-foreground"
                />
                <text
                  x={sellerColX + 10}
                  y={y}
                  textAnchor="start"
                  dominantBaseline="central"
                  className="fill-foreground font-mono select-none"
                  style={{
                    fontSize: 10.5,
                    fontWeight: isActive ? 600 : 400,
                    opacity: isActive ? 1 : 0.65,
                  }}
                >
                  {s.name}
                </text>
                <text
                  x={sellerColX + 120}
                  y={y}
                  textAnchor="start"
                  dominantBaseline="central"
                  className="fill-muted-foreground font-mono select-none"
                  style={{ fontSize: 9.5 }}
                >
                  {s.count > 1 ? `×${s.count}` : ""}
                </text>
              </g>
            );
          })}

          {/* === Column headers === */}
          <text
            x={buyerColX - 55}
            y={16}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted-foreground font-mono select-none"
            style={{ fontSize: 10, letterSpacing: 1.5 }}
          >
            BUYER
          </text>
          <text
            x={sellerColX + 60}
            y={16}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted-foreground font-mono select-none"
            style={{ fontSize: 10, letterSpacing: 1.5 }}
          >
            SELLER
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 flex-wrap label-mono text-[10.5px]">
        {Object.entries(STATUS_LINE_OPACITY).map(([status, op]) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-px bg-foreground"
              style={{ opacity: op }}
            />
            <span className="text-foreground/85">
              {STATUS_LINE_LABEL[status] ?? status}
            </span>
          </span>
        ))}
        <span className="ml-auto text-muted-foreground">
          Buyer / Seller を hover で関連協定をハイライト
        </span>
      </div>
    </div>
  );
}

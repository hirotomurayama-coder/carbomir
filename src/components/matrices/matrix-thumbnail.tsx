import type { ComparisonMatrix } from "@/lib/types";

/**
 * /matrices インデックス用の小さな行列プレビュー。
 * 最初の 3 entities × 最初の 3 dimensions を mini grid で表示する。
 * セルテキストは truncate して見出し級にする。
 */

const PREVIEW_ENTITIES = 3;
const PREVIEW_DIMENSIONS = 3;
const CELL_MAX = 32; // セル本文の最大表示文字数 (それ以上は ellipsis)

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

export function MatrixThumbnail({ matrix }: { matrix: ComparisonMatrix }) {
  const entities = matrix.entities.slice(0, PREVIEW_ENTITIES);
  const dimensions = matrix.dimensions.slice(0, PREVIEW_DIMENSIONS);

  if (entities.length === 0 || dimensions.length === 0) {
    return (
      <div className="rounded border border-dashed border-border bg-muted/20 p-4 text-center label-mono text-muted-foreground">
        プレビューなし
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-border bg-card">
      <table className="w-full border-collapse text-[10.5px]">
        <thead>
          <tr>
            <th className="bg-muted/50 border-b border-r border-border px-1.5 py-1 text-left">
              <span className="label-mono text-muted-foreground">軸</span>
            </th>
            {entities.map((e) => (
              <th
                key={e.slug}
                className="bg-muted/50 border-b border-r last:border-r-0 border-border px-1.5 py-1 text-left max-w-[80px]"
              >
                <span className="block font-medium text-foreground truncate text-[10.5px]">
                  {truncate(e.name_ja, 14)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dimensions.map((d) => (
            <tr key={d.key}>
              <th
                scope="row"
                className="bg-muted/20 border-b last:border-b-0 border-r border-border px-1.5 py-1 text-left align-top"
              >
                <span className="block font-medium text-foreground text-[10.5px] leading-snug">
                  {truncate(d.label_ja, 12)}
                </span>
              </th>
              {entities.map((e) => {
                const cell = matrix.cells[e.slug]?.[d.key];
                return (
                  <td
                    key={e.slug}
                    className="border-b last:border-b-0 border-r last:border-r-0 border-border px-1.5 py-1 align-top text-muted-foreground leading-snug max-w-[80px]"
                  >
                    {cell ? (
                      <span className="block">{truncate(cell.value, CELL_MAX)}</span>
                    ) : (
                      <span className="label-mono text-muted-foreground/60">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 全行列のメトリクス: 何を見えていて何を隠しているか */}
      {(matrix.dimensions.length > PREVIEW_DIMENSIONS ||
        matrix.entities.length > PREVIEW_ENTITIES) && (
        <div className="border-t border-border bg-muted/30 px-2 py-1 label-mono text-muted-foreground">
          showing {Math.min(PREVIEW_ENTITIES, matrix.entities.length)}/
          {matrix.entities.length} entities ·{" "}
          {Math.min(PREVIEW_DIMENSIONS, matrix.dimensions.length)}/
          {matrix.dimensions.length} dims
        </div>
      )}
    </div>
  );
}

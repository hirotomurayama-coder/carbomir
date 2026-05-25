import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { POLICY_STATUS_LABEL, type Entity, type PolicyStatus } from "@/lib/types";

const STATUS_BADGE_CLASS: Record<PolicyStatus, string> = {
  active:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  transition:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  pilot: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  draft: "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
  discontinued:
    "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
};

/**
 * 構造化属性 (jurisdiction / established_year / operator など) を
 * 一覧テーブル風に表示する。データのある項目のみ描画。
 */
export function MetadataPanel({ entity }: { entity: Entity }) {
  const rows: { label: string; value: React.ReactNode }[] = [];

  if (entity.policy_status) {
    rows.push({
      label: "ステータス",
      value: (
        <span
          className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10.5px] font-mono tracking-wider ${STATUS_BADGE_CLASS[entity.policy_status]}`}
        >
          {POLICY_STATUS_LABEL[entity.policy_status]}
        </span>
      ),
    });
  }
  if (entity.business_role) {
    rows.push({ label: "役割", value: entity.business_role });
  }
  if (entity.jurisdiction) {
    rows.push({ label: "管轄", value: entity.jurisdiction });
  }
  if (entity.established_year !== undefined) {
    rows.push({ label: "発足年", value: entity.established_year });
  }
  if (entity.operator) {
    rows.push({ label: "運営", value: entity.operator });
  }
  if (entity.parent_company) {
    rows.push({ label: "親会社", value: entity.parent_company });
  }
  if (entity.geographic_scope) {
    rows.push({ label: "対象地域", value: entity.geographic_scope });
  }
  if (entity.credit_unit) {
    rows.push({ label: "クレジット単位", value: entity.credit_unit });
  }
  if (entity.next_milestone) {
    rows.push({ label: "次の節目", value: entity.next_milestone });
  }
  if (entity.website_url) {
    rows.push({
      label: "公式サイト",
      value: (
        <a
          href={entity.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline normal-case break-all"
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          {entity.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      ),
    });
  }

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-5">
        <p className="label-mono text-muted-foreground mb-4">Metadata</p>
        <dl className="space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[80px_minmax(0,1fr)] gap-2">
              <dt className="label-mono text-muted-foreground self-start">
                {r.label}
              </dt>
              <dd className="text-xs text-foreground/90 leading-relaxed break-words">
                {typeof r.value === "number"
                  ? (
                      <span className="metric-number text-sm text-foreground">
                        {r.value}
                      </span>
                    )
                  : r.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

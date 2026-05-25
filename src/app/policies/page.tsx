import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ArrowUpRight, ExternalLink, Flag, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listPublishedEntities } from "@/lib/data/queries";
import {
  POLICY_STATUS_LABEL,
  type Entity,
  type PolicyStatus,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "政策・規制",
  description:
    "Carbomir の政策・規制トラッカー。各国/地域の主要制度のステータス・次のマイルストーン・運営主体を一覧する。",
};

/**
 * 政策・規制トラッカー。
 * type=regulation の entity を、jurisdiction で大分類してカード表示する。
 * ステータス (active / transition / pilot 等) と次マイルストーンを前面に出す。
 */

type JurisdictionGroup =
  | "日本"
  | "EU"
  | "米国"
  | "国際"
  | "アジア (日本以外)"
  | "その他";

function classifyJurisdiction(jur: string | undefined): JurisdictionGroup {
  if (!jur) return "その他";
  if (jur.includes("日本") && !jur.includes("二国間")) return "日本";
  if (jur.startsWith("EU")) return "EU";
  if (jur.includes("米国")) return "米国";
  if (jur.includes("韓国") || jur.includes("中国")) return "アジア (日本以外)";
  if (
    jur.startsWith("国際") ||
    jur.includes("UNFCCC") ||
    jur.includes("民間") ||
    jur.includes("二国間")
  )
    return "国際";
  return "その他";
}

const STATUS_BADGE_CLASS: Record<PolicyStatus, string> = {
  active:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  transition:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  pilot: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  draft:
    "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
  discontinued:
    "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
};

export default async function PoliciesPage() {
  const all = await listPublishedEntities();
  const policies = all.filter((e) => e.type === "regulation");

  // jurisdiction でグループ
  const groups = new Map<JurisdictionGroup, Entity[]>();
  for (const p of policies) {
    const key = classifyJurisdiction(p.jurisdiction);
    const existing = groups.get(key) ?? [];
    existing.push(p);
    groups.set(key, existing);
  }
  const orderedGroups: JurisdictionGroup[] = [
    "日本",
    "EU",
    "米国",
    "国際",
    "アジア (日本以外)",
    "その他",
  ];

  // ステータス別メトリクス
  const statusCounts = new Map<PolicyStatus | "unknown", number>();
  for (const p of policies) {
    const key = p.policy_status ?? "unknown";
    statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
  }

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
            >
              <Scale className="h-2.5 w-2.5 mr-1" />
              {policies.length.toString().padStart(2, "0")} Published
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            政策・規制
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            各国/地域の主要なカーボン関連制度のステータスと次マイルストーンを集約。事業会社の中期計画・調達設計の前提条件をすぐ把握できるよう、jurisdiction で大分類する。
          </p>
          <Link
            href="/policies/calendar"
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-xs font-medium"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            規制カレンダー (時系列) を開く →
          </Link>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["active", "transition", "pilot", "draft"] as PolicyStatus[]).map(
            (s) => {
              const c = statusCounts.get(s) ?? 0;
              if (c === 0) return null;
              return (
                <span
                  key={s}
                  className={`inline-flex items-center rounded border px-2 py-1 text-[10.5px] ${STATUS_BADGE_CLASS[s]}`}
                >
                  <span className="metric-number mr-1">{c}</span>
                  {POLICY_STATUS_LABEL[s]}
                </span>
              );
            }
          )}
        </div>
      </header>

      <div className="space-y-6">
        {orderedGroups.map((g) => {
          const items = groups.get(g);
          if (!items || items.length === 0) return null;
          return (
            <section key={g} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Flag className="h-3.5 w-3.5 text-accent" />
                <h2 className="label-mono text-foreground">{g}</h2>
                <span className="metric-number text-[10px] text-muted-foreground">
                  {items.length.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <PolicyCard key={p.slug} policy={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function PolicyCard({ policy }: { policy: Entity }) {
  return (
    <Card className="h-full p-5 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group">
      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
        {policy.policy_status && (
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10.5px] font-mono tracking-wider ${STATUS_BADGE_CLASS[policy.policy_status]}`}
          >
            {POLICY_STATUS_LABEL[policy.policy_status]}
          </span>
        )}
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
      </div>
      <Link href={`/entities/${policy.slug}`} className="block">
        <h3 className="text-base font-semibold text-foreground group-hover:text-accent mb-0.5">
          {policy.name_ja}
        </h3>
        {policy.name_en && policy.name_en !== policy.name_ja && (
          <p className="font-mono text-[11px] text-muted-foreground mb-2">
            {policy.name_en}
          </p>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
          {policy.summary}
        </p>
      </Link>

      <dl className="grid grid-cols-[60px_minmax(0,1fr)] gap-y-1.5 gap-x-2 label-mono text-muted-foreground mb-3">
        {policy.established_year !== undefined && (
          <>
            <dt>発足</dt>
            <dd className="metric-number text-foreground">
              {policy.established_year}
            </dd>
          </>
        )}
        {policy.operator && (
          <>
            <dt>運営</dt>
            <dd className="text-foreground/85 break-words">{policy.operator}</dd>
          </>
        )}
        {policy.next_milestone && (
          <>
            <dt>次の節目</dt>
            <dd className="text-foreground/85 break-words leading-relaxed">
              {policy.next_milestone}
            </dd>
          </>
        )}
      </dl>

      {policy.website_url && (
        <a
          href={policy.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 label-mono text-accent hover:underline normal-case"
        >
          <ExternalLink className="h-3 w-3" />
          {policy.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 50)}
        </a>
      )}
    </Card>
  );
}

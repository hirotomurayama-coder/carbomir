import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listPublishedEntities } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "プレイヤー",
  description:
    "Carbomir のプレイヤー一覧。レジストリ運営者・DAC 事業者・国内取扱業者・大手需要家を構造化属性で整理する。",
};

export default async function PlayersPage() {
  const all = await listPublishedEntities();
  const players = all.filter((e) => e.type === "player");

  // business_role でグループ化
  const groups = new Map<string, typeof players>();
  for (const p of players) {
    const role = p.business_role ?? "その他";
    const existing = groups.get(role) ?? [];
    existing.push(p);
    groups.set(role, existing);
  }
  // 既知のロールの表示順
  const roleOrder = [
    "レジストリ運営",
    "国際ガバナンス",
    "DAC 事業者",
    "大手需要家 (CDR offtake)",
    "国内取扱業者 (商社)",
    "国内取扱業者 (プラットフォーム)",
  ];
  const orderedRoles: string[] = [];
  for (const r of roleOrder) if (groups.has(r)) orderedRoles.push(r);
  for (const r of groups.keys()) if (!orderedRoles.includes(r)) orderedRoles.push(r);

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <Suspense fallback={null}>
        <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
              >
                <Building2 className="h-2.5 w-2.5 mr-1" />
                {players.length.toString().padStart(2, "0")} Published
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              プレイヤー
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
              レジストリ運営者・DAC 事業者・国内取扱業者・大手需要家を、本拠地・役割・設立年などの構造化属性で整理。比較行列や時系列イベントから自然にリンクする。
            </p>
          </div>
        </header>

        <div className="space-y-6">
          {orderedRoles.map((role) => {
            const items = groups.get(role) ?? [];
            return (
              <section key={role} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <h2 className="label-mono text-foreground">{role}</h2>
                  <span className="metric-number text-[10px] text-muted-foreground">
                    {items.length.toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <PlayerCard key={p.slug} player={p} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Suspense>
    </div>
  );
}

function PlayerCard({ player }: { player: NonNullable<Awaited<ReturnType<typeof listPublishedEntities>>>[number] }) {
  return (
    <Card className="h-full p-5 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group">
      <Link href={`/entities/${player.slug}`} className="block">
        <div className="flex items-start justify-between gap-2 mb-3">
          {player.jurisdiction && (
            <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
              {player.jurisdiction}
            </span>
          )}
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-0.5 group-hover:text-accent">
          {player.name_ja}
        </h3>
        {player.name_en && player.name_en !== player.name_ja && (
          <p className="font-mono text-[11px] text-muted-foreground mb-3">
            {player.name_en}
          </p>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
          {player.summary}
        </p>
      </Link>
      <div className="grid grid-cols-2 gap-1.5 label-mono text-muted-foreground">
        {player.established_year !== undefined && (
          <span>
            <span className="opacity-70">設立: </span>
            <span className="metric-number text-foreground">{player.established_year}</span>
          </span>
        )}
        {player.geographic_scope && (
          <span className="truncate">
            <span className="opacity-70">範囲: </span>
            <span className="text-foreground/85">{player.geographic_scope}</span>
          </span>
        )}
        {player.parent_company && (
          <span className="col-span-2 truncate">
            <span className="opacity-70">親会社: </span>
            <span className="text-foreground/85">{player.parent_company}</span>
          </span>
        )}
        {player.website_url && (
          <a
            href={player.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 inline-flex items-center gap-1 text-accent hover:underline normal-case mt-1"
          >
            <ExternalLink className="h-3 w-3" />
            {player.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        )}
      </div>
    </Card>
  );
}

import Link from "next/link";
import {
  Columns3,
  Network,
  Clock,
  Building2,
  Scale,
  Globe2,
  ArrowUpRight,
  RefreshCw,
  BookOpen,
  HelpCircle,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  listPublishedEntities,
  listPublishedMatrices,
  listPublishedTimelineEvents,
  listInstruments,
  listMechanisms,
  listCooperativeAgreements,
  listPublishedCaseStudies,
  listPublishedFaqs,
} from "@/lib/data/queries";
import {
  ENTITY_TYPE_LABEL,
  TIMELINE_CATEGORY_LABEL,
  type ComparisonMatrix,
  type Entity,
  type TimelineEvent,
  type CaseStudy,
  type FAQItem,
} from "@/lib/types";
import { MatrixThumbnail } from "@/components/matrices/matrix-thumbnail";

/**
 * カーボンクレジット領域のナレッジベースのホーム。
 *
 * 設計方針 (アライメント結果 2026-05-25):
 * - 主ペルソナ: 事業会社 CSR / サスティナビリティ担当
 * - キラーシナリオ: 規制変更キャッチアップ
 * - 「追う」セクション = 主役 (Hero 直後に配置)
 * - 編集論点 = 主力差別化要素 (各 timeline event の解釈を前面化)
 * - 動詞型タクソノミー (比べる / 調べる / 追う / 学ぶ / 世界マップ) を踏襲
 */

type UpdateItem = {
  kind: "matrix" | "entity" | "player" | "timeline";
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  href: string;
};

function pickFeaturedMatrix(
  matrices: ComparisonMatrix[]
): ComparisonMatrix | undefined {
  if (matrices.length === 0) return undefined;
  return [...matrices].sort(
    (a, b) =>
      b.entities.length * b.dimensions.length -
      a.entities.length * a.dimensions.length
  )[0];
}

function getRecentUpdates(
  matrices: ComparisonMatrix[],
  entities: Entity[],
  events: TimelineEvent[]
): UpdateItem[] {
  const items: UpdateItem[] = [];
  for (const m of matrices) {
    items.push({
      kind: "matrix",
      slug: m.slug,
      title: m.title,
      subtitle: `${m.entities.length}×${m.dimensions.length} cells`,
      date: m.last_reviewed_at,
      href: `/matrices/${m.slug}`,
    });
  }
  for (const e of entities) {
    items.push({
      kind: e.type === "player" ? "player" : "entity",
      slug: e.slug,
      title: e.name_ja,
      subtitle:
        e.type === "player"
          ? (e.business_role ?? ENTITY_TYPE_LABEL[e.type])
          : ENTITY_TYPE_LABEL[e.type],
      date: e.last_reviewed_at,
      href: `/entities/${e.slug}`,
    });
  }
  for (const ev of events.slice(0, 5)) {
    items.push({
      kind: "timeline",
      slug: ev.slug,
      title: ev.title,
      subtitle: TIMELINE_CATEGORY_LABEL[ev.category],
      date: ev.event_date,
      href: `/timeline/${ev.slug}`,
    });
  }
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
}

/**
 * 政策エンティティから next_milestone 付きのものを抽出して、
 * 日付順 (近い順) にソート。「次マイルストーン カレンダー」用。
 *
 * next_milestone は文字列 "YYYY-MM-DD: 内容" or "YYYY: 内容" の形式想定。
 * 先頭の YYYY-MM-DD / YYYY-MM を抜き出して比較する。
 */
function getUpcomingMilestones(entities: Entity[]): {
  entity: Entity;
  dateLabel: string;
  content: string;
  sortKey: string;
}[] {
  const out: {
    entity: Entity;
    dateLabel: string;
    content: string;
    sortKey: string;
  }[] = [];
  for (const e of entities) {
    if (e.type !== "regulation" || !e.next_milestone) continue;
    const m = e.next_milestone.match(/^(\d{4}(?:-\d{2})?(?:-\d{2})?)\s*[::]\s*(.+)$/);
    if (m) {
      out.push({
        entity: e,
        dateLabel: m[1],
        content: m[2].trim(),
        sortKey: m[1].length === 4 ? `${m[1]}-12-31` : m[1].padEnd(10, "0"),
      });
    } else {
      out.push({
        entity: e,
        dateLabel: "",
        content: e.next_milestone,
        sortKey: "9999",
      });
    }
  }
  return out.sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(0, 6);
}

export default async function DashboardHome() {
  const [
    matrices,
    entities,
    events,
    instruments,
    mechanisms,
    cooperative,
    caseStudies,
    faqs,
  ] = await Promise.all([
    listPublishedMatrices(),
    listPublishedEntities(),
    listPublishedTimelineEvents(),
    listInstruments(),
    listMechanisms(),
    listCooperativeAgreements(),
    listPublishedCaseStudies(),
    listPublishedFaqs(),
  ]);

  const featured = pickFeaturedMatrix(matrices);
  const recent = getRecentUpdates(matrices, entities, events);
  const upcomingMilestones = getUpcomingMilestones(entities);
  const recentEvents = [...events]
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
    .slice(0, 5);
  const lastUpdate = recent[0]?.date ?? "—";

  // アセット俯瞰の補助メトリクス
  const players = entities.filter((e) => e.type === "player");
  const policies = entities.filter((e) => e.type === "regulation");
  const concepts = entities.filter(
    (e) => e.type !== "player" && e.type !== "regulation"
  );

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      {/* Hero — シナリオ 3 (規制キャッチアップ) を主訴求 */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent mr-1.5 animate-pulse" />
            Structured Intelligence
          </Badge>
          <span className="label-mono text-muted-foreground metric-number">
            Last update {lastUpdate}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 leading-tight">
          カーボンクレジット領域の<br className="sm:hidden" />
          規制動向を、構造化して追う。
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          GX-ETS / CBAM / SBT 等の規制変更を時系列で押さえ、関連する制度・スタンダード・プレイヤー・事例へ即座に深掘り。
          事業会社の CSR / サスティナビリティ担当者の説明資料作成と意思決定を支援する構造化ナレッジベース。
        </p>
      </header>

      {/* 追う セクション (主役) */}
      <TrackSection
        recentEvents={recentEvents}
        upcomingMilestones={upcomingMilestones}
        totalEvents={events.length}
        totalPolicies={policies.length}
      />

      {/* 調べる セクション */}
      <DefineSection
        conceptCount={concepts.length}
        playerCount={players.length}
        policyCount={policies.length}
      />

      {/* 比べる セクション */}
      <CompareSection featured={featured} totalMatrices={matrices.length} />

      {/* 学ぶ セクション */}
      <ApplySection caseStudies={caseStudies} faqs={faqs} />

      {/* 世界マップ セクション (外部由来網羅マスタ・控えめ) */}
      <SurveySection
        instrumentCount={instruments.length}
        mechanismCount={mechanisms.length}
        cooperativeCount={cooperative.length}
      />

      {/* Recent Updates (横断更新シグナル) */}
      <section className="mb-2">
        <RecentUpdatesCard updates={recent} />
      </section>
    </div>
  );
}

/* ============================================================
 * Section components (動詞型タクソノミー対応)
 * ============================================================ */

function SectionHeader({
  label,
  description,
  cta,
}: {
  label: string;
  description: string;
  cta?: { href: string; text: string };
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          {label}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 label-mono text-accent hover:underline"
        >
          {cta.text}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function TrackSection({
  recentEvents,
  upcomingMilestones,
  totalEvents,
  totalPolicies,
}: {
  recentEvents: TimelineEvent[];
  upcomingMilestones: ReturnType<typeof getUpcomingMilestones>;
  totalEvents: number;
  totalPolicies: number;
}) {
  return (
    <section className="mb-10">
      <SectionHeader
        label="追う"
        description={`規制・市場・技術の動向を時系列で。直近イベント ${totalEvents} 件 / 規制トラッカー ${totalPolicies} 件`}
        cta={{ href: "/timeline", text: "時系列を全件見る" }}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* 直近の規制動向 */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-accent" />
              直近の規制動向
            </CardTitle>
            <CardDescription className="text-xs">
              編集論点つきで、新着の制度・市場イベントを深掘りする入口
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {recentEvents.map((ev) => (
                <li key={ev.slug}>
                  <Link
                    href={`/timeline/${ev.slug}`}
                    className="group flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <span className="metric-number text-[10.5px] text-muted-foreground shrink-0 mt-0.5 min-w-[68px]">
                      {ev.event_date}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-accent leading-snug">
                        {ev.title}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
                        {ev.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0 text-[10px] text-foreground/70">
                          {TIMELINE_CATEGORY_LABEL[ev.category]}
                        </span>
                        {ev.affected_entity_slugs.length > 0 && (
                          <span className="label-mono text-muted-foreground">
                            影響: {ev.affected_entity_slugs.length} エンティティ
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 次マイルストーン */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarClock className="h-3.5 w-3.5 text-accent" />
              次マイルストーン
            </CardTitle>
            <CardDescription className="text-xs">
              規制カレンダー — policy_status と next_milestone から
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {upcomingMilestones.length === 0 ? (
                <li className="px-5 py-4 label-mono text-muted-foreground text-center">
                  予定中のマイルストーンはありません
                </li>
              ) : (
                upcomingMilestones.map((m) => (
                  <li key={m.entity.slug}>
                    <Link
                      href={`/entities/${m.entity.slug}`}
                      className="group flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <span className="metric-number text-[10.5px] text-accent shrink-0 mt-0.5 min-w-[68px] font-semibold">
                        {m.dateLabel || "—"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-accent leading-snug">
                          {m.entity.name_ja}
                        </p>
                        <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
                          {m.content}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <div className="px-5 py-2.5 border-t border-border bg-muted/20">
              <Link
                href="/timeline"
                className="inline-flex items-center gap-1 label-mono text-accent hover:underline"
              >
                時系列・規制カレンダー (統合) を開く
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function DefineSection({
  conceptCount,
  playerCount,
  policyCount,
}: {
  conceptCount: number;
  playerCount: number;
  policyCount: number;
}) {
  return (
    <section className="mb-10">
      <SectionHeader
        label="調べる"
        description="制度・概念・プレイヤーを構造化属性 + 双方向リンクで定義"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniAssetCard
          href="/entities"
          icon={<Network className="h-4 w-4" />}
          label="概念体系"
          count={conceptCount}
          unit="concepts"
          tagline="メソドロジー / 技術 / 制度"
        />
        <MiniAssetCard
          href="/players"
          icon={<Building2 className="h-4 w-4" />}
          label="プレイヤー"
          count={playerCount}
          unit="players"
          tagline="レジストリ / 事業者 / 取扱業者"
        />
        <MiniAssetCard
          href="/policies"
          icon={<Scale className="h-4 w-4" />}
          label="政策・規制"
          count={policyCount}
          unit="policies"
          tagline="ステータス + 次マイルストーン付き"
        />
      </div>
    </section>
  );
}

function CompareSection({
  featured,
  totalMatrices,
}: {
  featured: ComparisonMatrix | undefined;
  totalMatrices: number;
}) {
  if (!featured) return null;
  return (
    <section className="mb-10">
      <SectionHeader
        label="比べる"
        description={`制度・スタンダード・技術を実務軸で対比。比較行列 ${totalMatrices} 件`}
        cta={{ href: "/matrices", text: "比較行列を全件見る" }}
      />
      <Card className="overflow-hidden p-0 group hover:border-accent/60 transition-colors">
        <Link href={`/matrices/${featured.slug}`} className="block">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge
                variant="outline"
                className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
              >
                Featured
              </Badge>
              <span className="metric-number text-[10px] text-muted-foreground ml-auto">
                {featured.last_reviewed_at}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent mb-1 leading-snug">
              {featured.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {featured.description}
            </p>
          </div>
          <div className="px-5">
            <MatrixThumbnail matrix={featured} />
          </div>
          <div className="px-5 py-3 mt-3 border-t border-border flex items-center justify-between gap-2 label-mono text-muted-foreground">
            <span>
              <span className="metric-number text-foreground">{featured.entities.length}</span>
              <span className="opacity-50 mx-1">×</span>
              <span className="metric-number text-foreground">{featured.dimensions.length}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-accent">
              詳細を開く
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </Card>
    </section>
  );
}

function ApplySection({
  caseStudies,
  faqs,
}: {
  caseStudies: CaseStudy[];
  faqs: FAQItem[];
}) {
  return (
    <section className="mb-10">
      <SectionHeader
        label="学ぶ"
        description="他社事例と Q&A を引いて、実務判断の土台にする"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/case-studies"
          className="block rounded-lg border border-border bg-card p-5 hover:border-accent/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="label-mono text-muted-foreground">ケーススタディ</p>
                <span className="metric-number text-[10px] text-muted-foreground">
                  {caseStudies.length.toString().padStart(2, "0")} studies
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground group-hover:text-accent">
                個別企業の調達・組成・報告事例
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Microsoft / 三菱商事 / Apple / NYK / Stripe Frontier
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
          </div>
        </Link>
        <Link
          href="/faq"
          className="block rounded-lg border border-border bg-card p-5 hover:border-accent/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="label-mono text-muted-foreground">FAQ / 実務 Q&amp;A</p>
                <span className="metric-number text-[10px] text-muted-foreground">
                  {faqs.length.toString().padStart(2, "0")} Q&amp;A
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground group-hover:text-accent">
                実務担当者向けの判断ポイント
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                GX-ETS / Verra / Scope3 / SBT 等の Q&amp;A
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
          </div>
        </Link>
      </div>
    </section>
  );
}

function SurveySection({
  instrumentCount,
  mechanismCount,
  cooperativeCount,
}: {
  instrumentCount: number;
  mechanismCount: number;
  cooperativeCount: number;
}) {
  return (
    <section className="mb-10">
      <SectionHeader
        label="世界マップ"
        description="World Bank + CarbonPlan 由来の網羅マスタ。地理スコープで横断検索"
      />
      <Link
        href="/atlas/instruments"
        className="block rounded-lg border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-5 hover:border-accent/60 transition-colors group"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-accent shrink-0">
            <Globe2 className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground group-hover:text-accent">
              グローバル網羅データセット
            </p>
            <p className="metric-number text-[10.5px] text-muted-foreground mt-0.5">
              {instrumentCount} 価格制度 · {mechanismCount} クレジット機構 · {cooperativeCount} 二国間協定 · 11k+ OffsetsDB projects
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
        </div>
      </Link>
    </section>
  );
}

function MiniAssetCard({
  href,
  icon,
  label,
  count,
  unit,
  tagline,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  unit: string;
  tagline: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full p-4 hover:border-accent/60 transition-all group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
            {icon}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
        </div>
        <p className="label-mono text-muted-foreground mb-1">{label}</p>
        <p className="metric-number text-2xl font-bold text-foreground tracking-tight leading-none mb-1">
          {count.toString().padStart(2, "0")}
          <span className="text-xs font-mono text-muted-foreground ml-2">{unit}</span>
        </p>
        <p className="text-[11.5px] text-muted-foreground leading-relaxed">{tagline}</p>
      </Card>
    </Link>
  );
}

/* ============================================================
 * Recent updates (横断更新シグナル)
 * ============================================================ */

function RecentUpdatesCard({ updates }: { updates: UpdateItem[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-accent" />
            最近の更新 (横断)
          </CardTitle>
          <CardDescription className="mt-1 text-xs">
            アセット横断の鮮度シグナル。直近のレビュー日順
          </CardDescription>
        </div>
        <Link
          href="/editorial"
          className="inline-flex items-center gap-1 label-mono text-muted-foreground hover:text-accent transition-colors shrink-0"
        >
          <Sparkles className="h-3 w-3" />
          編集ステータス
        </Link>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {updates.map((u) => (
            <li key={`${u.kind}-${u.slug}`}>
              <Link
                href={u.href}
                className="group flex items-center gap-3 px-5 py-2.5 hover:bg-muted/40 transition-colors"
              >
                <KindIcon kind={u.kind} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-accent">
                    {u.title}
                  </p>
                  {u.subtitle && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {u.subtitle}
                    </p>
                  )}
                </div>
                <span className="metric-number text-[10px] text-muted-foreground shrink-0">
                  {u.date}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function KindIcon({ kind }: { kind: UpdateItem["kind"] }) {
  if (kind === "matrix") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
        <Columns3 className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (kind === "entity") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-accent shrink-0">
        <Network className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (kind === "player") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-accent shrink-0">
        <Building2 className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
      <Clock className="h-3.5 w-3.5" />
    </span>
  );
}

import { Badge } from "@/components/ui/badge";
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
  TrackSection,
  getUpcomingMilestones,
} from "@/components/home/track-section";
import { DefineSection } from "@/components/home/define-section";
import {
  CompareSection,
  pickFeaturedMatrix,
} from "@/components/home/compare-section";
import { ApplySection } from "@/components/home/apply-section";
import { SurveySection } from "@/components/home/survey-section";
import {
  RecentUpdatesCard,
  getRecentUpdates,
} from "@/components/home/recent-updates-card";

/**
 * カーボンクレジット領域のナレッジベースのホーム.
 *
 * 設計方針 (アライメント結果 2026-05-25):
 * - 主ペルソナ: 事業会社 CSR / サスティナビリティ担当
 * - キラーシナリオ: 規制変更キャッチアップ
 * - 「追う」セクション = 主役 (Hero 直後に配置)
 * - 編集論点 = 主力差別化要素 (各 timeline event の解釈を前面化)
 * - 動詞型タクソノミー (比べる / 調べる / 追う / 学ぶ / 世界マップ) を踏襲
 *
 * 各セクション実装は `src/components/home/*` に分離。本ファイルはデータ取得と
 * 骨組みの構成だけを持つ。
 */
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

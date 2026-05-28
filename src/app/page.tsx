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
import { OutcomeStrip } from "@/components/home/outcome-strip";

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
      {/* Hero — アウトカム主語 (STRATEGY §1): 情報でなく「追う時間」と「見落とすリスク」の肩代わり */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent mr-1.5 animate-pulse" />
            Decision-ready Intelligence
          </Badge>
          <span className="label-mono text-muted-foreground metric-number">
            Last update {lastUpdate}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 leading-tight">
          規制変更のキャッチアップから、<br className="sm:hidden" />
          判断が腐らない状態まで。
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          GX-ETS / CBAM / SBT を一次情報まで追う時間と、買った後に「使えない・ジャンク認定」を見落とすリスク——その両方を Carbomir が肩代わりする。
          論点・比較・適格性が出揃った状態を作り、前提が動けば見出しになる前に知らせる。CSR・サステナビリティ担当の報告・稟議・調達判断のために。
        </p>
      </header>

      {/* 3 アウトカム (STRATEGY §3): 判断の手前 / 稟議の弾薬 / 腐らせない監視 */}
      <OutcomeStrip />

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

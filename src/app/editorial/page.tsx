import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Tag, AlertTriangle, RefreshCw, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  listPublishedMatrices,
  listPublishedEntities,
  listPublishedTimelineEvents,
} from "@/lib/data/queries";
import { countReviewMarks } from "@/components/review-marks";
import { getGlossaryMap } from "@/lib/data/glossary-map";
import { getMediaCorpus } from "@/lib/data/media-articles";
import { TAG_VOCABULARY, TAG_CATEGORIES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Editorial Status",
  description:
    "Carbomir 編集状態の横断ダッシュボード。要確認の集約、タグ分布、古い更新の検出。",
};

type ReviewMarkLocation = {
  asset: "entity" | "matrix" | "timeline";
  slug: string;
  title: string;
  count: number;
  href: string;
};

function countReviewInEntity(e: Awaited<ReturnType<typeof listPublishedEntities>>[number]): number {
  let n = countReviewMarks(e.summary);
  for (const s of e.sections) n += countReviewMarks(s.body);
  return n;
}

function countReviewInMatrix(m: Awaited<ReturnType<typeof listPublishedMatrices>>[number]): number {
  let n = countReviewMarks(m.description);
  for (const entity of m.entities) {
    const row = m.cells[entity.slug];
    if (!row) continue;
    for (const dim of m.dimensions) {
      const c = row[dim.key];
      if (!c) continue;
      n += countReviewMarks(c.value);
      if (c.note) n += countReviewMarks(c.note);
    }
  }
  return n;
}

function countReviewInTimeline(t: Awaited<ReturnType<typeof listPublishedTimelineEvents>>[number]): number {
  return countReviewMarks(t.summary) + countReviewMarks(t.content_md ?? "");
}

export default async function EditorialPage() {
  const [matrices, entities, timeline] = await Promise.all([
    listPublishedMatrices(),
    listPublishedEntities(),
    listPublishedTimelineEvents(),
  ]);

  // === 要確認 集約 ===
  const reviewLocations: ReviewMarkLocation[] = [];
  for (const e of entities) {
    const n = countReviewInEntity(e);
    if (n > 0)
      reviewLocations.push({
        asset: "entity",
        slug: e.slug,
        title: e.name_ja,
        count: n,
        href: `/entities/${e.slug}`,
      });
  }
  for (const m of matrices) {
    const n = countReviewInMatrix(m);
    if (n > 0)
      reviewLocations.push({
        asset: "matrix",
        slug: m.slug,
        title: m.title,
        count: n,
        href: `/matrices/${m.slug}`,
      });
  }
  for (const t of timeline) {
    const n = countReviewInTimeline(t);
    if (n > 0)
      reviewLocations.push({
        asset: "timeline",
        slug: t.slug,
        title: t.title,
        count: n,
        href: `/timeline/${t.slug}`,
      });
  }
  reviewLocations.sort((a, b) => b.count - a.count);
  const totalReview = reviewLocations.reduce((s, r) => s + r.count, 0);

  // === タグ分布 ===
  const tagCount = new Map<string, number>();
  for (const e of entities) {
    for (const t of e.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  }
  // 控制語彙にないタグを検出 (今は無いはずだが将来の monitor 用)
  const offVocabTags = Array.from(tagCount.keys()).filter(
    (t) => !TAG_VOCABULARY.includes(t)
  );

  // === 古い更新 ===
  const THIRTY_DAYS_AGO = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  })();
  const stale = [
    ...entities
      .filter((e) => e.last_reviewed_at < THIRTY_DAYS_AGO)
      .map((e) => ({ kind: "entity", title: e.name_ja, date: e.last_reviewed_at, href: `/entities/${e.slug}` })),
    ...matrices
      .filter((m) => m.last_reviewed_at < THIRTY_DAYS_AGO)
      .map((m) => ({ kind: "matrix", title: m.title, date: m.last_reviewed_at, href: `/matrices/${m.slug}` })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  // === thin sections (sections が少ない entity) ===
  const thinEntities = entities
    .filter((e) => e.sections.length <= 2)
    .map((e) => ({ slug: e.slug, name: e.name_ja, sections: e.sections.length, href: `/entities/${e.slug}` }));

  // === 媒体連携 (carboncredits.jp 照合) — PROVENANCE.md §7 ===
  const glossary = getGlossaryMap();
  const glossaryDrift = Object.entries(glossary.entries)
    .filter(([, e]) => e.review_state === "drifted")
    .map(([slug, e]) => ({ slug, wp_slug: e.wp_slug, lastmod: e.media_lastmod, href: `/entities/${slug}` }));
  const glossaryDangling = Object.entries(glossary.entries)
    .filter(([, e]) => e.review_state === "dangling")
    .map(([slug, e]) => ({ slug, wp_slug: e.wp_slug, href: `/entities/${slug}` }));
  const glossaryOrphans = glossary.last_orphans ?? [];
  const glossarySyncedLabel = glossary.last_synced_at
    ? glossary.last_synced_at.slice(0, 10)
    : "未同期";
  const mediaCorpus = getMediaCorpus();
  const mediaSyncedLabel = mediaCorpus.last_synced_at
    ? mediaCorpus.last_synced_at.slice(0, 10)
    : "未同期";

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <ClipboardList className="h-2.5 w-2.5 mr-1" />
            Editorial Status
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          編集ステータス
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          編集者向けの内部ダッシュボード。<strong className="text-foreground">要確認マークは公開コンテンツに残してはならない</strong>方針 (STYLE_GUIDE 準拠) のため、ここでの「要確認 X 件」は <strong className="text-amber-700 dark:text-amber-300">解消すべき残課題</strong> を意味する。AI ドラフトレビューは <Link href="/admin/drafts" className="text-accent hover:underline">/admin/drafts</Link>。
        </p>
      </header>

      {/* Totals */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          label="公開ページに残る要確認"
          value={totalReview}
          unit="解消すべき残課題"
          accent="amber"
        />
        <MetricCard
          icon={<Tag className="h-4 w-4 text-accent" />}
          label="使用中タグ"
          value={tagCount.size}
          unit={`/ ${TAG_VOCABULARY.length} in vocab`}
        />
        <MetricCard
          icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
          label="30 日超未更新"
          value={stale.length}
          unit="entries"
        />
        <MetricCard
          icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
          label="Thin sections (≤2)"
          value={thinEntities.length}
          unit="entities"
        />
      </section>

      {/* 要確認 一覧 */}
      <section className="mb-8">
        <h2 className="label-mono text-foreground mb-3">要確認マーク (アセット別)</h2>
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">Asset</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">Title</th>
                <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">要確認 件数</th>
              </tr>
            </thead>
            <tbody>
              {reviewLocations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center label-mono text-muted-foreground">
                    要確認マークなし
                  </td>
                </tr>
              ) : (
                reviewLocations.map((r) => (
                  <tr key={`${r.asset}-${r.slug}`} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2.5 align-middle">
                      <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
                        {r.asset}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 align-middle">
                      <Link href={r.href} className="text-foreground hover:text-accent font-medium">
                        {r.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 align-middle text-right">
                      <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono tracking-wider text-amber-700 dark:text-amber-300">
                        {r.count}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>

      {/* タグ分布 */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-3 flex-wrap">
          <h2 className="label-mono text-foreground">タグ分布</h2>
          {offVocabTags.length > 0 && (
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider text-amber-700 dark:text-amber-300 border-amber-500/40"
            >
              ⚠ {offVocabTags.length} 件 vocab 外
            </Badge>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TAG_CATEGORIES.map((cat) => {
            const used = cat.tags.filter((t) => tagCount.has(t));
            const unused = cat.tags.filter((t) => !tagCount.has(t));
            return (
              <Card key={cat.label} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="label-mono text-foreground">{cat.label}</p>
                  <span className="label-mono text-muted-foreground">
                    {used.length}/{cat.tags.length}
                  </span>
                </div>
                <ul className="space-y-1">
                  {cat.tags.map((t) => {
                    const c = tagCount.get(t) ?? 0;
                    const isUsed = c > 0;
                    return (
                      <li key={t} className="flex items-center justify-between text-[12.5px]">
                        <span
                          className={
                            isUsed
                              ? "text-foreground"
                              : "text-muted-foreground/50 line-through"
                          }
                        >
                          {t}
                        </span>
                        <span
                          className={`metric-number text-[11px] ${
                            isUsed ? "text-foreground" : "text-muted-foreground/40"
                          }`}
                        >
                          {c}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {unused.length > 0 && (
                  <p className="label-mono text-muted-foreground/60 mt-2">
                    {unused.length} 未使用
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 古い更新 + thin */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-2.5 border-b border-border bg-muted/40">
            <h2 className="label-mono text-foreground">30 日超未更新 (古い順)</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {stale.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center label-mono text-muted-foreground">
                    該当なし
                  </td>
                </tr>
              ) : (
                stale.slice(0, 15).map((s) => (
                  <tr key={s.href} className="border-t border-border first:border-t-0 hover:bg-muted/30">
                    <td className="px-4 py-2 align-middle">
                      <Link href={s.href} className="text-foreground hover:text-accent">
                        {s.title}
                      </Link>
                      <span className="ml-2 label-mono text-muted-foreground">{s.kind}</span>
                    </td>
                    <td className="px-4 py-2 text-right metric-number text-[12px] text-muted-foreground">
                      {s.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="px-4 py-2.5 border-b border-border bg-muted/40">
            <h2 className="label-mono text-foreground">Thin sections (sections ≤ 2)</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {thinEntities.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center label-mono text-muted-foreground">
                    該当なし
                  </td>
                </tr>
              ) : (
                thinEntities.map((e) => (
                  <tr key={e.slug} className="border-t border-border first:border-t-0 hover:bg-muted/30">
                    <td className="px-4 py-2 align-middle">
                      <Link href={e.href} className="text-foreground hover:text-accent">
                        {e.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right metric-number text-[12px] text-muted-foreground">
                      {e.sections} sections
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>

      {/* 媒体連携 (carboncredits.jp 照合) — PROVENANCE.md §7 */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-3 flex-wrap">
          <h2 className="label-mono text-foreground flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-accent" />
            媒体連携 (carboncredits.jp 照合)
          </h2>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider text-muted-foreground border-border"
          >
            glossary 同期: {glossarySyncedLabel}
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider text-muted-foreground border-border"
          >
            記事 corpus: {mediaCorpus.articles.length.toLocaleString()} 件 ({mediaSyncedLabel})
          </Badge>
        </div>
        <p className="text-[12.5px] text-muted-foreground max-w-2xl leading-relaxed mb-3">
          <code className="font-mono text-[11.5px]">npm run sync:glossary</code> が wp-sitemap と照合する。
          <strong className="text-foreground">drift</strong>=媒体記事が更新され要再レビュー /{" "}
          <strong className="text-foreground">dangling</strong>=対応 wp_slug が媒体に無い (改名/削除の疑い) /{" "}
          <strong className="text-foreground">orphan</strong>=媒体にあるが未マップの新規記事候補。
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          <GlossaryReconcileCard
            title="drift (要再レビュー)"
            accent="amber"
            empty="ドリフトなし"
            rows={glossaryDrift.map((d) => ({
              key: d.slug,
              href: d.href,
              label: d.slug,
              sub: d.lastmod?.slice(0, 10) ?? "",
            }))}
          />
          <GlossaryReconcileCard
            title="dangling (媒体側に記事なし)"
            accent="amber"
            empty="該当なし"
            rows={glossaryDangling.map((d) => ({
              key: d.slug,
              href: d.href,
              label: d.slug,
              sub: `→ ${d.wp_slug}`,
            }))}
          />
          <GlossaryReconcileCard
            title="orphan (未マップ媒体記事)"
            empty="該当なし"
            rows={glossaryOrphans.map((o) => ({
              key: o.wp_slug,
              href: `https://carboncredits.jp/glossary/${o.wp_slug}/`,
              external: true,
              label: o.wp_slug,
              sub: o.lastmod.slice(0, 10),
            }))}
          />
        </div>
      </section>

      <Card className="mt-6">
        <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed flex items-start gap-3 flex-wrap">
          <span className="flex-1 min-w-[280px]">
            このページは read-only ダッシュボード。AI による補強ドラフトの作成・承認は{" "}
            <Link href="/admin/drafts" className="text-accent hover:underline">
              /admin/drafts
            </Link>{" "}
            で行う。CLI で <code className="font-mono text-[12px]">npm run ai:draft</code> を叩くとドラフトが pending として積まれる。
          </span>
          <Link
            href="/admin/drafts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/15 text-accent hover:bg-accent/25 transition-colors text-xs font-medium shrink-0"
          >
            AI ドラフトを開く →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function GlossaryReconcileCard({
  title,
  rows,
  empty,
  accent,
}: {
  title: string;
  rows: { key: string; href: string; label: string; sub?: string; external?: boolean }[];
  empty: string;
  accent?: "amber";
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center justify-between">
        <h3 className="label-mono text-foreground">{title}</h3>
        <span
          className={`metric-number text-[12px] ${
            rows.length > 0 && accent === "amber"
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground"
          }`}
        >
          {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center label-mono text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.slice(0, 20).map((r) => (
            <li key={r.key} className="px-4 py-2 flex items-center justify-between gap-2 hover:bg-muted/30">
              {r.external ? (
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-accent text-[12.5px] truncate"
                >
                  {r.label}
                </a>
              ) : (
                <Link href={r.href} className="text-foreground hover:text-accent text-[12.5px] truncate">
                  {r.label}
                </Link>
              )}
              {r.sub && (
                <span className="metric-number text-[11px] text-muted-foreground shrink-0">{r.sub}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  accent?: "amber";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="label-mono text-muted-foreground">{label}</p>
      </div>
      <p
        className={`metric-number text-2xl font-bold tracking-tight leading-none mb-1 ${
          accent === "amber" ? "text-amber-600 dark:text-amber-400" : "text-foreground"
        }`}
      >
        {value.toLocaleString()}
      </p>
      <p className="label-mono text-muted-foreground/80">{unit}</p>
    </Card>
  );
}

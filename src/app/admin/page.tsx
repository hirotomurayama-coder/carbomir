import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileEdit, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AdminBanner } from "@/components/admin/admin-banner";

export const metadata: Metadata = {
  title: "Admin",
  description: "Carbomir 編集ツール (社内用)",
};

// drafts ページ等と同様、本番では Basic Auth + force-dynamic
export const dynamic = "force-dynamic";

/**
 * /admin ルート. 子ページ (drafts / edit) への入り口だけを並べる薄い landing.
 *
 * 設計判断:
 *   - 中身は子ページに集約。ここで listDrafts() などを呼ぶと
 *     /admin にアクセスする度に I/O が走り、本番 (read-only fs) でも
 *     失敗リスクを増やすため、リンクのみのページに留める.
 *   - サイドバーから直接 drafts/edit に飛べるが、URL を直接叩いて
 *     /admin に来た場合の 404 を避ける.
 */
export default function AdminIndexPage() {
  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1100px] mx-auto">
      <AdminBanner />

      <header className="mb-6 mt-4">
        <p className="label-mono text-muted-foreground">ADMIN</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">
          編集ツール
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">
          社内編集用ツールの入り口。Vercel 本番では Basic Auth で保護され、
          かつ filesystem への書き込みは無効化されている (preview / dev 環境のみ
          編集可)。
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/drafts" className="block">
          <Card className="p-5 h-full hover:border-accent/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-accent/10 p-2 text-accent">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-semibold text-foreground">
                    AI ドラフトレビュー
                  </h2>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  <code className="text-xs">npm run ai:draft</code> で生成した
                  AI ドラフトの一覧。承認/却下 + 公開反映までの軽量ワークフロー。
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/edit" className="block">
          <Card className="p-5 h-full hover:border-accent/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-accent/10 p-2 text-accent">
                <FileEdit className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-semibold text-foreground">
                    コンテンツ編集
                  </h2>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  エンティティ / 比較行列 / 時系列 / ケーススタディ / FAQ の
                  各 slug 直編集フォーム。
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-8 label-mono text-muted-foreground text-xs leading-relaxed">
        <p>NOTE: /admin/* 配下は middleware.ts の Basic Auth で保護されています。</p>
        <p>環境変数 ADMIN_BASIC_AUTH_USER / ADMIN_BASIC_AUTH_PASS は Vercel ダッシュボードで管理。</p>
      </div>
    </div>
  );
}

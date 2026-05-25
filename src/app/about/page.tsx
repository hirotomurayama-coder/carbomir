import type { Metadata } from "next";
import Link from "next/link";
import {
  Building,
  Mail,
  FileText,
  ShieldCheck,
  Sparkles,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Carbomir について",
  description:
    "Carbomir の運営会社・編集方針・レビューサイクル・お問い合わせ。株式会社クレイドルトゥーが運営するカーボンクレジット領域のナレッジベース。",
};

export default function AboutPage() {
  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1000px] mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Compass className="h-2.5 w-2.5 mr-1" />
            About Carbomir
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          Carbomir について
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          Carbomir はカーボンクレジット領域の構造化ナレッジベースです。
          事業会社の CSR / サスティナビリティ担当者が、規制変更のキャッチアップから取締役会向け資料作成までを支援する設計でつくられています。
        </p>
      </header>

      <div className="space-y-6">
        {/* 運営会社 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-4 w-4 text-accent" />
              <h2 className="text-base font-semibold text-foreground">運営会社</h2>
            </div>
            <Separator className="mb-4" />
            <dl className="grid gap-3 sm:grid-cols-[140px_1fr] text-sm">
              <dt className="label-mono text-muted-foreground">運営</dt>
              <dd className="text-foreground/85">
                株式会社クレイドルトゥー (CradleTo, Inc.)
              </dd>
              <dt className="label-mono text-muted-foreground">親メディア</dt>
              <dd className="text-foreground/85">
                <a
                  href="https://carboncredits.jp"
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  carboncredits.jp
                </a>{" "}
                — Carbomir はその <code className="font-mono text-[12px]">/carbomir</code> として稼働
              </dd>
              <dt className="label-mono text-muted-foreground">お問い合わせ</dt>
              <dd className="text-foreground/85">
                <a
                  href="https://carboncredits.jp/contact"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Mail className="h-3 w-3" />
                  carboncredits.jp/contact
                </a>
              </dd>
            </dl>
          </CardContent>
        </Card>

        {/* 主ペルソナと目的 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-accent" />
              <h2 className="text-base font-semibold text-foreground">
                想定読者と目的
              </h2>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-3 text-sm text-foreground/85 leading-relaxed">
              <p>
                主読者は <strong>事業会社の CSR / サスティナビリティ担当者</strong>。
                主用途は <strong>規制変更のキャッチアップと、取締役会・社内向け資料作成への転用</strong>です。
              </p>
              <p>
                Carbomir はカーボンクレジット領域の制度・スタンダード・プレイヤー・事例を、
                <strong>動詞型タクソノミー</strong> (比べる / 調べる / 追う / 学ぶ / 世界マップ) で整理し、
                各情報の関係性・出典・最終レビュー日を構造化して提供します。
              </p>
              <p>
                生情報の一覧はコモディティ化しているため、Carbomir では <strong>「これが何を意味するか」の編集解釈</strong> を主力差別化要素として、各詳細ページの「編集部の論点」セクションに集約しています。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 編集方針 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-accent" />
              <h2 className="text-base font-semibold text-foreground">
                編集方針
              </h2>
            </div>
            <Separator className="mb-4" />
            <ul className="space-y-2 text-sm text-foreground/85 leading-relaxed list-disc list-inside">
              <li>
                <strong>確信度 3 段階</strong>: 事実は断定 / 解釈は中立 / 予測は明示的に弱く表現
              </li>
              <li>
                <strong>出典明示</strong>: 規制発効日・統計数字は本文中にインライン引用、背景解説は末尾の Sources セクションに集約
              </li>
              <li>
                <strong>「要確認」マークの方針</strong>: 公開コンテンツに残してはならない。執筆段階で見えた不確実性は内部レビューで解消する
              </li>
              <li>
                <strong>「運用注視」マーク</strong>: 制度の運用実態が未だ見えない等、本質的に不確実な領域は公開後もこのラベルで残す
              </li>
              <li>
                <strong>用語規範</strong>: Verra (VCS) / GX-ETS / J-クレジット 等のハイフン保持、西暦は半角スペース併用、業界用語はカタカナ優先
              </li>
              <li>
                編集者は当面個人名を公開せず、<strong>「Carbomir 編集部」</strong> として記述します
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* レビューサイクル */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <h2 className="text-base font-semibold text-foreground">
                品質シグナルとレビュー
              </h2>
            </div>
            <Separator className="mb-4" />
            <ul className="space-y-2 text-sm text-foreground/85 leading-relaxed list-disc list-inside">
              <li>
                各詳細ページに <strong>FreshnessIndicator</strong> を表示 — 最終レビュー日 + 相対表示 + 警告レベル (30 日 / 90 日 / 180 日)
              </li>
              <li>
                規制関連エンティティは原則 <strong>1-3 ヶ月ごとに再レビュー</strong>。一般エンティティは 3-6 ヶ月
              </li>
              <li>
                政策・規制エンティティには <strong>policy_status</strong> (proposed / enacted / effective / under_review) と <strong>next_milestone</strong> を構造化属性として保持
              </li>
              <li>
                編集体制の透明性確保のため、内部 dashboard{" "}
                <Link href="/editorial" className="text-accent hover:underline">
                  /editorial
                </Link>{" "}
                で要確認の残課題・タグ分布・古い更新を可視化
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 出典データセットの帰属 */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-3">
              引用元データセット
            </h2>
            <Separator className="mb-4" />
            <ul className="space-y-2 text-sm text-foreground/85 leading-relaxed list-disc list-inside">
              <li>
                「世界マップ」内の 価格制度 / クレジット機構 / 二国間協定 は{" "}
                <a
                  href="https://carbonpricingdashboard.worldbank.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  World Bank Carbon Pricing Dashboard
                </a>{" "}
                由来 (CC BY 4.0)
              </li>
              <li>
                「世界マップ」内の OffsetsDB は{" "}
                <a
                  href="https://offsets-db.carbonplan.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  CarbonPlan OffsetsDB
                </a>{" "}
                由来 (MIT License)
              </li>
              <li>
                上記以外のすべての構造化コンテンツ (比較行列 / 概念体系 / 時系列 / ケーススタディ / FAQ) は Carbomir 編集部の独自編集物です
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 法的情報 */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-5 text-xs text-muted-foreground leading-relaxed">
            <p className="mb-2">
              Carbomir のコンテンツは情報提供を目的としており、特定のクレジット購入・売却・投資の推奨ではありません。
              実際の意思決定は、専門家のアドバイス・最新の一次資料の確認を踏まえて行ってください。
            </p>
            <p>
              個別案件のご相談は{" "}
              <a
                href="https://carboncredits.jp/contact"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                株式会社クレイドルトゥーまでお問い合わせください
              </a>
              。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

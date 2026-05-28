@AGENTS.md

# Carbomir — プロジェクト指示書 (株式会社クレイドルトゥー)

## プロジェクト概要

カーボンクレジット領域の有料ナレッジベース。`carboncredits.jp/carbomir` サブディレクトリで稼働。

- **会社**: 株式会社クレイドルトゥー (CradleTo, Inc.)
- **問い合わせ先**: https://carboncredits.jp/contact
- **運用ドメイン**: carboncredits.jp (WordPress) / `/carbomir` がこの Next.js アプリ

---

## プロダクト方針 (アライメント結果 — 2026-05-25)

> **重要**: 以下は実装判断の最上位レイヤー。設計・コンテンツ判断で迷ったらここを見る。

### 主ペルソナ: Persona A — CSR / サスティナビリティ担当
- 所属: CSR 部 / サステナビリティ推進部 / IR 部
- 業務: TCFD / SBT / CDP 報告、Net-Zero ロードマップ策定、株主・顧客向け開示
- 知識レベル: 中〜上級 (用語は分かる、判断材料が欲しい)
- ペイン: 情報散在、信頼できる出典少、業界水準が見えない
- 副ペルソナ: Persona C (経営企画) は近接、Persona B (調達) は実務寄りすぎて主対象外

### キラーシナリオ: 規制変更キャッチアップ
- 状況: GX-ETS / CBAM / SBT 改訂等の規制動向把握
- 用途: タイムラインで動きを追う、政策ステータスで次マイルストーン把握、関連エンティティへ deep dive
- 滞在: 中時間 (30 分-1 時間)、頻度: 月 1-2 回 (規制動きで急増)
- 副シナリオ: 取締役会資料作成、TCFD/CDP 定期報告

### 編集論点の位置付け: 主力差別化要素
- 規制変更の生情報はコモディティ。Carbomir の価値は **「これが何を意味するか」の編集解釈**
- 構造化 (matrix / 属性 / 関係) は **編集論点を載せる土台** という関係
- 「編集部の論点」セクションは各詳細ページの **中核** として扱う

### アセットタクソノミー (動詞型 + 名詞 1)
| ラベル | 含むアセット | 機能ロール |
|---|---|---|
| **比べる** | 比較行列 | Compare — トレードオフ提示 |
| **調べる** | 概念体系 / プレイヤー / 政策・規制 | Define — 構造化定義 |
| **追う** | 時系列 | Track — 動向追跡 (**ホーム主役**) |
| **学ぶ** | ケーススタディ / FAQ | Apply — 実務応用 |
| **世界マップ** | 価格制度 / クレジット機構 / 二国間協定 / OffsetsDB | Survey — 外部由来網羅マスタ (旧 Atlas) |
| ツール | 関係グラフ / 編集ステータス | メタビュー |
| Admin | AI ドラフト | 編集ツール (内部) |

設計原則:
- 4 動詞 (比べる / 調べる / 追う / 学ぶ) = Carbomir 編集部の編集資産
- 名詞型「世界マップ」 = 外部由来の網羅マスタ
- このラベル差で「自社編集物 vs 外部参照データ」の性質差を直接表現

### 品質シグナル方針
- **「要確認」マーク**: 公開時に解消するのが原則。`/editorial` だけに残る (内部 TODO)
- **構造的不確実性**: 「(運用注視: ...)」ラベルで残す (透明性価値)
- **鮮度シグナル**: 絶対日付 + 相対表示 + 警告レベル + `next_review_at`
- **政策ステータス**: `policy_status` + `next_milestone` をカレンダー化
- **status バッジ**: 公開ページからは消し、内部のみ管理

### コンテンツ拡充の優先順位
1. 時系列イベントの編集論点 (主役。差別化の中核)
2. 政策・規制 entity の `next_milestone` / `policy_status` (カレンダー化のため必須)
3. 規制テーマの FAQ
4. 規制対応事例のケーススタディ
5. 比較行列 (規制間比較を中心に)
6. 概念体系 / プレイヤー / 世界マップ (文脈情報として)
7. エンジニアリング系メソドロジー / 技術 (必要だが急がない)

### 課金設計方針 (Phase 4)
- **Free** (¥0): 公開コンテンツの 70% (時系列旧イベント、エンティティ基本、比較行列見出し+一部セル)
- **Standard** (¥3,000-5,000/月): 全コンテンツ、**編集論点フル**、規制カレンダー、Cmd+K 高度検索
- **Pro** (¥15,000-30,000/月): CSV エクスポート、アラート / 通知、API
- 編集論点を Standard 限定にする paywall 設計が必要 (Phase 4 で実装)

### スタイル規範
詳細は [STYLE_GUIDE.md](./STYLE_GUIDE.md) を参照。AI ドラフト生成と人手執筆の両方が遵守する。
- 確信度 3 段階 (強・中・弱)
- 出典: ハイブリッド (本文インライン + 末尾集約)
- 編集者透明性: About ページ + 法人クレジット、個人名は当面非公開
- 用語規範: Verra (VCS), GX-ETS, J-クレジット, 2026 年, USD/t
- 編集論点セクション名: **「編集部の論点」** に統一

---

## 技術スタック

| 項目 | バージョン/詳細 |
|------|----------------|
| Next.js | 16.2.x (App Router, Turbopack) |
| React | 19.2.x |
| Tailwind CSS | v4 (`@theme inline`, `@custom-variant`) |
| shadcn/ui | Tailwind v4 対応版 |
| next-themes | クラスベースダーク/ライト切替 |
| Supabase | PostgreSQL + Auth + RLS (未接続時はシードデータで fallback) |
| lucide-react | 最新版 |
| cmdk | Cmd+K Command Palette |
| @anthropic-ai/sdk | AI ドラフト生成 CLI で使用 |
| tsx | scripts/*.ts 実行 |

---

## ディレクトリ構成 (現状)

```
src/
  app/
    layout.tsx          # ThemeProvider > TooltipProvider > CommandMenuProvider > AppShell
    page.tsx            # ダッシュボードホーム
    globals.css         # ブランドカラー + shadcn 変数
    entities/           # 概念体系 (調べる)
    matrices/           # 比較行列 (比べる)
    timeline/           # 時系列 (追う)
    case-studies/       # ケーススタディ (学ぶ)
    faq/                # FAQ (学ぶ)
    players/            # プレイヤー (調べる)
    policies/           # 政策・規制 (調べる)
    atlas/              # 旧 Atlas (UI 表示は「世界マップ」)
      instruments/      # 価格制度
      mechanisms/       # クレジット機構
      cooperative/      # 二国間協定
      offsets-db/       # OffsetsDB 集計サマリ
        projects/       # 11,640 件プロジェクト一覧 (server-side filter)
          [id]/         # プロジェクト個別ページ (on-demand SSR)
    graph/              # 関係グラフ (ツール)
    editorial/          # 編集ステータス (ツール)
    admin/
      drafts/           # AI ドラフトレビュー (内部)
  components/
    app-shell.tsx       # Sidebar + TopBar + Footer ラッパー
    app-sidebar.tsx     # 常時ダーク左サイドバー
    app-topbar.tsx      # sticky ヘッダー
    command-menu.tsx    # Cmd+K グローバル検索
    review-marks.tsx    # 要確認マーク表示 (将来削除予定)
    markdown-content.tsx
    atlas/              # 世界マップ関連コンポーネント
                        #   instruments/mechanisms/cooperative-table & network
                        #   world-map-leaflet, world-bubble-map, atlas-charts
                        #   offsets-projects-filters/table/pagination,
                        #   offsets-db-inline-card, atlas-deep-dive-panel
    case-studies/, faq/, entities/, matrices/, timeline/, players/
  lib/
    types.ts            # ドメイン型の re-export ハブ (実体は types/ 配下に分割)
    types/              # ドメイン別型: common / entity / comparison /
                        #   case-study / faq / timeline / atlas / ai-draft
    database.types.ts   # Supabase DB スキーマ
    supabase.ts         # Supabase クライアント
    data/
      queries.ts        # Server Component 用データアクセス re-export ハブ
      queries/          # ドメイン別 query 実装 (entities/comparisons/timeline/
                        #   atlas/case-study-faq)
      entities.ts, comparisons.ts, timeline.ts
      case-studies.ts, faqs.ts
      ai-drafts.ts      # AI ドラフトストア (filesystem-backed)
      atlas/            # 世界マップデータ
      mappers.ts, queries.ts
scripts/
  ai-draft.ts           # AI ドラフト生成 CLI
  sync-offsets-db.py
data/
  ai-drafts/            # AI ドラフト JSON (filesystem-backed)
  content/              # 公開コンテンツ JSON (entities / matrices / timeline / case-studies / faqs)
                        #   src/lib/data/*.ts は薄いローダーになり、本体は JSON ファイル
supabase/
  migrations/0001-0008  # 8 migrations 累積 (0008 = offsets_db_projects)
  seed/                 # SQL seed (TS seed と同期)
```

---

## デザイン原則

- **カラーパレット**: 深ネイビー (#0c2545) + シアン青 (#0ea5e9) + ダークBG (#050a14)
- **トーン**: SaaS ダッシュボード型。メディア感排除、システム感優先
- **タイポ**: モノスペース (label-mono, metric-number) を多用してデータ感を演出
- **サイドバー**: 常時ダーク (`bg-sidebar: #0a1628`)
- **データ密度**: 二段階 (一覧=高密度 / 詳細ページの編集論点=余白多め)
- **バッジ 3 階層**:
  - 第 1 階層 (常設): カテゴリ / 鮮度シグナル
  - 第 2 階層 (条件付き): status 警告 / 規制ステータス
  - 第 3 階層 (内部のみ): 要確認件数 (公開ページからは消去)

### 表示禁止事項
- `L2-E`、`L5` 等の社内記号はコード内では使用可だが、**UI/アウトプットに表示してはならない**
- 「要確認 (...)」マークは **公開コンテンツに残してはならない** (内部 TODO 用、`/editorial` だけに集計表示)

---

## Next.js 16 固有の注意点

```typescript
// params は必ず Promise として受け取る
type Props = { params: Promise<{ slug: string }> };
export default async function Page({ params }: Props) {
  const { slug } = await params;  // await 必須
}
```

---

## 環境変数 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

未設定でもシードデータで動作する。本番値は Vercel Environment Variables で管理。コードへの直書き厳禁。

---

## Phase 完了状況

### Phase 1A / 1B / 2 / 2.5 ✅ 完了
- プロジェクト初期化 + App Shell + ブランドカラー
- 比較行列・概念体系・時系列の UI + Cmd+K
- Supabase 接続 (seed fallback) + Vitest + mappers tests

### Phase 3 ✅ コンテンツ + 編集ツール
- [x] エンティティ拡充 **79 件** (うち政策・規制 26 件): methodology / regulation / player / market / technology
- [x] 比較行列 **8 件**: VCM スタンダード / Engineered Removal / ETS / Credit Eligibility / J-クレジット 他
- [x] 時系列イベント **52 件** (GX-ETS / CBAM / SBTi / 開示制度 / VCMI を中心に拡充)
- [x] /atlas — World Bank + CarbonPlan データセット取り込み
- [x] /graph 関係グラフビュー
- [x] /editorial 編集ステータスダッシュボード
- [x] /case-studies **10 件** と /faq **20 件**
- [x] tag controlled vocabulary
- [x] **AI ドラフトパイプライン**: `npm run ai:draft` CLI + `/admin/drafts` レビュー UI

### Phase Α ✅ アライメント永続化
- [x] CLAUDE.md にアライメント結果反映
- [x] STYLE_GUIDE.md 作成 (9 KB)
- [x] ai-draft.ts プロンプトに STYLE_GUIDE 反映

### Phase Β ✅ タクソノミー実装
- [x] サイドバー: 動詞型ラベル化 (比べる / 調べる / 追う / 学ぶ / 世界マップ) — `src/components/app-sidebar.tsx`
- [x] Cmd+K: 動詞ベース構成 — `src/components/command-menu.tsx`
- [x] ホームページ: 「追う」を主役にした再構築 (TrackSection を hero 直下に配置)

### Phase Γ ✅ 品質シグナル強化
- [x] FreshnessIndicator コンポーネント — `src/components/freshness-indicator.tsx` (entities / matrices / case-studies 詳細で使用)
- [x] `next_review_at` データモデル追加 — 140 件中 117 件 (83.6%) 充足
- [x] 「要確認」マークの整理 — 公開ページから 0 件、`/editorial` ダッシュボードに集約済
- [x] バッジ 3 階層整理 — デザイン原則に明文化、status バッジは公開から除去

### Phase 6 ✅ 主要ページ ブラッシュアップ (Theme 1〜6 + Fix-A〜R)
- [x] Theme 1: 4 explorer ページをデータベース UI 化 (数百件想定)
- [x] Theme 2: 比較行列詳細ページのビジュアル刷新 + 28 セルに公式出典 URL
- [x] Theme 3: 概念体系を「用語集」に再定位 + carboncredits.jp 連携 + 不足用語 23 件追加
- [x] Theme 4: プレイヤーの役割分類見直し (9 件に business_role 付与)
- [x] Theme 5+6: 時系列バー化 + 「今ホット」+ 規制カレンダー統合
- [x] Fix-A〜R: timeline stagger 修正 / sticky filter / sticky table header を 5 ページに展開 / 期間イベント横バー表現 など

### Phase Δ (仕上げ — 残タスク)
- [ ] 既存 seed コンテンツのトーン統一 (一部進行中)
- [ ] /about ページ充実化 (法人クレジット、編集体制) — ディレクトリ存在、内容要確認
- [ ] ライトモード完成度向上
- [ ] モバイル ハンバーガーメニュー
- [ ] レイアウトトークン統一 (Fix-N〜R の sticky 系起因 → 再発防止)
- [ ] 大型ファイル分解 (残): `edit-form.tsx` (917) / `timeline-bars.tsx` (795)
  - [x] `lib/types.ts` (626 → 19): 8 ドメイン別ファイル (common/entity/comparison/case-study/faq/timeline/atlas/ai-draft) に分割、types.ts は re-export ハブ
  - [x] `lib/data/queries.ts` (594 → 18): 5 ファイル (entities/comparisons/timeline/atlas/case-study-faq) に分割、queries.ts は re-export ハブ
  - [x] `app/page.tsx` (743 → 137): 8 ファイル (section-header/mini-asset-card/track/define/compare/apply/survey/recent-updates) を `src/components/home/` に抽出、ヘルパー (pickFeaturedMatrix / getUpcomingMilestones / getRecentUpdates) も同居
- [ ] テストカバレッジ向上 — 現状 3/130 (2.3%)、UI コンポーネントは全て未テスト

### Phase 5-A ✅ 世界マップ ブラッシュアップ (Fix-E〜I)
- [x] /atlas トップの抜本ビジュアル改修 (世界マップ + ネットワーク図 + チャート)
- [x] Leaflet + OpenStreetMap タイル地図
- [x] /atlas/instruments, /mechanisms に詳細グラフ追加
- [x] /atlas/cooperative の JCM 併置・ネットワーク図
- [x] 4 ページ日本語化 + バグ修正

### Phase 5-B ✅ OffsetsDB プロジェクト個別 + 全件検索 (Fix-J〜K)
- [x] /atlas/offsets-db/projects/[id] 個別ページ (on-demand SSR)
- [x] migration 0008: offsets_db_projects テーブル + FTS + RLS public read
- [x] sync-offsets-db.py に Supabase upsert (REST、env 設定時のみ)
- [x] queries.ts に listOffsetsDbProjectsFiltered (server-side filter/sort/page)
- [x] 一覧ページを searchParams 駆動の SSR に rewrite (4.7MB JSON bundle 解消)
- [x] Filters/Table/Pagination を 3 コンポーネントに分離 (shareable URL)
- [ ] (保留) 5-B-3: 取引履歴 53 万件を別テーブルで保持

### Phase 4 (配管系・後回し)
- [ ] 認証フロー (Supabase Auth + Google OAuth + middleware)
- [ ] 課金フロー (Stripe Free/Standard/Pro)
- [ ] ペイウォール (編集論点を Standard 限定に — マスキング・認証ゲート)
  - [x] **地ならし完了**: `paywall_tier: "free" | "standard" | "pro"` をデータモデルに追加、PaywallBadge で「Standard 会員限定」ラベルだけ先行表示 (entity 79 / case-study 10 / matrix 8 件すべての「編集部の論点」セクションに付与済み)。残るは認証ゲートと本文マスク
  - [x] **Pro 機能 先行第 1 弾**: `/policies/calendar/feed.ics` で規制カレンダー + 未来 timeline (合算 23 件) を ICS エクスポート (RFC 5545 終日イベント)。`/policies/calendar` ヘッダーに DL ボタン + `PaywallBadge tier="pro"`。認証ゲートは Phase 4 で middleware に追加 (現状は誰でも DL 可能)
- [ ] Vercel デプロイ + carboncredits.jp/carbomir リバースプロキシ

---

## ビルド確認コマンド

```bash
cd ~/carbomir
npm run build   # SSG 全ページ生成を確認
npm run dev     # Turbopack 開発サーバー (localhost:3000/carbomir)
npm test        # Vitest (mappers.ts 等の unit テスト)
npm run ai:draft -- --type=entity --topic="..."  # AI ドラフト生成
python3 scripts/sync-offsets-db.py               # CarbonPlan OffsetsDB 同期 (env 揃えば Supabase upsert)
```

## 既知の注意点
- `turbopack: { root: path.resolve(__dirname) }` は next.config.ts に必須 (ワークスペースルート誤認防止)
- shadcn add 時は `--overwrite -y` フラグを付ける
- `/admin/*` は現状認証なし。Phase 4 で middleware で塞ぐ
- ブラウザ console に出る `Encountered a script tag while rendering React component` は
  next-themes@0.4.6 が flash 防止用 inline script を `<script dangerouslySetInnerHTML>` で
  inject していることに対する React 19 の警告。`suppressHydrationWarning: true` も
  付いているが React 側がチェックを強化したため出る。実害なし、ライブラリ側対応待ち。

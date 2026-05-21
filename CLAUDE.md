@AGENTS.md

# Carbomir — プロジェクト指示書 (株式会社クレイドルトゥー)

## プロジェクト概要

カーボンクレジット領域の有料ナレッジベース。`carboncredits.jp/carbomir` サブディレクトリで稼働。

- **会社**: 株式会社クレイドルトゥー (CradleTo, Inc.)
- **問い合わせ先**: https://carboncredits.jp/contact
- **運用ドメイン**: carboncredits.jp (WordPress) / `/carbomir` がこの Next.js アプリ

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

---

## ディレクトリ構成

```
src/
  app/
    layout.tsx          # ThemeProvider > TooltipProvider > CommandMenuProvider > AppShell
    page.tsx            # ダッシュボードホーム
    globals.css         # ブランドカラー + shadcn 変数
    entities/
      page.tsx          # 概念体系インデックス (Server Component)
      [slug]/page.tsx   # エンティティ詳細 (Server Component)
    matrices/
      page.tsx          # 比較行列インデックス (Server Component)
      [slug]/page.tsx   # 比較行列詳細 (Server Component)
  components/
    app-shell.tsx       # Sidebar + TopBar + Footer ラッパー
    app-sidebar.tsx     # 常時ダーク左サイドバー
    app-topbar.tsx      # sticky ヘッダー + パンくず + ⌘K
    command-menu.tsx    # Cmd+K グローバル検索 (Client Component)
    entities/
      entities-explorer.tsx   # タブ + List/Grid ビュー (Client)
      entity-toc.tsx          # スクロールスパイ TOC (Client)
    matrices/
      matrix-data-grid.tsx    # DataGrid + 軸フィルタ (Client)
  lib/
    types.ts            # Entity, ComparisonMatrix 等の型定義
    data/
      entities.ts       # シードデータ (3エンティティ)
      comparisons.ts    # シードデータ (1比較行列)
    supabase.ts         # Supabase クライアント (env 未設定時 null)
supabase/
  migrations/
    0001_initial_schema.sql
```

---

## デザイン原則

- **カラーパレット**: 深ネイビー (#0c2545) + シアン青 (#0ea5e9) + ダークBG (#050a14)
  - 「井戸」「深さ」「専門性」のイメージ
- **トーン**: SaaS ダッシュボード型。メディア感を排除し、システム感を優先
- **タイポ**: モノスペース (label-mono, metric-number) を多用してデータ感を演出
- **サイドバー**: 常時ダーク (`bg-sidebar: #0a1628`)

### 表示禁止事項
- `L2-E`、`L5` 等の社内記号はコード内では使用可だが、**UI/アウトプットに表示してはならない**

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

### Phase 1A ✅ 完了
- [x] プロジェクト初期化 (Next.js 16 + shadcn/ui + Tailwind v4)
- [x] App Shell (Sidebar + TopBar + Footer)
- [x] ブランドカラー適用
- [x] 比較行列インデックス + 詳細ページ
- [x] 概念体系インデックス + 詳細ページ (3カラムレイアウト + TOC)
- [x] ダッシュボードホーム (メトリクスカード + Recent Updates)

### Phase 1B ✅ 完了
- [x] Cmd+K Command Palette (グローバル検索)
- [x] MatrixDataGrid (軸フィルタ + 軸可視性 DropdownMenu + sticky 列)
- [x] EntitiesExplorer (タブ絞り込み + List/Grid ビュー切替)
- [x] EntityToc (IntersectionObserver スクロールスパイ)

### Phase 2 (未着手)
- [ ] Supabase 接続実装
- [ ] 認証フロー (Supabase Auth + Google OAuth)
- [ ] 課金フロー (Stripe Free/Standard/Pro)
- [ ] ペイウォール (RLS)
- [ ] AI 生成パイプライン (手動トリガー)
- [ ] 編集レビュー UI (`/admin/review`)
- [ ] 旧 `intelligence.carboncredits.jp` からの 301 リダイレクト
- [ ] WordPress リバースプロキシ設定

---

## ビルド確認コマンド

```bash
cd ~/carbomir
npm run build   # SSG 10ページ生成を確認
npm run dev     # Turbopack 開発サーバー (localhost:3000/carbomir)
```

## 既知の注意点
- `turbopack: { root: path.resolve(__dirname) }` は next.config.ts に必須 (ワークスペースルート誤認防止)
- shadcn add 時は `--overwrite -y` フラグを付ける

# Carbomir — 引き継ぎドキュメント

作成日: 2026-05-21  
引き継ぎ元: チームアカウント Claude Code  
引き継ぎ先: 個人アカウント Claude Code

---

## 現在のビルド状態

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /entities
├ ● /entities/[slug]
│ ├ /entities/jcredit
│ ├ /entities/jcm
│ └ /entities/verra-vcs
├ ○ /matrices
└ ● /matrices/[slug]
  └ /matrices/jcredit-jcm-verra
```

`npm run build` が正常終了していることを確認済み。

---

## 重要な設計判断の履歴

### 1. カラー・デザイン方針
- **採用**: 深ネイビー (#0c2545) + シアン青 (#0ea5e9) のデュアルトーン
- **理由**: 「井戸の深さ」「専門性」のイメージ。テック系 SaaS らしさを優先
- **変更禁止**: メディア感・ブログ感に戻さない

### 2. 社内記号の表示禁止
- `L2-E`、`L5` 等はデータ構造の内部キーとして使用するが、UI には一切表示しない
- エンドユーザーに見せるのは `name_ja`、`name_en` のみ

### 3. shadcn/ui + Tailwind v4 共存
- shadcn のセマンティック変数 (`--primary`, `--accent`, `--border` 等) にブランドカラーをマッピング
- `@custom-variant dark (&:is(.dark *))` でクラスベースdark対応 (next-themes との整合性)
- `@theme inline` を使用 (Tailwind v4 の仕様)

### 4. App Shell アーキテクチャ
- layout.tsx → ThemeProvider → TooltipProvider → CommandMenuProvider → AppShell の順でネスト
- AppShell 内: AppSidebar (常時ダーク) + AppTopBar (sticky blur) + main + AppFooter
- サイドバーは常時ダーク (`--sidebar: #0a1628`) でライト/ダークモードに関係なく維持

### 5. Server/Client 境界の分割方針
- メタデータ export、データフェッチ → Server Components
- 状態管理 (フィルタ、ビュー切替、スクロールスパイ、Command Palette) → Client Components
- 命名規則: `*-explorer.tsx`, `*-data-grid.tsx`, `*-toc.tsx` はすべて Client

### 6. Next.js 16 の async params
- `params: Promise<{ slug: string }>` + `await params` が必須
- `generateStaticParams` で全エンティティ・行列を SSG

### 7. Supabase 接続
- 現時点ではシードデータのみ (`src/lib/data/entities.ts`, `src/lib/data/comparisons.ts`)
- `src/lib/supabase.ts` が env 未設定時に `null` を返す設計 (フォールバック済み)
- Phase 2 で本番 Supabase に切り替える

---

## セキュリティ制約 (変更不可)

- API キー・シークレットは環境変数で管理。コードへの直書き厳禁
- Supabase RLS を活用してプラン別アクセス制御
- ユーザー入力は必ず Zod 等でバリデーション
- WordPress からの Webhook は署名検証を必須化

---

## 個人アカウントでのセットアップ手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/<username>/carbomir.git
cd carbomir

# 2. 依存パッケージインストール
npm install

# 3. 環境変数ファイルを作成 (値は別途共有)
cp .env.example .env.local
# .env.local を編集して各値を設定

# 4. 開発サーバー起動
npm run dev
# → http://localhost:3000/carbomir
```

---

## 次に着手すべきタスク (優先順)

1. **Supabase 接続**: `src/lib/supabase.ts` の `createClient` を有効化し、`src/lib/data/` をクエリ実装に置き換え
2. **認証フロー**: Supabase Auth + Google OAuth + middleware でルート保護
3. **課金フロー**: Stripe で Free/Standard/Pro プラン管理
4. **ペイウォール**: RLS + プラン判定で行列・エンティティのアクセス制御
5. **コンテンツ拡充**: エンティティ・比較行列のシードデータ追加 (管理 UI は後回しでも手動 YAML で可)

---

## ファイル変更禁止リスト

| ファイル | 理由 |
|----------|------|
| `AGENTS.md` | Next.js 16 の破壊的変更警告 (自動生成) |
| `next.config.ts` の `basePath: "/carbomir"` | 本番 URL 構造に影響 |
| `src/app/globals.css` のカラー変数 | ブランド統一 |

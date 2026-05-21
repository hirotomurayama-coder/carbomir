# Carbomir

> Carbomir by Carbon Credits.jp — カーボンクレジット領域の体系的ナレッジベース

株式会社クレイドルトゥーが運営する Carbomir の Web アプリケーション。
`carboncredits.jp/carbomir` 配下のサブディレクトリで運用される (basePath: `/carbomir`)。

開発指示の正本は `/Users/lott/Downloads/20260521_Carbomir_CLAUDE_CradleTo様.md` (本リポジトリ外で管理)。

## 技術スタック

- Next.js 16.2 (App Router, Turbopack)
- React 19.2
- TypeScript 5
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth)
- Stripe (予定)
- Anthropic Claude API (予定)

## セットアップ

```bash
cd ~/carbomir
npm install
cp .env.example .env.local
# .env.local を編集して Supabase 接続情報を設定
npm run dev
```

開発サーバーは http://localhost:3000/carbomir で起動する (basePath 設定済み)。

## Supabase 未接続でも動作する

`.env.local` を設定しない状態でも、`src/lib/data/comparisons.ts` のローカルシードデータで
L2-E 比較行列ビューが動作する。Supabase 接続は後続マイルストーンで実装。

## ディレクトリ構成

```
src/
  app/
    layout.tsx           ルートレイアウト (ヘッダー・フッター)
    page.tsx             トップ
    matrices/            L2-E 比較行列ビュー
      page.tsx           一覧
      [slug]/page.tsx    詳細
  lib/
    types.ts             共通型
    supabase.ts          Supabase クライアント (env 未設定時は null)
    data/
      comparisons.ts     ローカルシードデータ
supabase/
  migrations/
    0001_initial_schema.sql  KB コアスキーマ
```

## ロードマップ (S層 = v1 必須)

- [x] プロジェクト初期化 (Next.js + Tailwind + TypeScript)
- [x] データモデル定義 (Supabase マイグレーション)
- [x] L2-E 比較行列ビュー (一覧 + 詳細)
- [x] サブディレクトリルーティング (basePath)
- [ ] Supabase 接続実装 (現在はローカルシードのみ)
- [ ] L2-A エンティティ詳細ページ
- [ ] 認証フロー (Supabase Auth + Google OAuth)
- [ ] 課金フロー (Stripe Free/Standard/Pro)
- [ ] ペイウォール (RLS)
- [ ] AI 生成パイプライン (手動トリガー)
- [ ] 編集レビューインターフェース (/admin/review)
- [ ] 旧 intelligence.carboncredits.jp からの 301 リダイレクト
- [ ] WordPress 側リバースプロキシ設定

## 開発判断原則 (CLAUDE.md §15 抜粋)

1. 「この機能はL2の充足度・更新頻度・アクセス容易性にどう貢献するか」を常に問う
2. L2-E を最優先で磨く (主力商品)
3. 「単発記事」ではなく「体系へのアクセス」を売る
4. AI 生成 + 人間レビュー体制をスケーラブルに保つ
5. L5 はコンサル導線、判断軸そのものは出さない

## ライセンス

Proprietary. © 株式会社クレイドルトゥー (CradleTo, Inc.)

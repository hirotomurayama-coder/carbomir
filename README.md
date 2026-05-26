# Carbomir

> カーボンクレジット領域の体系的ナレッジベース。
> `carboncredits.jp/carbomir` 配下のサブディレクトリで運用 (basePath: `/carbomir`)。

運営: 株式会社クレイドルトゥー (CradleTo, Inc.)

---

## プロジェクト指示書 (新しく入った開発者はまずここ)

- [`CLAUDE.md`](./CLAUDE.md) — プロダクト方針・タクソノミー・Phase 進行状況・技術スタック (最上位)
- [`AGENTS.md`](./AGENTS.md) — Next.js 16 が従来版と非互換である旨の警告
- [`STYLE_GUIDE.md`](./STYLE_GUIDE.md) — 編集トーン・確信度・出典・用語規範

`CLAUDE.md` の「プロダクト方針」と「アセットタクソノミー」が実装判断の根拠なので、
新規ページや UI を触る前に必ず読むこと。

---

## 技術スタック

- Next.js 16.2 (App Router, Turbopack)
- React 19.2 / TypeScript 5
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS) — **未接続でも seed fallback で動作**
- Anthropic Claude API (AI ドラフト生成 CLI)
- Vitest (unit テスト) / Leaflet (世界マップ) / cmdk (Cmd+K)

詳細バージョンは [`CLAUDE.md`](./CLAUDE.md#技術スタック) 参照。

---

## セットアップ

Node 20.9+ が必要 (LTS 推奨)。`.nvmrc` に `22` を固定済み。

```bash
git clone <repo-url> carbomir
cd carbomir
nvm use            # .nvmrc の Node を有効化 (nvm 利用者)
npm install
cp .env.example .env.local   # 任意。未設定でも seed で起動する
npm run dev
```

開発サーバー: <http://localhost:3000/carbomir>

### Supabase / API キーなしで動くか

動く。`src/lib/data/` 配下の TypeScript seed が Supabase クライアント未設定時の fallback として使われる。
ローカル UI 確認だけなら `.env.local` は空のままで OK。

シークレット (Supabase service role key / ANTHROPIC_API_KEY 等) が必要になったら、
チーム内の秘密共有ツール経由で受け取って `.env.local` に設定する。**コード直書き厳禁**。

---

## よく使うコマンド

```bash
npm run dev               # Turbopack 開発サーバー
npm run build             # 本番ビルド (SSG 全ページ生成確認)
npm test                  # Vitest 一回実行
npm run test:watch        # Vitest watch
npm run lint              # ESLint
npm run ai:draft -- --type=entity --topic="..."   # AI ドラフト生成 (要 ANTHROPIC_API_KEY)
python3 scripts/sync-offsets-db.py                # CarbonPlan OffsetsDB 同期
```

---

## ディレクトリ構成 (概要)

```
src/
  app/
    page.tsx              ダッシュボードホーム
    entities/             概念体系 (調べる)
    matrices/             比較行列 (比べる)
    timeline/             時系列 (追う)
    case-studies/, faq/   ケース・FAQ (学ぶ)
    players/, policies/   プレイヤー・政策 (調べる)
    atlas/                世界マップ (Survey)
      instruments/        価格制度
      mechanisms/         クレジット機構
      cooperative/        二国間協定
      offsets-db/         OffsetsDB (server-side filter/sort/page)
    graph/                関係グラフ
    editorial/            編集ステータスダッシュボード
    admin/drafts/         AI ドラフトレビュー (内部)
  components/             UI コンポーネント
  lib/
    types.ts              全型定義
    supabase.ts           Supabase クライアント (未接続時は null)
    data/                 TypeScript seed (Supabase fallback)
supabase/
  migrations/             累積 8 マイグレーション
scripts/
  ai-draft.ts             AI ドラフト生成 CLI
  sync-offsets-db.py      CarbonPlan OffsetsDB 同期
```

ファイル構成の解説は [`CLAUDE.md`](./CLAUDE.md#ディレクトリ構成-現状) に詳細あり。

---

## Phase 進行状況

[`CLAUDE.md`](./CLAUDE.md#phase-完了状況) で管理。

直近完了:
- Phase 5-A: 世界マップビジュアル改修 (Leaflet + ネットワーク図 + チャート)
- Phase 5-B: OffsetsDB 個別ページ + server-side filter/sort/pagination

現在地: Phase Α (アライメント永続化) — `STYLE_GUIDE.md` への AI プロンプト反映が残り

---

## 開発ルール (抜粋)

詳細は [`CLAUDE.md`](./CLAUDE.md) と [`STYLE_GUIDE.md`](./STYLE_GUIDE.md) を読むこと。

- **Next.js 16 の `params` は Promise**: `const { slug } = await params;` 必須
- **UI 表示禁止**: `L2-E` 等の社内記号、本文中の「要確認 (...)」マーク
- **編集論点セクション名**: 「**編集部の論点**」で統一
- **確信度**: 強 / 中 / 弱 の 3 段階
- **出典**: 本文インライン + 末尾集約のハイブリッド

---

## 既知の注意点

- ブラウザ console の `Encountered a script tag while rendering React component` は
  next-themes が flash 防止用 inline script を inject していることに対する React 19 警告。
  実害なし、ライブラリ側対応待ち。
- `/admin/*` は現状認証なし。Phase 4 で middleware で塞ぐ予定。
- `turbopack: { root: path.resolve(__dirname) }` は `next.config.ts` に必須
  (ワークスペースルート誤認防止)。

---

## ライセンス

Proprietary. © 株式会社クレイドルトゥー (CradleTo, Inc.)

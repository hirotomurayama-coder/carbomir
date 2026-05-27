# 2026-05-26 ハンドオフ — ビジュアル刷新セッション (Atlas / Matrices / Timeline)

> ⚠️ 注: このハンドオフは前セッションがコンテキスト上限で終了したため、コードベース (git log / commits / 変更ファイル) から事実を再構築して作成したもの。会話ログは失われている。推測箇所には [要確認] タグ付き。

## セッション概要

- **日付**: 2026-05-26
- **対象機能**: 既存ページの「見た目」と「navigation 体験」の抜本ブラッシュアップ
  - `/timeline` — stagger アルゴリズム改善
  - `/entities` (用語集) — player 除外 + sticky filter
  - 全 explorer 系ページ — sticky filter
  - `/matrices` ホームページ — シナリオ駆動ナビへ再構築
  - `/atlas` (世界マップ) ホーム — チャート群でデータ俯瞰可能化
  - `/atlas/instruments` / `/mechanisms` / `/cooperative` / `/offsets-db` — ビジュアル追加
  - 世界地図を SVG 自作 → Leaflet + OpenStreetMap タイルに置換
- **開始時の目的** [要確認]: 既存ページの情報密度・解釈性を上げ、「単に並べる」から「シナリオで navigate / データで俯瞰する」体験へ脱却
- **コミット系統**: 「Fix A/B/C」「Fix-D」「Fix-E」「Fix-F」「Fix-G」のシリーズ。最後の Fix-G で SVG マップを Leaflet に置換し完了

---

## 完了した作業

### コミット (古→新)

| ハッシュ | 件名 | 主な変更 |
|---|---|---|
| `6f49cb6` | Fix A/B/C: timeline stagger 修正 + 用語集から player 除外 + sticky filter | timeline-bars.tsx 衝突回避型 stagger、`/entities` から player 除外 (79→60 用語)、ExplorerToolbar に sticky prop |
| `29be0c2` | Fix-D: /matrices ホームページの抜本デザイン見直し | MatricesGallery 新規 (440 行)、5 シナリオカード + リッチカードギャラリー |
| `f79e964` | Fix-E: 世界マップ (/atlas) の抜本ビジュアルブラッシュアップ | atlas-charts.tsx 新規 (Donut/HBar/StackedStatus)、/atlas ホーム再構築 |
| `5f538e7` | Fix-F: 世界地図 + ネットワーク図 + OffsetsDB ビジュアル | WorldBubbleMap (SVG)、CooperativeNetwork (Sankey-light)、country-geo.ts (80+ 国) |
| `5cd7712` | Fix-G: Leaflet + OpenStreetMap で世界地図を本物のタイル地図に置換 | WorldMapLeaflet で WorldBubbleMap を差替、3 ページが新コンポーネントを使用 |

### 新規 / 変更ファイル (HEAD~5..HEAD)

**新規追加**
- [src/components/atlas/atlas-charts.tsx](src/components/atlas/atlas-charts.tsx) — Donut / HorizontalBar / StackedStatusBar (SVG inline、ライブラリ非依存)
- [src/components/atlas/world-bubble-map.tsx](src/components/atlas/world-bubble-map.tsx) — SVG equirectangular bubble map (Fix-G で表 UI からは外れたが残置)
- [src/components/atlas/world-map-leaflet.tsx](src/components/atlas/world-map-leaflet.tsx) — Leaflet + CartoDB タイル (light / dark テーマ追随)。`WorldBubbleMap` と API 互換
- [src/components/atlas/cooperative-network.tsx](src/components/atlas/cooperative-network.tsx) — Article 6.2 二国間協定の Sankey-light (Buyer ↔ Seller)
- [src/lib/data/country-geo.ts](src/lib/data/country-geo.ts) — ISO3 → { lat, lng, name_ja } 80+ 国 + jurisdiction → ISO3 マッピング
- [src/components/matrices/matrices-gallery.tsx](src/components/matrices/matrices-gallery.tsx) — シナリオ hero + カテゴリ別リッチカードギャラリー

**変更**
- [src/components/timeline/timeline-bars.tsx](src/components/timeline/timeline-bars.tsx) — 衝突回避型 stagger に書き換え (LANE_HEIGHT 96→120、canvas min-width 720→1280、LABEL_MAX_CHARS=22, LABEL_CHAR_PX=7, LABEL_PADDING_PX=28)
- [src/components/explorer/explorer-toolbar.tsx](src/components/explorer/explorer-toolbar.tsx) — `sticky` prop 追加 (top-[52px]、bg-background/95 + backdrop-blur)
- [src/components/entities/entities-explorer.tsx](src/components/entities/entities-explorer.tsx) / [matrices-explorer.tsx](src/components/matrices/matrices-explorer.tsx) / [players-explorer.tsx](src/components/players/players-explorer.tsx) / [policies-explorer.tsx](src/components/policies/policies-explorer.tsx) — sticky prop を適用
- [src/app/entities/page.tsx](src/app/entities/page.tsx) — player type を除外する filter + /players への導線
- [src/app/matrices/page.tsx](src/app/matrices/page.tsx) — MatricesGallery を採用
- [src/app/atlas/page.tsx](src/app/atlas/page.tsx) — 4 大メトリクス + チャート 3 列 + 4 dataset card に再構築
- [src/app/atlas/instruments/page.tsx](src/app/atlas/instruments/page.tsx) / [mechanisms/page.tsx](src/app/atlas/mechanisms/page.tsx) / [offsets-db/page.tsx](src/app/atlas/offsets-db/page.tsx) — WorldMapLeaflet を埋め込み
- [src/app/atlas/cooperative/page.tsx](src/app/atlas/cooperative/page.tsx) — CooperativeNetwork を埋め込み
- [src/app/globals.css](src/app/globals.css) — `@import "leaflet/dist/leaflet.css"` + ダークモード時の attribution/zoom controls/popup/tooltip 色調整
- [package.json](package.json) — `leaflet@^1.9.4` + `@types/leaflet@^1.9.21` を依存追加

### テスト
- 既存 Vitest スイート (`npm test`) が通っているかは [要確認] (このシリーズではテスト関連の変更はなし)
- `npm run build` の現状ステータスも [要確認] (Fix-G 後の本番ビルド検証ログは残っていない)

---

## 決定事項と根拠

### 1. 世界地図は Leaflet + OpenStreetMap タイル (Fix-G)
- **採用**: `leaflet` + CartoDB Voyager (light) / Dark Matter (dark) タイル
- **代替案 (Fix-F で先に採用)**: SVG inline + equirectangular 投影 (`WorldBubbleMap`)
- **理由**: SVG 自作版では「地図感」が弱く、国境・地名が表示できない。ユーザー提案で Leaflet に置換
- **タイル選定理由**: CartoDB は API キー不要 / 商用利用可 / ライト+ダーク両方ある / OSM Attribution のみで OK
- **SSR 回避**: `"use client"` + useEffect で動的 import (Leaflet は window 必須)
- **scroll wheel zoom 無効化**: ページスクロール優先のため。+/- ボタンと dblclick でズーム
- **WorldBubbleMap は残置**: 将来の static export 用に再利用余地

### 2. SVG チャートはライブラリ非依存
- recharts / d3 等を入れずに inline SVG で実装
- 理由: Bundle 増を避ける + チャートが「Donut / HBar / Stacked」の 3 種類だけなので自作で十分

### 3. /matrices ホームをシナリオ駆動に
- **採用**: 5 シナリオ hero カード (すべて見る / 規制対応 / クレジット品質 / 市場戦略 / スタンダード) + カテゴリ別リッチカード
- **代替案**: 既存 MatricesExplorer (テーブル表示) のまま
- **理由**: 「単に並べる」を脱却。ユーザーの "問い" 起点 → 比較行列をフィルタする体験に
- **旧 MatricesExplorer は残置**: ページからは外れたが将来再利用可能

### 4. Timeline stagger を衝突回避型に
- **旧**: `i % STAGGER_TIERS` の機械的割当 → 同 tier で X 衝突発生
- **新**: 重要度降順で並べ、各 tier の右端 X% を追跡しながら最初に入る tier に貪欲配置
- どこにも入らない場合はバーのみ描画 (ラベル隠す)
- 定数: LANE_HEIGHT 120 / canvas min-width 1280 / LABEL_MAX_CHARS 22 / LABEL_CHAR_PX 7 / LABEL_PADDING_PX 28

### 5. 用語集 (/entities) から player を除外
- **理由**: 用語集の趣旨は「概念 / メソドロジー / 制度 / 技術」。企業・機関は `/players` で別管理する方が整合的
- 79 → 60 用語に絞った
- サブタイトルに /players への導線を追加

### 6. Cooperative ページは Sankey-light を採用
- **代替案**: 通常テーブル / chord ダイアグラム
- **採用**: 左 Buyer ↔ 右 Seller の二列 + SVG ベジエ曲線
- **理由**: Article 6.2 は「Buyer 数か国 ↔ Seller 数十か国」の構造。Sankey 風の集中度可視化が最適
- Buyer 別カラー / status 別 line opacity / hover 強調

---

## 未完の項目 / 次にやること

### 優先度: 高

1. **本番ビルド検証** [要確認] — `npm run build` を実行して SSG が全ページ通るか確認
   - 前提: leaflet が SSR されないことを動的 import で担保しているが、念のため build ログを目視
2. **Leaflet タイルの dark mode 切替動作確認** [要確認]
   - 前提: `useTheme().resolvedTheme` が変化したとき、`tileLayerRef` を作り直す実装になっているか目視確認
   - 該当箇所: [src/components/atlas/world-map-leaflet.tsx](src/components/atlas/world-map-leaflet.tsx)
3. **CLAUDE.md の Phase 完了状況を更新** — Phase Β (タクソノミー実装) と Phase Γ (品質シグナル強化) で部分的に着手しているがチェックリストが未更新
   - サイドバー動詞型ラベル化、ホーム「追う」主役化、FreshnessIndicator 等の状態を確定させる

### 優先度: 中

4. **WorldBubbleMap (SVG 版) の削除判断** — Fix-G で表 UI からは外れた。残置するか削除するか決定
   - 削除する場合: `src/components/atlas/world-bubble-map.tsx` + 未使用 import を消す
5. **`country-geo.ts` の網羅率確認** — 80+ 国だが、jurisdiction → ISO3 マッピングで漏れがあると bubble が表示されない国が出る。/atlas/instruments で missing iso3 が出るかチェック
6. **timeline-bars の labelOverflow ケース** — 衝突で隠した label が再表示されないと UX が悪い。hover で full label を popup 表示する案 [要確認: 既に実装されているか確認]

### 優先度: 低

7. **MatricesExplorer (旧) の削除判断** — 残置されているが新 MatricesGallery が正式採用
8. **scrollwheel zoom 無効化の UX 確認** — Leaflet の dblclick ズームが直感的か、ユーザー検証必要

---

## ハマったポイント・既知の問題

### 1. Leaflet は SSR 不可
- `window` を直接参照するため、`import "leaflet"` を server component で行うとビルドが落ちる
- 対処: `"use client"` + useEffect 内で動的 import (`const L = await import("leaflet")` パターン)
- 確認: [src/components/atlas/world-map-leaflet.tsx:1](src/components/atlas/world-map-leaflet.tsx#L1)

### 2. leaflet.css の読み込み場所
- コンポーネント内で import すると Next.js が文句を言うことがある
- 対処: `src/app/globals.css` の冒頭で `@import "leaflet/dist/leaflet.css";` する形に統一

### 3. CartoDB タイル attribution は外さない
- 商用利用は無料だが attribution 表示が条件
- ダークモードで文字が見えにくいので globals.css で色調整済み

### 4. timeline stagger の canvas min-width
- min-width 1280 にしたため、狭い viewport で横スクロールが必須になっている
- レスポンシブ対応の余地あり [要確認: モバイル動作]

### 5. matrices-gallery の category キー
- `m.category ?? "その他"` でフォールバックしているが、データ側で category 未設定の行列がある場合は「その他」カテゴリが目立つ
- [src/components/matrices/matrices-gallery.tsx:144](src/components/matrices/matrices-gallery.tsx#L144)

---

## 次のセッション開始時の指示

### 最初に読むファイル (この順)
1. `CLAUDE.md` — プロダクト方針 (アライメント結果)、Phase 完了状況
2. `docs/handoffs/20260526_visual_polish_atlas_matrices_timeline.md` (このファイル)
3. `src/components/atlas/world-map-leaflet.tsx` — 最新の世界地図実装
4. `src/components/matrices/matrices-gallery.tsx` — 最新の matrices ホーム
5. `src/components/timeline/timeline-bars.tsx` — stagger 実装

### 最初に実行するコマンド

```bash
cd ~/carbomir
git log --oneline -10
npm run build   # Fix-G 後の本番ビルド検証 (未確認)
npm run dev     # localhost:3000/carbomir で目視確認
```

### 確認すべき URL (dev server 起動後)
- http://localhost:3000/carbomir/atlas — チャート 3 列 + 4 dataset card
- http://localhost:3000/carbomir/atlas/instruments — Leaflet マップ + テーブル
- http://localhost:3000/carbomir/atlas/mechanisms — Leaflet マップ
- http://localhost:3000/carbomir/atlas/cooperative — Sankey-light
- http://localhost:3000/carbomir/atlas/offsets-db — Leaflet + 2 donut
- http://localhost:3000/carbomir/matrices — シナリオ hero + ギャラリー
- http://localhost:3000/carbomir/timeline — 新 stagger
- http://localhost:3000/carbomir/entities — player 除外 + sticky filter

### 次セッションでまず判断すべきこと
1. 本セッションの作業範囲を「完了」と判定し、Phase Β / Γ の残タスクに進むか
2. それとも本セッションの「未完項目」(WorldBubbleMap 削除判断 / モバイル対応 / dark mode 動作確認) を先に片付けるか
3. CLAUDE.md の Phase 完了状況の更新は誰がいつやるか [要確認]

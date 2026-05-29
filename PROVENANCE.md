# Carbomir 出自アーキテクチャ（Provenance Architecture）

> **位置づけ**: コンテンツの「出どころ（出自）」を定義する根本設計レイヤー。`CLAUDE.md`（プロダクト方針）・`STRATEGY.md`（価値・課金・進化の上位仮説）の下で、**どのコンテンツがどこを正準（source of record）とし、どう流れ、どう腐りを検知するか** を規定する。
>
> **ステータス**: 2026-05-29 設計合意済み・**未実装**（コードはまだ書いていない）。これは実装の指針であり、検証で更新する作業仮説。
>
> **背景**: 現状、世界マップは Excel + 外部 API、それ以外の文章コンテンツは主に AI 調査起点で、公開後は AI 出自の痕跡が消えていた。一方で同社は編集メディア `carboncredits.jp` を運営している。STRATEGY §2（堀＝編集アカウンタビリティ。AI の推測は引用できない）に照らすと、**心臓部の文章が AI 起点なのは堀の弱点**。本設計は出自を媒体起点に寄せ、堀を本当にする。

---

## 1. 原則：出自の単位は「section」（レコードでなく）

1 つの entity / case-study / matrix レコードは**複数の出自を綴じ合わせた合成物**である。

```
entity: gx-ets ページ
├─ 定義・概要・本文            origin: "media"  … carboncredits.jp が正準
├─ 構造化属性(政策ステータス/関係/タグ/価格水準)  origin: "tool"  … ツール固有
└─ 「編集部の論点」            origin: "tool"   … ツール固有・判断資産
```

→ provenance は **section / dimension 単位**で持つ。既存スキーマは entity・case-study・matrix が**すでに section / dimension 単位で `paywall_tier` を持つ**ため、provenance も同じ粒度に自然に乗る。

---

## 2. レーン分担（どちらが正準か）

| レーン | 含む | 正準 | 性質 |
|---|---|---|---|
| **媒体レーン** | 用語解説・概念の散文（調べる / 学ぶの本文） | **carboncredits.jp** | 無料・SEO 集客。コモディティでよい部分 |
| **ツールレーン** | 比較行列・時系列・世界マップ・**「編集部の論点」**・構造化属性 | **Carbomir** | 判断資産。STRATEGY §2 の堀。Standard 課金 |

- 重複領域（用語の散文）は **媒体が正準**。Carbomir は参照する。
- ツール固有資産は媒体に対応物が無いため、**Carbomir が正準**。
- **捨てた選択肢**：媒体を全面正準にしてツールを派生ビューにする案（行列/時系列/論点まで媒体側に持たせる必要が出る）／ツールを正準にして媒体を送客リンクに留める案（AI 起点コンテンツの引用しにくさ＝§2 リスクを抱えたまま）。

---

## 3. materialization：参照＋抜粋

媒体→ツールへ**物理的に流すのは本文ではない**。

- ツールが持つもの：`canonical_url` ＋ **短い抜粋（ツール編集の 1-2 行）** ＋ 自前の構造化フィールド ＋ 「編集部の論点」。
- **本文フルは媒体に残す**（ツールには取り込まない）。
- 結果、媒体への硬いデータ依存は **`{slug, lastmod}` だけ**に縮む。
- **捨てた選択肢**：(a) 全文ミラー＝本文 markdown をツールにキャッシュ（同期の鮮度結合・本文二重管理・SEO の canonical 重複を招く）。(b) 構造化サマリ抽出（散文の読み物価値を捨て、抽出工数が増える）。

---

## 4. AI ゲート：「場所」でなく「ゲート」

> **どのレーンにも人間が責任を負う編集ゲートがある。AI 起点のものは必ずゲートを通る。レーンが決めるのは「正準レコードがどこに住むか」と「どのゲートを通るか」。**

| レーン | AI の役割 | 通すゲート | 公開先 |
|---|---|---|---|
| 媒体（散文・用語） | WP 記事の下書き | **媒体の編集プロセス** | carboncredits.jp（正準）→ ツールが参照 |
| ツール（論点・行列・時系列） | 論点 / セルの下書き | **`/admin/drafts` レビュー**（既存） | Carbomir（正準）。出自と確信度を明示 |

- 「AI をツールへ直接公開しない」の本質は**場所の禁止でなくゲートの強制**。「編集部の論点」はツール固有の判断資産であり AI 下書きを使うが、必ず `/admin/drafts` の人手ゲートを通る。
- `scripts/ai-draft.ts` の `--type` 分岐は将来、散文系トピックを媒体下書きへ、論点/行列系をツールゲートへ振り分ける（実装は別途）。

---

## 5. provenance データモデル

公開レコードの section / dimension に出自フィールドを持たせ、「媒体編集部が責任を持つ散文」と「ツール編集部の判断」を引用時に区別可能にする（STRATEGY §2 が本当になる）。

| フィールド | 意味 | 付与対象 |
|---|---|---|
| `origin` | `"media" \| "tool" \| "ai_assisted"` | section / dimension 単位 |
| `canonical_url` | 媒体記事の正準 URL（`/glossary/{slug}/`） | media レーンのみ |
| `source_ref` | WP 側 slug（同期キー） | media レーンのみ |
| `synced_at` | 最終照合時刻 | media レーンのみ |

既存の `source_urls[]` / `last_reviewed_at` / `next_review_at` / `paywall_tier` と併存。

---

## 6. 取り込み経路：経路 A（wp-sitemap pull）で確定

### 事実確認（2026-05-29）
- `carboncredits.jp` は **AI クローラー（ClaudeBot / GPTBot 等）を robots.txt で明示 Disallow**、本文・REST・feed は 403。これは認証壁でなく **同社が設定した bot ポリシー**。
- robots.txt が指す正準サイトマップ＝ `https://carboncredits.jp/wp-sitemap.xml`（WP コア標準）。
- 子サイトマップに **`wp-sitemap-posts-glossary-1.xml`** が存在。post type の実体は **`glossary`**（`glossary_article` ではない）。
- **サイトマップに `<lastmod>`（ISO8601）が入っている** → マッピングも鮮度も**サイトマップ 1 本で両取り可能**。

### 確定設計
```
[毎日 cron / build-time]  Carbomir 同期ジョブ
        │  許可済み UA or トークン（WAF で 1 エントリ許可）
        ▼
  GET wp-sitemap-posts-glossary-1.xml      ← 唯一の硬い依存
        │  → { wp_slug, lastmod } の全集合
        ▼
  照合（§7）→ materialize（JSON）
```
- 本文は引かない（§3）。WP には一切手を入れない。
- **捨てた経路**：B＝WP push（更新時 webhook。lastmod がサイトマップに無ければ採用していたが不要に）／C＝認証 REST（双方向に強いが認証情報管理が増える）。lastmod が取れる以上、**最小依存の A が最適**。

### 設計判断の根拠：bot ポリシーは回避しない
同期は「許可済み・認証付き・監査可能な一次連携チャネル」として設計する。UA 偽装等で自社の bot ポリシーを回避しない（筋が悪く、野良クローラーに見える状態は脆い）。

---

## 7. 照合（reconcile）と backbone

現行 `src/lib/data/glossary-links.ts`（flat な `slug → wp_slug` マップ、base＝`/glossary_article`）を、**毎日検証・照合される backbone** へ升格する。

```jsonc
// data/content/glossary-map.json（升格形）
{
  "verra-vcs": {                                  // Carbomir entity slug
    "wp_slug": "verra",                           // WP 側 slug
    "canonical_url": "https://carboncredits.jp/glossary/verra/",
    "excerpt": "…ツール編集の 1-2 行…",            // origin: tool
    "media_lastmod": "2025-12-08T14:12:06+09:00", // sitemap 由来
    "synced_at": "2026-05-29T…",                  // 最終照合
    "review_state": "fresh"                       // fresh | drifted | dangling
  }
}
```

照合ロジック（sitemap の集合と backbone を突き合わせ）：

| 状態 | 条件 | アクション |
|---|---|---|
| **drift** | `media_lastmod > synced_at` | 「媒体が更新された」→ §8 鮮度へ |
| **dangling** | マップ先 wp_slug が sitemap に無い | 媒体側で削除/改名 → リンク切れ警告 |
| **orphan** | sitemap にあるが未マップ | 新規 entity 候補（STRATEGY §6 land-and-expand） |

→ 手保守の forward-ref が**検証される backbone** になり、知識グラフ整合性（叩き台論点 #2）に直結。orphan / dangling / drift の 3 リストは `/editorial` に表示。

---

## 8. 鮮度の統一

媒体の `lastmod` を鮮度シグナルの新しい源として、`next_review_at` / 価格 `as_of` / `durability_risk` / watchlist 変化と**一つの規律に束ねる**（叩き台論点 #4）。「媒体が更新された」も「腐っていないか」の一判定として `/editorial` に集約。

---

## 9. 課金設計との一致

「何を paywall するか」＝「何がツール正準か」が**同一線**になる（偶然でなく、戦略的に同じものの別角度）。

- **媒体レーン（散文）**：WP 上で無料・SEO 集客。
- **ツールレーン（論点・構造・監視）**：Standard 限定。STRATEGY §2 の堀。

参照＋抜粋なので本文重複が無く、SEO の canonical 重複問題も起きない。

---

## 10. 既知の不一致と運用注意

- **glossary パス**：`/glossary_article/{slug}/` と `/glossary/{slug}/` は**両方 200**（既存 83 リンクは壊れていない）。ただし**正準は `/glossary/`**（サイトマップ採用形）。backbone は `/glossary/` に正規化する。現行 `glossary-links.ts` は `/glossary_article` を使用 → 升格時に揃える。
- **WAF 許可（UA vs IP）**：自宅回線の curl は通るが、WebFetch（DC IP + ClaudeBot UA）は全 403。**DC IP ブロックなら Vercel cron からの同期に WAF 許可（egress IP 許可 or 共有シークレットヘッダ）が必要**。デプロイ時の設定で、本設計の本筋は不変。

---

## 11. 意識的に捨てた前提

- 本文ミラー（全文取り込み）はしない（§3）。
- 媒体の全用語を機械的に網羅取り込みしない。**カバレッジは編集優先度に従う**（STRATEGY §6 / コンテンツ拡充の優先順位）。
- 自社 bot ポリシーを回避しない（§6）。
- 正確な実勢価格・流動性は取りに行かない（STRATEGY §8 を継承）。

---

## 改訂履歴
- **2026-05-29**: 初版作成（出自アーキテクチャ設計セッション結果）。レーン分担 / 参照＋抜粋 / 取り込み経路 A を確定。実装は未着手。

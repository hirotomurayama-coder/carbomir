/**
 * AI ドラフト生成 CLI.
 *
 * Usage:
 *   npm run ai:draft -- --type=entity --topic="Cercarbono の現状と差別化要因"
 *   npm run ai:draft -- --type=faq --topic="GX-ETS 移行期に Verra クレジットは適格か"
 *   npm run ai:draft -- --type=case_study --topic="Salesforce の Net Zero 戦略" --target-slug=salesforce-net-zero
 *
 * 出力先: data/ai-drafts/<id>.json (status=pending)
 * その後 /admin/drafts でレビューする
 */

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

// --------------------------------------------------------------------
// .env.local loader (Node 20+ の --env-file に頼らず自前で読む)
// --------------------------------------------------------------------
function loadDotEnv(file: string): void {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf-8").split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // 単/二重引用符を剥がす
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadDotEnv(path.join(process.cwd(), ".env.local"));

// --------------------------------------------------------------------
// CLI 引数 (--key=value 形式) のパース
// --------------------------------------------------------------------
type Args = {
  type?: string;
  topic?: string;
  "target-slug"?: string;
  model?: string;
};

function parseArgs(argv: string[]): Args {
  const out: Args = {};
  for (const arg of argv.slice(2)) {
    if (!arg.startsWith("--")) continue;
    const eq = arg.indexOf("=");
    if (eq < 0) {
      const key = arg.slice(2);
      (out as Record<string, string>)[key] = "true";
    } else {
      const key = arg.slice(2, eq);
      const value = arg.slice(eq + 1);
      (out as Record<string, string>)[key] = value;
    }
  }
  return out;
}

// --------------------------------------------------------------------
// プロンプトテンプレート (asset type 別)
// --------------------------------------------------------------------
const COMMON_RULES = `
あなたは Carbomir (株式会社クレイドルトゥー運営) のカーボンクレジット領域専門エディターです。
主読者: 事業会社の CSR / サスティナビリティ担当者。主用途: 規制変更キャッチアップと、取締役会・社内向け説明資料への転用。

[ 出力形式 ]
- JSON ONLY。コードフェンス (\`\`\`) 等を付けず、{ から始まり } で終わる単一 JSON オブジェクトを返す
- 内部社内記号 (L2-E 等) は使わない

[ 確信度 3 段階 (STYLE_GUIDE.md より) ]
事実 / 解釈 / 予測 を文末表現で明確に区別する。
- 強 (断定): 一次資料で確認できる事実、制度規定 → 「~ である」「~ する」「~ となる」「~ が定められている」
- 中 (解釈): 編集部の解釈・整理 → 「~ と考えられる」「~ と整理できる」「~ という見方が支配的」
- 弱 (予測): 未確定領域、未来予測 → 「~ の可能性がある」「~ も論点となり得る」「~ の方向で検討されている」

NG: 「~ という側面が強い」「~ という意味合い」「~ と言われている」のような曖昧表現は使わない。

[ 編集論点 = 主力差別化要素 ]
- 各セクションに必ず「編集部の論点」セクションを設ける (名称はこれで統一。「Carbomir の見方」「編集部の見解」等は使わない)
- 規制 / 制度の "何が変わるか / 誰が影響を受けるか / 日本企業への含意 / 未確定論点" を具体に
- 「重要だ」「注目される」「大きな意味を持つ」等の空疎な抽象表現は避ける。具体の数値・条件・影響先を書く

[ 出典 (ハイブリッド) ]
- 規制の発効日 / 価格 / 統計数字 / 企業の公式声明 は本文中にインライン引用: 例) "2026 年 4 月から ([経産省 GX 政策](https://...)) ..."
- 一般的な背景解説の出典は source_urls 配列で末尾集約
- 出典 URL は実在するもののみ。未確認の URL は書かない (捏造禁止)

[ 不確実情報の扱い ]
- 確証がない箇所は本文中で "(要確認: 理由)" と明記する (承認時に編集者が解消する)
- 構造的に不確実 (制度がまだ動いていない等) なら "(運用注視: 理由)" を使う (これは公開時にも残る)

[ 用語規範 ]
- Verra (VCS), GX-ETS (ハイフン保持), J-クレジット (ハイフン保持), JCM, SBTi, TCFD, CDP, ICVCM
- 西暦: 半角数字 + 半角スペース + "年" (例: "2026 年")
- 通貨: USD/t を基本 ("$50/t" や "ドル/t" は使わない)
- カタカナ語優先: メソドロジー / スタンダード / クレジット / レジストリ / プロジェクト / オフセット
- 「ボランタリー市場」「コンプライアンス市場」(「自主市場」「強制市場」は使わない)

[ 見出し階層 (Markdown body 内) ]
- "## " (H2) で開始、サブは "### " (H3)。H1 は使わない
- 強調は **太字** を構造化に使う
- 箇条書きを積極使用 (実務者は走査読みする)、ネストは 2 階層まで

[ 内部リンク ]
- 既存エンティティに言及するときは Markdown リンクで内部リンク化: 例) "[GX-ETS](/entities/gx-ets)"
- 関連エンティティは related_entity_slugs / related_matrix_slugs 配列でも宣言する

詳細規範: STYLE_GUIDE.md 参照
`.trim();

const SCHEMA_ENTITY = `
出力スキーマ (Entity):
{
  "slug": "kebab-case-id",
  "type": "methodology" | "regulation" | "player" | "market" | "technology" | "project",
  "name_ja": "日本語名",
  "name_en": "English Name (optional)",
  "abbreviation": "短縮名 (optional)",
  "summary": "1-2 文 (約 80-160 字) の要約",
  "sections": [
    { "heading": "見出し", "body": "Markdown 本文" }
  ],
  "tags": ["controlled-vocab タグの配列"],
  "related": [
    { "to": "slug-of-other", "relation": "parent_of" | "depends_on" | "supersedes" | "competes_with" | "equivalent_to", "note": "optional" }
  ],
  "related_matrix_slugs": ["matrix-slug"],
  "jurisdiction": "管轄 (optional, 制度の場合)",
  "established_year": 数値 (optional),
  "operator": "運営主体 (optional)",
  "geographic_scope": "地理スコープ (optional)",
  "website_url": "https://... (optional)",
  "credit_unit": "クレジット単位 (optional)",
  "parent_company": "親会社 (optional, player の場合)",
  "business_role": "業界での役割 (optional, player の場合)",
  "policy_status": "制度ステータス (optional, regulation の場合)",
  "next_milestone": "次のマイルストーン (optional, regulation の場合)",
  "status": "draft",
  "last_reviewed_at": "YYYY-MM-DD"
}

sections は 4-6 個程度。各 body は 200-500 字の Markdown。
`.trim();

const SCHEMA_FAQ = `
出力スキーマ (FAQ Item):
{
  "slug": "kebab-case-id",
  "question": "1 文の質問 (実務者目線で具体的に)",
  "short_answer": "1-2 文の要点回答",
  "detailed_md": "Markdown 詳細解説 (見出し含む 400-800 字)",
  "category": "procurement" | "reporting" | "regulation" | "quality",
  "related_entity_slugs": ["existing-entity-slugs"],
  "related_matrix_slugs": ["matrix-slug (optional)"],
  "source_urls": [
    { "label": "出典名", "url": "https://..." }
  ],
  "tags": ["controlled-vocab タグ"],
  "last_reviewed_at": "YYYY-MM-DD",
  "status": "draft"
}
`.trim();

const SCHEMA_CASE_STUDY = `
出力スキーマ (Case Study):
{
  "slug": "kebab-case-id",
  "title": "タイトル",
  "company": "企業名",
  "year": 2024,
  "region": "地域 (e.g. グローバル / 日本)",
  "category": "procurement" | "supply" | "reporting" | "compliance",
  "credit_type": "主に使うクレジット種別 (optional)",
  "scale_note": "規模感メモ (optional)",
  "summary": "2-3 文の要約",
  "sections": [
    { "heading": "見出し", "body": "Markdown 本文" }
  ],
  "related_entity_slugs": ["existing-entity-slugs"],
  "source_urls": [
    { "label": "出典名", "url": "https://..." }
  ],
  "tags": ["controlled-vocab タグ"],
  "last_reviewed_at": "YYYY-MM-DD",
  "status": "draft"
}

sections は 4-5 個程度。最後のセクションは「編集部の論点」とし、日本企業が参考にできる点を明示する。
`.trim();

function buildPrompt(
  type: "entity" | "faq" | "case_study",
  topic: string,
  targetSlug?: string
): { system: string; user: string } {
  const schema =
    type === "entity"
      ? SCHEMA_ENTITY
      : type === "faq"
        ? SCHEMA_FAQ
        : SCHEMA_CASE_STUDY;
  const today = new Date().toISOString().slice(0, 10);

  const updateHint = targetSlug
    ? `\n\nこれは既存の "${targetSlug}" を更新するドラフトです。同じ slug を使い、追加・差分情報を中心に書いてください。`
    : "";

  const system = `${COMMON_RULES}\n\n${schema}\n\n本日の日付: ${today}`;
  const user = `テーマ:\n${topic}${updateHint}\n\n上記スキーマに沿った JSON を返してください。`;
  return { system, user };
}

// --------------------------------------------------------------------
// JSON 抽出 (Claude が万一余計な前後文を吐いた場合に備えて)
// --------------------------------------------------------------------
function extractJson(text: string): string {
  // 最初の { から最後の } まで
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first < 0 || last < 0 || last < first) {
    throw new Error("JSON object not found in model output");
  }
  return text.slice(first, last + 1);
}

// --------------------------------------------------------------------
// メイン
// --------------------------------------------------------------------
function generateDraftId(): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${ts}-${rand}`;
}

async function main() {
  const args = parseArgs(process.argv);
  const type = args.type;
  const topic = args.topic;
  const targetSlug = args["target-slug"];
  const model = args.model ?? "claude-sonnet-4-5-20250929";

  if (!type || !topic) {
    console.error(
      [
        "Usage:",
        '  npm run ai:draft -- --type=entity --topic="..."',
        '  npm run ai:draft -- --type=faq --topic="..."',
        '  npm run ai:draft -- --type=case_study --topic="..." --target-slug=optional-slug',
        "",
        "Options:",
        '  --type         entity | faq | case_study (必須)',
        '  --topic        ドラフトのテーマ (必須)',
        '  --target-slug  既存更新の場合の対象 slug',
        '  --model        Claude モデル名 (default: claude-sonnet-4-5-20250929)',
      ].join("\n")
    );
    process.exit(1);
  }
  if (type !== "entity" && type !== "faq" && type !== "case_study") {
    console.error(`Invalid --type: ${type}`);
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY が未設定です。.env.local に追加してください。"
    );
    process.exit(1);
  }

  const { system, user } = buildPrompt(type, topic, targetSlug);

  console.log(`[ai-draft] type=${type} model=${model}`);
  console.log(`[ai-draft] topic=${topic}`);
  if (targetSlug) console.log(`[ai-draft] target_slug=${targetSlug}`);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  // テキストブロックを抽出
  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  let content: unknown;
  try {
    content = JSON.parse(extractJson(text));
  } catch (err) {
    console.error("[ai-draft] JSON parse 失敗:", err);
    console.error("[ai-draft] raw output:\n" + text);
    process.exit(2);
  }

  const id = generateDraftId();
  const draft = {
    id,
    type,
    topic,
    target_slug: targetSlug,
    prompt: `[SYSTEM]\n${system}\n\n[USER]\n${user}`,
    model,
    content,
    status: "pending" as const,
    created_at: new Date().toISOString(),
  };

  const draftsDir = path.join(process.cwd(), "data", "ai-drafts");
  fs.mkdirSync(draftsDir, { recursive: true });
  const file = path.join(draftsDir, `${id}.json`);
  fs.writeFileSync(file, JSON.stringify(draft, null, 2), "utf-8");
  console.log(`[ai-draft] saved: ${path.relative(process.cwd(), file)}`);
  console.log(`[ai-draft] レビュー URL: /admin/drafts/${id}`);
}

main().catch((err) => {
  console.error("[ai-draft] fatal:", err);
  process.exit(99);
});

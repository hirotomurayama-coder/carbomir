/**
 * carboncredits.jp の記事 (column/global 等の post) corpus 同期 CLI.
 * PROVENANCE.md の「媒体 = 散文の正準」を、用語(glossary)に続き記事にも拡張する
 * 取り込み (経路 A の REST 版)。
 *
 * WP REST から {id, title, link, modified} だけを取得し
 * `data/content/media-articles.json` に書き出す (本文は取り込まない)。
 * これを entity / case-study とタイトル照合して「関連ニュース」を出す
 * (照合は src/lib/media-match.ts、純粋関数)。
 *
 *   - bot ポリシーは回避しない。403 等は log してスキップ (exit 0)。
 *     許可済みコンテキスト (WAF allowlist / 自社回線) から実行する。
 *
 * 使い方:  npm run sync:media
 * 環境変数: GLOSSARY_SYNC_UA  許可済み User-Agent (任意, glossary と共用)
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

const API = "https://carboncredits.jp/wp-json/wp/v2/posts";
const UA =
  process.env.GLOSSARY_SYNC_UA ??
  "carbomir-glossary-sync (+https://carboncredits.jp/carbomir)";
const OUT = path.join(process.cwd(), "data", "content", "media-articles.json");
const PER_PAGE = 100;

type RawPost = { id: number; link: string; modified: string; title: { rendered: string } };
type MediaArticle = { id: number; title: string; link: string; modified: string };

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

async function fetchPage(page: number): Promise<{ posts: RawPost[]; totalPages: number }> {
  const url = `${API}?per_page=${PER_PAGE}&page=${page}&_fields=id,link,modified,title`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    if (res.status === 400) return { posts: [], totalPages: page - 1 }; // page 超過
    throw new Error(`HTTP ${res.status}`);
  }
  const totalPages = Number(res.headers.get("x-wp-totalpages") ?? "1");
  const posts = (await res.json()) as RawPost[];
  return { posts, totalPages };
}

async function main(): Promise<void> {
  const articles: MediaArticle[] = [];
  let totalPages = 1;
  try {
    for (let page = 1; page <= totalPages; page++) {
      const { posts, totalPages: tp } = await fetchPage(page);
      if (page === 1) totalPages = tp;
      for (const p of posts) {
        articles.push({
          id: p.id,
          title: decodeEntities(p.title.rendered).trim(),
          link: p.link,
          modified: p.modified,
        });
      }
      console.log(`[sync-media] page ${page}/${totalPages} (+${posts.length}, 計 ${articles.length})`);
    }
  } catch (e) {
    console.error(`[sync-media] 取得失敗: ${(e as Error).message}. スキップ (WAF allowlist / 許可済み回線が必要)。`);
    process.exit(0);
  }

  if (articles.length === 0) {
    console.error("[sync-media] 0 件。書き出しを中止。");
    process.exit(0);
  }

  articles.sort((a, b) => (a.modified < b.modified ? 1 : -1));
  const now = new Date().toISOString();
  writeFileSync(OUT, `${JSON.stringify({ last_synced_at: now, articles }, null, 2)}\n`);
  console.log(`[sync-media] ${articles.length} 件 → ${OUT}`);
}

void main();

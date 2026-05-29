/**
 * carboncredits.jp 記事 corpus のローダー + entity/case-study への照合ヘルパ。
 *
 * corpus 本体は `data/content/media-articles.json` (sync:media が REST から生成)。
 * server-only (fs 読み)。entity/case-study 詳細ページ (server component) が
 * 「関連ニュース」を出すのに使う。matchArticles は純粋関数 (media-match.ts)。
 */
import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { type MediaArticle, matchArticles, mediaMatchTerms } from "@/lib/media-match";

type Corpus = { last_synced_at: string | null; articles: MediaArticle[] };

let cache: Corpus | null = null;

function load(): Corpus {
  if (cache) return cache;
  try {
    const file = path.join(process.cwd(), "data", "content", "media-articles.json");
    cache = JSON.parse(readFileSync(file, "utf8")) as Corpus;
  } catch {
    cache = { last_synced_at: null, articles: [] };
  }
  return cache;
}

export function getMediaCorpus(): Corpus {
  return load();
}

type NameLike = {
  slug: string;
  name_ja?: string;
  name_en?: string;
  abbreviation?: string;
  company?: string;
  title?: string;
};

/**
 * entity / case-study に関連する carboncredits.jp 記事を modified 降順で返す。
 * extraTerms で追加の照合語を渡せる (例: case-study が関連プレイヤー entity の
 * 別名 (マイクロソフト 等) を継承して拾うため)。
 */
export function relatedMediaArticles(
  e: NameLike,
  limit = 6,
  extraTerms: string[] = [],
): MediaArticle[] {
  const terms = [...mediaMatchTerms(e), ...extraTerms];
  return matchArticles(terms, load().articles, limit);
}

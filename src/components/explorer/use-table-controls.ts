"use client";

import * as React from "react";

/**
 * テーブル系 explorer 共通ロジック (検索 + ソート + 件数集計).
 *
 * 設計判断:
 *   - フィルタ (タブ・チップ等) は各 explorer 固有なのでここでは扱わず、
 *     呼び出し側で pre-filter してから items を渡す.
 *   - 検索は単一ボックス全文 (haystack 文字列を呼び出し側が組み立てる).
 *   - ソートは列キー + 昇降. 値抽出関数を columns で指定する.
 *   - URL クエリ保持はせず、ローカル state のみ. 数百件規模でクライアント完結.
 */

export type SortDir = "asc" | "desc";

export type SortableColumn<T> = {
  /** 列の安定キー */
  key: string;
  /** ソート値を返す関数. undefined / null は末尾扱い. */
  sortValue: (item: T) => string | number | undefined | null;
};

export type UseTableControlsOptions<T> = {
  items: T[];
  /** 検索対象 (haystack) を返す関数. 小文字化はライブラリ側で実施. */
  searchText: (item: T) => string;
  /** ソート可能な列のサブセット. */
  sortableColumns: SortableColumn<T>[];
  /** 初期ソート. 省略時はソートなし (入力順保持). */
  defaultSort?: { key: string; dir: SortDir };
  /** 検索 placeholder. デフォルトは "検索". */
  placeholder?: string;
};

export type UseTableControlsResult<T> = {
  /** 検索 + ソート適用後の配列. */
  visible: T[];
  /** 検索クエリ. */
  query: string;
  setQuery: (s: string) => void;
  /** 現在のソート状態 (null = 入力順). */
  sort: { key: string; dir: SortDir } | null;
  /** 列ヘッダクリックハンドラ. 同じ列なら昇降切替、別列なら新規昇順. */
  toggleSort: (key: string) => void;
  /** ソート明示クリア (入力順に戻す). */
  clearSort: () => void;
  /** 検索ヒット件数 (元配列との比較用). */
  matchCount: number;
  totalCount: number;
};

export function useTableControls<T>(
  opts: UseTableControlsOptions<T>
): UseTableControlsResult<T> {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: SortDir } | null>(
    opts.defaultSort ?? null
  );

  // sortableColumns を Map に変換 (列キー → sortValue 関数)
  const sortMap = React.useMemo(() => {
    const m = new Map<string, (item: T) => string | number | undefined | null>();
    for (const c of opts.sortableColumns) m.set(c.key, c.sortValue);
    return m;
  }, [opts.sortableColumns]);

  // 検索フィルタ
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return opts.items;
    return opts.items.filter((item) =>
      opts.searchText(item).toLowerCase().includes(q)
    );
    // searchText は安定な参照を想定 (呼び出し側で useCallback or 通常関数)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.items, query]);

  // ソート
  const visible = React.useMemo(() => {
    if (!sort) return filtered;
    const fn = sortMap.get(sort.key);
    if (!fn) return filtered;
    const sign = sort.dir === "asc" ? 1 : -1;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = fn(a);
      const bv = fn(b);
      // null/undefined は末尾
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * sign;
      }
      return String(av).localeCompare(String(bv), "ja") * sign;
    });
    return arr;
  }, [filtered, sort, sortMap]);

  const toggleSort = React.useCallback((key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null; // 3 クリック目で解除
    });
  }, []);

  const clearSort = React.useCallback(() => setSort(null), []);

  return {
    visible,
    query,
    setQuery,
    sort,
    toggleSort,
    clearSort,
    matchCount: filtered.length,
    totalCount: opts.items.length,
  };
}

"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  pageSize: number;
  totalCount: number;
};

export function OffsetsProjectsPagination({
  page,
  pageSize,
  totalCount,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = React.useTransition();

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const goTo = (target: number) => {
    const next = new URLSearchParams(sp.toString());
    if (target <= 0) next.delete("page");
    else next.set("page", String(target));
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
    // ページ切り替え時はテーブル先頭へスクロールしたい
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const start = totalCount === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => goTo(page - 1)}
        disabled={page <= 0 || pending}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </Button>
      <span className="label-mono text-muted-foreground">
        {start.toLocaleString()} – {end.toLocaleString()} of{" "}
        {totalCount.toLocaleString()}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => goTo(page + 1)}
        disabled={page + 1 >= totalPages || pending}
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

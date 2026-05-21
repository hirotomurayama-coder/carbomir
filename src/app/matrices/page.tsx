import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Columns3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { listPublishedMatrices } from "@/lib/data/comparisons";

export const metadata: Metadata = {
  title: "比較行列",
  description:
    "Carbomir の比較行列一覧。VCM領域の主要対比を専門家編集で提供する。",
};

export default function MatricesIndexPage() {
  const matrices = listPublishedMatrices();

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent">
              <Columns3 className="h-2.5 w-2.5 mr-1" />
              {matrices.length.toString().padStart(2, "0")} Published
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            比較行列
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            制度・メソドロジー・プレイヤー・指標を、実務判断に直結する軸で対比する。各セルは事実・出典・編集部の品質観を保持する。
          </p>
        </div>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[320px]">
                  Title
                </th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">
                  Entities
                </th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">
                  Dimensions
                </th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">
                  Reviewed
                </th>
                <th className="w-12 px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {matrices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center label-mono text-muted-foreground"
                  >
                    No published matrices
                  </td>
                </tr>
              ) : (
                matrices.map((m) => (
                  <tr
                    key={m.slug}
                    className="border-b border-border last:border-0 group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 align-top">
                      <Link
                        href={`/matrices/${m.slug}`}
                        className="block group-hover:text-accent"
                      >
                        <p className="font-medium text-foreground group-hover:text-accent">
                          {m.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {m.description}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        {m.entities.map((e) => (
                          <span
                            key={e.slug}
                            className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80"
                          >
                            {e.name_ja}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="metric-number text-sm text-foreground">
                        {m.dimensions.length.toString().padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="metric-number text-xs text-muted-foreground">
                        {m.last_reviewed_at}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <Link
                        href={`/matrices/${m.slug}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-accent transition-colors"
                        aria-label="開く"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Help card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Columns3 className="h-4 w-4 text-accent" />
            比較行列とは
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <CardDescription className="text-sm leading-relaxed">
            実務判断に直結する軸で複数の制度・メソドロジーを対比する Carbomir の主力機能。
            各セルには事実・出典・編集部の品質観が保持され、グローバル/国内、公的/民間、対象範囲、価格帯、品質論点を一覧できる。
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

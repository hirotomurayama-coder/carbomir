import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminBanner } from "@/components/admin/admin-banner";
import { EntityEditClient } from "@/components/admin/entity-edit-client";
import { findBySlug, listSlugs } from "@/lib/data/content-store";
import type { Entity } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
}

export default async function AdminEditEntityPage({ params }: Props) {
  const { slug } = await params;
  const entity = findBySlug<Entity>("entities", slug);
  if (!entity) notFound();
  const slugSuggestions = listSlugs("entities").sort();

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1100px] mx-auto">
      <nav className="mb-4">
        <Link
          href="/admin/edit/entities"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">←</span> All entities
        </Link>
      </nav>

      <header className="mb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Network className="h-2.5 w-2.5 mr-1" />
            Entity
          </Badge>
          <span className="font-mono text-[10.5px] text-muted-foreground">
            {entity.slug}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {entity.name_ja}
        </h1>
      </header>

      <AdminBanner />

      <EntityEditClient initial={entity} slugSuggestions={slugSuggestions} />
    </div>
  );
}

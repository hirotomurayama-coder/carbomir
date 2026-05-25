import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminBanner } from "@/components/admin/admin-banner";
import { FaqEditClient } from "@/components/admin/faq-edit-client";
import { findBySlug } from "@/lib/data/content-store";
import type { FAQItem } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
}

export default async function AdminEditFaqPage({ params }: Props) {
  const { slug } = await params;
  const faq = findBySlug<FAQItem>("faqs", slug);
  if (!faq) notFound();

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1100px] mx-auto">
      <nav className="mb-4">
        <Link
          href="/admin/edit/faqs"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">←</span> All FAQs
        </Link>
      </nav>
      <header className="mb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <HelpCircle className="h-2.5 w-2.5 mr-1" />
            FAQ
          </Badge>
          <span className="font-mono text-[10.5px] text-muted-foreground">
            {faq.slug}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {faq.question}
        </h1>
      </header>
      <AdminBanner />
      <FaqEditClient initial={faq} />
    </div>
  );
}

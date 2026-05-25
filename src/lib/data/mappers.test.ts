import { describe, expect, it } from "vitest";
import {
  type EntityRow,
  type MatrixRow,
  type RelationRow,
  type TimelineEventRow,
  relationsToList,
  rowToEntity,
  rowToMatrix,
  rowToTimelineEvent,
} from "./mappers";

describe("relationsToList", () => {
  it("returns empty array for null", () => {
    expect(relationsToList(null)).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    expect(relationsToList([])).toEqual([]);
  });

  it("flattens object-shaped target", () => {
    const input: RelationRow[] = [
      {
        relation_type: "competes_with",
        notes: "国内 vs 二国間",
        target: { slug: "jcm" },
      },
    ];
    expect(relationsToList(input)).toEqual([
      { to_slug: "jcm", relation: "competes_with", note: "国内 vs 二国間" },
    ]);
  });

  it("flattens array-shaped target (PostgREST nested result)", () => {
    const input: RelationRow[] = [
      {
        relation_type: "depends_on",
        notes: null,
        target: [{ slug: "verra-vcs" }],
      },
    ];
    expect(relationsToList(input)).toEqual([
      { to_slug: "verra-vcs", relation: "depends_on", note: undefined },
    ]);
  });

  it("drops relations with missing target slug", () => {
    const input: RelationRow[] = [
      { relation_type: "supersedes", notes: null, target: null },
      {
        relation_type: "equivalent_to",
        notes: null,
        target: { slug: "" },
      },
      {
        relation_type: "parent_of",
        notes: null,
        target: { slug: "jcredit" },
      },
    ];
    expect(relationsToList(input)).toEqual([
      { to_slug: "jcredit", relation: "parent_of", note: undefined },
    ]);
  });
});

describe("rowToEntity", () => {
  it("maps a full row and merges related", () => {
    const row: EntityRow = {
      id: "00000000-0000-0000-0000-000000000001",
      slug: "jcredit",
      type: "regulation",
      name_ja: "J-クレジット制度",
      name_en: "J-Credit Scheme",
      abbreviation: null,
      summary: "国認証の国内クレジット制度",
      sections: [
        { heading: "制度の概要", body: "..." },
      ],
      tags: ["国内制度"],
      status: "published",
      last_reviewed_at: "2026-05-21",
      related_matrix_slugs: ["jcredit-jcm-verra"],
    };
    const related = [
      { to_slug: "jcm", relation: "competes_with" as const, note: "x" },
    ];

    const out = rowToEntity(row, related);
    expect(out.slug).toBe("jcredit");
    expect(out.name_en).toBe("J-Credit Scheme");
    expect(out.abbreviation).toBeUndefined();
    expect(out.sections).toHaveLength(1);
    expect(out.related).toEqual(related);
    expect(out.related_matrix_slugs).toEqual(["jcredit-jcm-verra"]);
    expect(out.tags).toEqual(["国内制度"]);
    expect(out.last_reviewed_at).toBe("2026-05-21");
    expect(out.status).toBe("published");
  });

  it("falls back to safe defaults for nullable fields", () => {
    const row: EntityRow = {
      id: "id-1",
      slug: "x",
      type: "market",
      name_ja: "X",
      name_en: null,
      abbreviation: null,
      summary: null,
      sections: null,
      tags: null,
      status: "draft",
      last_reviewed_at: null,
      related_matrix_slugs: null,
    };
    const out = rowToEntity(row, []);
    expect(out.summary).toBe("");
    expect(out.sections).toEqual([]);
    expect(out.tags).toEqual([]);
    expect(out.related_matrix_slugs).toEqual([]);
    expect(out.last_reviewed_at).toBe("");
    expect(out.name_en).toBeUndefined();
  });
});

describe("rowToMatrix", () => {
  it("maps a full row", () => {
    const row: MatrixRow = {
      slug: "jcredit-jcm-verra",
      title: "比較行列",
      description: "対比",
      dimensions: [{ key: "k", label_ja: "K" }],
      entity_refs: [{ slug: "jcredit", name_ja: "J-クレジット" }],
      cells: { jcredit: { k: { value: "v" } } },
      status: "published",
      last_reviewed_at: "2026-05-21",
    };
    const out = rowToMatrix(row);
    expect(out.title).toBe("比較行列");
    expect(out.dimensions).toHaveLength(1);
    expect(out.entities).toHaveLength(1);
    expect(out.entities[0].slug).toBe("jcredit");
    expect(out.cells.jcredit.k.value).toBe("v");
  });

  it("falls back to safe defaults", () => {
    const row: MatrixRow = {
      slug: "x",
      title: "X",
      description: null,
      dimensions: null,
      entity_refs: null,
      cells: null,
      status: "draft",
      last_reviewed_at: null,
    };
    const out = rowToMatrix(row);
    expect(out.description).toBe("");
    expect(out.dimensions).toEqual([]);
    expect(out.entities).toEqual([]);
    expect(out.cells).toEqual({});
    expect(out.last_reviewed_at).toBe("");
  });
});

describe("rowToTimelineEvent", () => {
  it("maps a full row", () => {
    const row: TimelineEventRow = {
      slug: "2013-10-jcredit-launch",
      event_date: "2013-10-01",
      title: "J-クレジット制度発足",
      summary: "統合により発足",
      content_md: "詳細...",
      category: "regulatory",
      importance: 5,
      status: "published",
      affected_entity_slugs: ["jcredit"],
      source_urls: [
        { label: "J-クレジット制度公式", url: "https://japancredit.go.jp/" },
      ],
    };
    const out = rowToTimelineEvent(row);
    expect(out.slug).toBe("2013-10-jcredit-launch");
    expect(out.title).toBe("J-クレジット制度発足");
    expect(out.content_md).toBe("詳細...");
    expect(out.category).toBe("regulatory");
    expect(out.importance).toBe(5);
    expect(out.affected_entity_slugs).toEqual(["jcredit"]);
    expect(out.source_urls).toHaveLength(1);
    expect(out.source_urls[0].url).toBe("https://japancredit.go.jp/");
  });

  it("falls back to safe defaults", () => {
    const row: TimelineEventRow = {
      slug: "x",
      event_date: "2026-01-01",
      title: "X",
      summary: null,
      content_md: null,
      category: "market",
      importance: 1,
      status: "draft",
      affected_entity_slugs: null,
      source_urls: null,
    };
    const out = rowToTimelineEvent(row);
    expect(out.summary).toBe("");
    expect(out.content_md).toBeUndefined();
    expect(out.affected_entity_slugs).toEqual([]);
    expect(out.source_urls).toEqual([]);
  });
});

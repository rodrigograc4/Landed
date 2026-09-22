import { describe, expect, it } from "vitest";
import {
  mergeArchives,
  planMerge,
  settleArchives,
} from "../../src/utils/application";
import {
  archiveName,
  normalizeArchive,
  suggestArchiveName,
  summarizeArchive,
} from "../../src/utils/archive";

const app = (id, extra = {}) => ({
  id,
  company: `${id} Co`,
  role: "Engineer",
  status: "interviewing",
  date: "2026-09-01",
  updatedAt: "2026-09-01T10:00:00.000Z",
  ...extra,
});

const archive = (id, applications, archivedAt = "2026-09-20T10:00:00.000Z") =>
  normalizeArchive({ id, name: id, archivedAt, applications });

describe("normalizeArchive", () => {
  it("normalises the applications inside and keeps the rest", () => {
    const result = normalizeArchive({
      id: "x",
      name: "  Spring 2026  ",
      archivedAt: "2026-09-20T10:00:00Z",
      applications: [app("a", { status: "nonsense" }), {}, null],
    });
    expect(result.name).toBe("Spring 2026");
    expect(result.archivedAt).toBe("2026-09-20T10:00:00.000Z");
    expect(result.applications).toHaveLength(1);
    expect(result.applications[0].status).toBe("applied");
  });

  it("rejects an archive with nothing valid inside", () => {
    expect(normalizeArchive({ id: "x", applications: [{}] })).toBeNull();
    expect(normalizeArchive({ id: "x" })).toBeNull();
    expect(normalizeArchive(null)).toBeNull();
    expect(normalizeArchive([])).toBeNull();
  });

  it("fills a missing id", () => {
    expect(normalizeArchive({ applications: [app("a")] }).id).toMatch(/^arc_/);
  });
});

describe("suggestArchiveName", () => {
  it("covers the months between the first and last application", () => {
    const list = [
      app("a", { date: "2026-03-04" }),
      app("b", { date: "2026-08-10" }),
    ];
    expect(suggestArchiveName(list, "en-GB")).toBe("Mar - Aug 2026");
  });

  it("shows both years when the search crosses one", () => {
    const list = [
      app("a", { date: "2025-11-04" }),
      app("b", { date: "2026-02-10" }),
    ];
    expect(suggestArchiveName(list, "en-GB")).toBe("Nov 2025 - Feb 2026");
  });

  it("keeps month and year as words in Portuguese", () => {
    const list = [
      app("a", { date: "2026-06-04" }),
      app("b", { date: "2026-08-10" }),
    ];
    expect(suggestArchiveName(list, "pt-PT")).toBe("Jun - Ago 2026");
  });

  it("names a single month once and ignores saved postings", () => {
    const list = [
      app("a", { date: "2026-08-04" }),
      app("b", { status: "saved", date: "" }),
    ];
    expect(suggestArchiveName(list, "en-GB")).toBe("Aug 2026");
  });

  it("falls back to the date range when the name is blank", () => {
    const item = archive("x", [app("a", { date: "2026-08-04" })]);
    expect(archiveName({ ...item, name: "" }, "en-GB")).toBe("Aug 2026");
    expect(archiveName(item, "en-GB")).toBe("x");
  });
});

describe("summarizeArchive", () => {
  it("counts saved postings, applications, interviews and offers", () => {
    expect(
      summarizeArchive([
        { status: "saved" },
        { status: "applied" },
        { status: "rejectedAfterInterview" },
        { status: "offer" },
        { status: "landed" },
      ]),
    ).toEqual({
      saved: 1,
      applications: 4,
      interviews: 3,
      offers: 2,
    });
  });
});

describe("mergeArchives", () => {
  it("unites both lists by id", () => {
    const result = mergeArchives(
      [archive("x", [app("a")])],
      [archive("x", [app("a")]), archive("y", [app("b")])],
      [],
    );
    expect(result.map((item) => item.id).sort()).toEqual(["x", "y"]);
  });

  it("drops an archive unarchived or deleted after it was made", () => {
    const result = mergeArchives(
      [],
      [archive("x", [app("a")])],
      [{ id: "x", deletedAt: "2026-09-21T10:00:00.000Z" }],
    );
    expect(result).toEqual([]);
  });

  it("drops deleted applications from inside an archive", () => {
    const [result] = mergeArchives(
      [archive("x", [app("a"), app("b")])],
      [],
      [{ id: "a", deletedAt: "2026-09-21T10:00:00.000Z" }],
    );
    expect(result.applications.map((item) => item.id)).toEqual(["b"]);
  });
});

describe("settleArchives", () => {
  it("takes archived applications out of the main list", () => {
    const result = settleArchives(
      [app("a"), app("b")],
      [archive("x", [app("a")])],
    );
    expect(result.applications.map((item) => item.id)).toEqual(["b"]);
    expect(result.archives[0].applications).toHaveLength(1);
  });

  it("keeps a main copy edited after the archive was made", () => {
    const result = settleArchives(
      [app("a", { updatedAt: "2026-09-21T10:00:00.000Z" })],
      [archive("x", [app("a"), app("b")])],
    );
    expect(result.applications.map((item) => item.id)).toEqual(["a"]);
    expect(result.archives[0].applications.map((item) => item.id)).toEqual([
      "b",
    ]);
  });

  it("gives a shared application to the newer archive and drops empty ones", () => {
    const result = settleArchives(
      [],
      [
        archive("old", [app("a")], "2026-09-10T10:00:00.000Z"),
        archive("new", [app("a")], "2026-09-20T10:00:00.000Z"),
      ],
    );
    expect(result.archives.map((item) => item.id)).toEqual(["new"]);
  });

  it("orders archives newest first", () => {
    const result = settleArchives(
      [],
      [
        archive("old", [app("a")], "2026-03-10T10:00:00.000Z"),
        archive("new", [app("b")], "2026-09-20T10:00:00.000Z"),
      ],
    );
    expect(result.archives.map((item) => item.id)).toEqual(["new", "old"]);
  });
});

describe("planMerge with archives", () => {
  it("does not bring archived applications back from an older backup", () => {
    const result = planMerge(
      { applications: [], archives: [archive("x", [app("a")])], deleted: [] },
      { applications: [app("a"), app("b")], archives: [], deleted: [] },
    );
    expect(result.applications.map((item) => item.id)).toEqual(["b"]);
    expect(result.archives).toHaveLength(1);
    expect(result.added).toBe(1);
  });

  it("brings in archives from the file", () => {
    const result = planMerge(
      { applications: [app("b")], archives: [], deleted: [] },
      { applications: [], archives: [archive("x", [app("a")])], deleted: [] },
    );
    expect(result.archives.map((item) => item.id)).toEqual(["x"]);
    expect(result.applications.map((item) => item.id)).toEqual(["b"]);
    expect(result.archivesAdded).toBe(1);
  });

  it("does not count an archive already stored as added", () => {
    const result = planMerge(
      { applications: [], archives: [archive("x", [app("a")])], deleted: [] },
      {
        applications: [],
        archives: [archive("x", [app("a")]), archive("y", [app("b")])],
        deleted: [],
      },
    );
    expect(result.archives).toHaveLength(2);
    expect(result.archivesAdded).toBe(1);
  });

  it("works for callers that know nothing about archives", () => {
    const result = planMerge(
      { applications: [app("a")], deleted: [] },
      { applications: [app("b")], deleted: [] },
    );
    expect(result.archives).toEqual([]);
    expect(result.applications).toHaveLength(2);
  });
});

import { describe, expect, it } from "vitest";
import {
  emptyApplication,
  formatDate,
  hasDate,
  mergeApplications,
  mergeDeletions,
  normalizeApplication,
  normalizeDeletion,
  planMerge,
  sortApplications,
  willReplace,
} from "../../src/utils/application";
import { GHOST_THRESHOLD_DAYS } from "../../src/utils/constants";

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const base = { company: "Feedzai", role: "Frontend Engineer" };

describe("normalizeApplication", () => {
  it("keeps favourites and defaults everything else to false", () => {
    const base = { company: "A", role: "r" };
    expect(normalizeApplication({ ...base, favorite: true }).favorite).toBe(
      true,
    );
    expect(normalizeApplication(base).favorite).toBe(false);
    expect(normalizeApplication({ ...base, favorite: "yes" }).favorite).toBe(
      false,
    );
  });

  it("drops entries with neither company nor role", () => {
    expect(normalizeApplication({ location: "Lisboa" })).toBeNull();
    expect(normalizeApplication(null)).toBeNull();
    expect(normalizeApplication([])).toBeNull();
    expect(normalizeApplication("nope")).toBeNull();
  });

  it("keeps an existing id and invents one otherwise", () => {
    expect(normalizeApplication({ ...base, id: " abc " }).id).toBe("abc");
    expect(normalizeApplication(base).id).toMatch(/^app_/);
  });

  it("accepts every known status regardless of casing", () => {
    expect(
      normalizeApplication({ ...base, status: "REJECTEDAFTERINTERVIEW" }),
    ).toHaveProperty("status", "rejectedAfterInterview");
    expect(
      normalizeApplication({ ...base, status: "Em Entrevista" }).status,
    ).toBe("applied");
  });

  it("falls back to applied when the status is unknown", () => {
    expect(normalizeApplication({ ...base, status: "wat" }).status).toBe(
      "applied",
    );
  });

  it("clears the date of a saved posting", () => {
    const saved = normalizeApplication({
      ...base,
      status: "saved",
      date: "2026-01-01",
    });
    expect(saved.date).toBe("");
    expect(saved.status).toBe("saved");
  });

  it("turns a stale application into a ghosted one", () => {
    const stale = normalizeApplication({
      ...base,
      status: "applied",
      date: daysAgo(GHOST_THRESHOLD_DAYS + 1),
    });
    expect(stale.status).toBe("ghosted");

    const fresh = normalizeApplication({
      ...base,
      status: "applied",
      date: daysAgo(GHOST_THRESHOLD_DAYS - 1),
    });
    expect(fresh.status).toBe("applied");
  });

  it("never ghosts a status the user chose explicitly", () => {
    const old = { ...base, date: daysAgo(90) };
    expect(normalizeApplication({ ...old, status: "offer" }).status).toBe(
      "offer",
    );
    expect(normalizeApplication({ ...old, status: "rejected" }).status).toBe(
      "rejected",
    );
  });

  it("rejects impossible dates and falls back to today", () => {
    expect(normalizeApplication({ ...base, date: "2026-02-31" }).date).toBe(
      emptyApplication().date,
    );
    expect(normalizeApplication({ ...base, date: "garbage" }).date).toBe(
      emptyApplication().date,
    );
  });

  it("pads a loosely written date", () => {
    expect(normalizeApplication({ ...base, date: "2026-3-7" }).date).toBe(
      "2026-03-07",
    );
  });

  it("only keeps http links", () => {
    expect(normalizeApplication({ ...base, link: "feedzai.com" }).link).toBe(
      "https://feedzai.com/",
    );
    expect(
      normalizeApplication({ ...base, link: "javascript:alert(1)" }).link,
    ).toBe("");
  });

  it("trims and caps the free text fields", () => {
    const long = normalizeApplication({
      ...base,
      source: " ".repeat(3) + "x".repeat(200),
      notes: "y".repeat(5000),
    });
    expect(long.source).toHaveLength(60);
    expect(long.notes).toHaveLength(2000);
  });
});

describe("sortApplications", () => {
  const list = [
    { company: "B", role: "r", date: "2026-01-01", status: "rejected" },
    { company: "A", role: "r", date: "2026-05-01", status: "ghosted" },
    { company: "C", role: "r", date: "", status: "saved" },
    { company: "D", role: "r", date: "2026-03-01", status: "offer" },
  ];

  it("puts dateless entries first, then the newest", () => {
    expect(sortApplications(list).map((item) => item.company)).toEqual([
      "C",
      "A",
      "D",
      "B",
    ]);
  });

  it("sorts alphabetically by company", () => {
    expect(
      sortApplications(list, "company").map((item) => item.company),
    ).toEqual(["A", "B", "C", "D"]);
  });

  it("sorts by how far the application got", () => {
    expect(sortApplications(list, "result").map((item) => item.status)).toEqual(
      ["offer", "saved", "rejected", "ghosted"],
    );
  });

  it("leaves the input untouched", () => {
    const input = [...list];
    sortApplications(input, "company");
    expect(input).toEqual(list);
  });
});

describe("hasDate", () => {
  it("is false only for saved postings", () => {
    expect(hasDate("saved")).toBe(false);
    expect(hasDate("applied")).toBe(true);
  });
});

describe("formatDate", () => {
  it("follows the locale", () => {
    expect(formatDate("2026-03-07", "pt-PT")).toBe("07/03/2026");
    expect(formatDate("2026-03-07", "en-GB")).toBe("07/03/2026");
    expect(formatDate("2026-03-07", "en-US")).toBe("03/07/2026");
  });
});

describe("updatedAt", () => {
  it("keeps a valid timestamp and drops anything else", () => {
    expect(
      normalizeApplication({ company: "A", updatedAt: "2026-03-07T10:00:00Z" })
        .updatedAt,
    ).toBe("2026-03-07T10:00:00.000Z");
    expect(normalizeApplication({ company: "A" }).updatedAt).toBe("");
    expect(
      normalizeApplication({ company: "A", updatedAt: "not a date" }).updatedAt,
    ).toBe("");
  });
});

describe("mergeApplications", () => {
  const stored = (updatedAt, notes = "stored") => ({
    ...normalizeApplication({ company: "Feedzai", role: "Dev", updatedAt }),
    id: "same",
    notes,
  });

  it("adds applications it has never seen", () => {
    const incoming = [{ ...stored("2026-03-07T10:00:00Z"), id: "other" }];
    expect(
      mergeApplications([stored("2026-03-07T10:00:00Z")], incoming),
    ).toHaveLength(2);
  });

  it("keeps the copy edited last", () => {
    const current = [stored("2026-03-08T10:00:00Z", "newer")];
    const incoming = [stored("2026-03-07T10:00:00Z", "older")];

    expect(mergeApplications(current, incoming)[0].notes).toBe("newer");
    expect(mergeApplications(incoming, current)[0].notes).toBe("newer");
  });

  it("lets the incoming copy win when neither has a timestamp", () => {
    const current = [stored("", "stored")];
    const incoming = [stored("", "incoming")];
    expect(mergeApplications(current, incoming)[0].notes).toBe("incoming");
  });

  it("treats a missing timestamp as older than a known one", () => {
    const current = [stored("2026-03-07T10:00:00Z", "dated")];
    const incoming = [stored("", "undated")];
    expect(mergeApplications(current, incoming)[0].notes).toBe("dated");
  });
});

describe("willReplace", () => {
  const item = (updatedAt) => ({ id: "same", updatedAt });

  it("is true only when the incoming copy actually wins", () => {
    const current = [item("2026-03-07T10:00:00.000Z")];

    expect(willReplace(current, item("2026-03-08T10:00:00.000Z"))).toBe(true);
    expect(willReplace(current, item("2026-03-06T10:00:00.000Z"))).toBe(false);
    expect(willReplace(current, { id: "other", updatedAt: "" })).toBe(false);
  });
});

describe("deletion log", () => {
  const app = (id, updatedAt) => ({
    ...normalizeApplication({ company: "Feedzai", role: "Dev", updatedAt }),
    id,
  });
  const gone = (id, deletedAt) => ({ id, deletedAt });

  it("drops invalid deletion records", () => {
    expect(normalizeDeletion(gone("a", "2026-03-07T10:00:00Z"))).toEqual(
      gone("a", "2026-03-07T10:00:00.000Z"),
    );
    expect(normalizeDeletion(gone("", "2026-03-07T10:00:00Z"))).toBeNull();
    expect(normalizeDeletion(gone("a", "nope"))).toBeNull();
    expect(normalizeDeletion(null)).toBeNull();
  });

  it("keeps the latest deletion of each id", () => {
    expect(
      mergeDeletions(
        [gone("a", "2026-03-07T10:00:00.000Z")],
        [
          gone("a", "2026-03-09T10:00:00.000Z"),
          gone("b", "2026-03-01T10:00:00.000Z"),
        ],
      ),
    ).toEqual([
      gone("a", "2026-03-09T10:00:00.000Z"),
      gone("b", "2026-03-01T10:00:00.000Z"),
    ]);
  });

  it("does not bring back an application deleted here", () => {
    const result = planMerge(
      { applications: [], deleted: [gone("a", "2026-03-08T10:00:00.000Z")] },
      { applications: [app("a", "2026-03-07T10:00:00Z")], deleted: [] },
    );

    expect(result.applications).toHaveLength(0);
    expect(result.added).toBe(0);
  });

  it("removes an application deleted in the file", () => {
    const result = planMerge(
      { applications: [app("a", "2026-03-07T10:00:00Z")], deleted: [] },
      { applications: [], deleted: [gone("a", "2026-03-08T10:00:00.000Z")] },
    );

    expect(result.applications).toHaveLength(0);
    expect(result.removed).toBe(1);
    expect(result.deleted).toHaveLength(1);
  });

  it("keeps an application edited after it was deleted", () => {
    const result = planMerge(
      { applications: [app("a", "2026-03-09T10:00:00Z")], deleted: [] },
      { applications: [], deleted: [gone("a", "2026-03-08T10:00:00.000Z")] },
    );

    expect(result.applications).toHaveLength(1);
    expect(result.removed).toBe(0);
  });

  it("treats an undated application as older than any deletion", () => {
    const result = planMerge(
      { applications: [app("a", "")], deleted: [] },
      { applications: [], deleted: [gone("a", "2026-03-08T10:00:00.000Z")] },
    );

    expect(result.applications).toHaveLength(0);
  });
});

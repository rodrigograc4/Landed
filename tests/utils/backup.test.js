import { describe, expect, it } from "vitest";
import { buildCsv, readBackup } from "../../src/utils/backup";

const entry = { company: "Feedzai", role: "Frontend Engineer" };

describe("readBackup", () => {
  it("reports an empty file", () => {
    expect(readBackup("").errorKey).toBe("file.emptyFile");
    expect(readBackup("   ").errorKey).toBe("file.emptyFile");
    expect(readBackup(null).errorKey).toBe("file.emptyFile");
  });

  it("reports broken json", () => {
    expect(readBackup("{ not json").errorKey).toBe("file.parseError");
  });

  it("reports a payload without a list", () => {
    expect(readBackup('{"applications":"nope"}').errorKey).toBe(
      "file.badFormat",
    );
    expect(readBackup("42").errorKey).toBe("file.badFormat");
  });

  it("reads the wrapped export format", () => {
    const result = readBackup(
      JSON.stringify({ format: "landed-backup", applications: [entry] }),
    );
    expect(result.errorKey).toBeNull();
    expect(result.imported).toBe(1);
    expect(result.applications[0].company).toBe("Feedzai");
  });

  it("reads a bare array too", () => {
    expect(readBackup(JSON.stringify([entry])).imported).toBe(1);
  });

  it("counts entries it had to skip", () => {
    const result = readBackup(JSON.stringify([entry, {}, null, entry]));
    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(2);
    expect(result.errorKey).toBeNull();
  });

  it("fails when nothing survives", () => {
    const result = readBackup(JSON.stringify([{}, null]));
    expect(result.errorKey).toBe("file.noValidEntries");
    expect(result.skipped).toBe(2);
  });

  it("normalises what it reads", () => {
    const result = readBackup(
      JSON.stringify([{ ...entry, status: "nonsense", link: "evil.com" }]),
    );
    expect(result.applications[0].status).toBe("applied");
    expect(result.applications[0].link).toBe("https://evil.com/");
  });
});

describe("readBackup deletions", () => {
  it("reads the deletion log and skips broken records", () => {
    const result = readBackup(
      JSON.stringify({
        applications: [entry],
        deleted: [
          { id: "gone", deletedAt: "2026-03-08T10:00:00Z" },
          { id: "", deletedAt: "2026-03-08T10:00:00Z" },
        ],
      }),
    );
    expect(result.deleted).toEqual([
      { id: "gone", deletedAt: "2026-03-08T10:00:00.000Z" },
    ]);
  });

  it("has an empty log for files without one", () => {
    expect(readBackup(JSON.stringify([entry])).deleted).toEqual([]);
  });
});

describe("buildCsv", () => {
  const t = (key) => key;

  it("writes a header row and one row per application", () => {
    const lines = buildCsv(
      [{ ...entry, status: "offer", workMode: "remote", favorite: true }],
      t,
    ).split("\r\n");

    expect(lines).toHaveLength(2);
    expect(lines[0].split(",")[0]).toBe("form.company");
    expect(lines[1]).toContain("status.offer");
    expect(lines[1]).toContain("workMode.remote");
    expect(lines[1].endsWith("✓")).toBe(true);
  });

  it("escapes commas, quotes and line breaks", () => {
    const csv = buildCsv([{ ...entry, notes: 'Said "maybe",\ncall back' }], t);
    expect(csv).toContain('"Said ""maybe"",\ncall back"');
  });
});

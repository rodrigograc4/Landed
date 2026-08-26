import { describe, expect, it } from "vitest";
import { readBackup } from "../../src/utils/backup";

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

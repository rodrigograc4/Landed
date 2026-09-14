import { describe, expect, it } from "vitest";
import { computeStats, formatPercent } from "../../src/utils/stats";
import { TIMELINE_WEEKS, UNKNOWN_KEY } from "../../src/utils/constants";

const application = (status, extra = {}) => ({
  status,
  location: "",
  source: "",
  ...extra,
});

describe("computeStats", () => {
  it("survives an empty list without dividing by zero", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.responseRate).toBe(0);
    expect(stats.interviewRate).toBe(0);
  });

  it("leaves saved postings out of every rate", () => {
    const stats = computeStats([
      application("saved"),
      application("saved"),
      application("offer"),
    ]);
    expect(stats.total).toBe(1);
    expect(stats.interviewRate).toBe(100);
  });

  it("counts a rejection after an interview as an interview", () => {
    const stats = computeStats([
      application("rejectedAfterInterview"),
      application("rejected"),
    ]);
    expect(stats.interviewed).toBe(1);
    expect(stats.interviewRate).toBe(50);
    expect(stats.responded).toBe(2);
    expect(stats.responseRate).toBe(100);
  });

  it("never lists saved postings in the funnel", () => {
    const keys = computeStats([application("saved")]).byStatus.map(
      (item) => item.key,
    );
    expect(keys).not.toContain("saved");
  });

  it("counts landed applications as offers in the funnel", () => {
    const { byStatus } = computeStats([
      application("offer"),
      application("landed"),
    ]);
    const keys = byStatus.map((item) => item.key);

    expect(keys).not.toContain("landed");
    expect(byStatus.find((item) => item.key === "offer")).toMatchObject({
      count: 2,
      percent: 100,
    });
  });

  it("groups locations and sources, case insensitively", () => {
    const stats = computeStats([
      application("applied", { location: "Lisboa", source: "LinkedIn" }),
      application("applied", { location: "lisboa", source: "linkedin" }),
      application("applied", { location: "Porto", source: "" }),
    ]);

    expect(stats.byLocation[0]).toMatchObject({ key: "lisboa", count: 2 });
    expect(stats.bySource[0]).toMatchObject({ key: "linkedin", count: 2 });
    expect(stats.bySource.find((item) => item.key === UNKNOWN_KEY).count).toBe(
      1,
    );
  });

  it("counts only applied and interviewing as still open", () => {
    const stats = computeStats([
      application("saved"),
      application("applied"),
      application("interviewing"),
      application("offer"),
      application("ghosted"),
    ]);
    expect(stats.active).toBe(2);
    expect(stats.closed).toBe(2);
  });

  it("buckets the timeline by week and keeps the empty ones", () => {
    const day = (offset) => {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      return date.toISOString().slice(0, 10);
    };

    const stats = computeStats([
      application("applied", { date: day(0) }),
      application("applied", { date: day(1) }),
      application("applied", { date: day(21) }),
    ]);

    expect(stats.timeline).toHaveLength(TIMELINE_WEEKS);
    expect(stats.timeline.some((week) => week.count === 0)).toBe(true);
    expect(stats.timeline.reduce((sum, week) => sum + week.count, 0)).toBe(3);
  });
});

describe("formatPercent", () => {
  it("drops the decimal when it is not needed", () => {
    expect(formatPercent(50)).toBe("50%");
    expect(formatPercent(33.333)).toBe("33.3%");
  });
});

import { describe, expect, it } from "vitest";
import { classifyEngagement, computeStats, workStatus } from "./engagement";

const now = new Date("2026-10-10T12:00:00Z");
const a = (id: string, due: string) => ({ id, due_at: due, max_marks: 10 });

describe("work status", () => {
  it("no submission after deadline is missing", () => {
    expect(workStatus(a("1", "2026-10-09T00:00:00Z"), undefined, now)).toBe("missing");
  });
  it("no submission before deadline is not started", () => {
    expect(workStatus(a("1", "2026-10-11T00:00:00Z"), undefined, now)).toBe("not_started");
  });
  it("submission after deadline is late", () => {
    expect(
      workStatus(a("1", "2026-10-09T00:00:00Z"), { assignment_id: "1", submitted_at: "2026-10-09T05:00:00Z", status: "submitted", marks: null }, now),
    ).toBe("submitted_late");
  });
});

describe("engagement", () => {
  it("three or more missing assignments means frequently missing work", () => {
    const st = computeStats([a("1", "2026-10-01"), a("2", "2026-10-02"), a("3", "2026-10-03")], [], [], now);
    expect(classifyEngagement(st).category).toBe("Frequently missing work");
  });
  it("average test below 40% recommends academic support", () => {
    expect(classifyEngagement(computeStats([], [], [30, 35], now)).category).toBe("Academic support recommended");
  });
  it("a 10-point rise in the latest test is improving", () => {
    expect(classifyEngagement(computeStats([], [], [50, 60], now)).category).toBe("Improving");
  });
  it("80%+ on time with nothing missing is consistent", () => {
    const st = computeStats(
      [a("1", "2026-10-05")],
      [{ assignment_id: "1", submitted_at: "2026-10-04T00:00:00Z", status: "reviewed", marks: 8 }],
      [],
      now,
    );
    expect(classifyEngagement(st).category).toBe("Consistent");
  });
});

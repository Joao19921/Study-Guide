import { describe, expect, it } from "vitest";
import {
  averageProgress,
  clampPercent,
  computeGoalProgress,
  sortTasksByPriority,
  sumDurationMinutes,
} from "./business-rules";

describe("sortTasksByPriority", () => {
  it("puts pending tasks before done ones", () => {
    const tasks = [
      { done: true, priority: "alta", dueDate: null },
      { done: false, priority: "baixa", dueDate: null },
    ];
    const [first] = sortTasksByPriority(tasks);
    expect(first.done).toBe(false);
  });

  it("orders pending tasks by priority weight (alta > media > baixa)", () => {
    const tasks = [
      { done: false, priority: "baixa", dueDate: null },
      { done: false, priority: "alta", dueDate: null },
      { done: false, priority: "media", dueDate: null },
    ];
    const sorted = sortTasksByPriority(tasks);
    expect(sorted.map((t) => t.priority)).toEqual(["alta", "media", "baixa"]);
  });

  it("breaks priority ties by the closest due date", () => {
    const tasks = [
      { done: false, priority: "alta", dueDate: new Date("2026-12-01") },
      { done: false, priority: "alta", dueDate: new Date("2026-01-01") },
      { done: false, priority: "alta", dueDate: null },
    ];
    const sorted = sortTasksByPriority(tasks);
    expect(sorted[0].dueDate).toEqual(new Date("2026-01-01"));
    expect(sorted[2].dueDate).toBeNull();
  });
});

describe("averageProgress", () => {
  it("returns null for an empty list", () => {
    expect(averageProgress([])).toBeNull();
  });

  it("rounds the average of the given values", () => {
    expect(averageProgress([10, 25, 30])).toBe(22);
  });
});

describe("clampPercent", () => {
  it("clamps values below 0 and above 100", () => {
    expect(clampPercent(-15)).toBe(0);
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(42.6)).toBe(43);
  });
});

describe("computeGoalProgress", () => {
  it("returns null when there is no target", () => {
    expect(computeGoalProgress(null, 120)).toBeNull();
    expect(computeGoalProgress(0, 120)).toBeNull();
  });

  it("computes the percentage of the target hours reached", () => {
    // 6 hours logged out of a 12-hour target = 50%
    expect(computeGoalProgress(12, 6 * 60)).toBe(50);
  });

  it("caps progress at 100% when the target is exceeded", () => {
    expect(computeGoalProgress(1, 5 * 60)).toBe(100);
  });
});

describe("sumDurationMinutes", () => {
  it("sums the duration of every session", () => {
    expect(sumDurationMinutes([{ durationMinutes: 30 }, { durationMinutes: 45 }])).toBe(75);
  });

  it("returns 0 for an empty list", () => {
    expect(sumDurationMinutes([])).toBe(0);
  });
});

import { describe, it, expect } from "vitest";
import {
  computeDashboardStats,
  percentDelta,
  formatCompact,
  type OrderLite,
} from "@/lib/admin-stats";

const NOW = new Date("2026-08-20T12:00:00Z");

function order(daysAgo: number, total: number, status = "confirmed"): OrderLite {
  return {
    total,
    status,
    created_at: new Date(NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  };
}

describe("computeDashboardStats", () => {
  it("returns zeros for no orders", () => {
    const s = computeDashboardStats([], NOW);
    expect(s.ordersThisWeek).toBe(0);
    expect(s.revenueThisWeek).toBe(0);
    expect(s.avgOrderThisWeek).toBe(0);
    expect(s.dailyOrderCounts).toHaveLength(10);
    expect(s.dailyOrderCounts.every((c) => c === 0)).toBe(true);
  });

  it("splits orders into current and previous week", () => {
    const orders = [
      order(1, 1000),
      order(3, 2000),
      order(6.5, 500),
      order(8, 4000), // previous week
      order(13, 1000), // previous week
      order(20, 9999), // outside both windows
    ];
    const s = computeDashboardStats(orders, NOW);
    expect(s.ordersThisWeek).toBe(3);
    expect(s.ordersPrevWeek).toBe(2);
    expect(s.revenueThisWeek).toBe(3500);
    expect(s.revenuePrevWeek).toBe(5000);
  });

  it("excludes cancelled orders from revenue but counts them as orders", () => {
    const orders = [order(1, 1000), order(2, 3000, "cancelled")];
    const s = computeDashboardStats(orders, NOW);
    expect(s.ordersThisWeek).toBe(2);
    expect(s.revenueThisWeek).toBe(1000);
    expect(s.avgOrderThisWeek).toBe(1000); // averaged over non-cancelled only
  });

  it("computes average order value per week", () => {
    const orders = [order(1, 1000), order(2, 3000), order(9, 500)];
    const s = computeDashboardStats(orders, NOW);
    expect(s.avgOrderThisWeek).toBe(2000);
    expect(s.avgOrderPrevWeek).toBe(500);
  });

  it("buckets daily counts oldest-first with today last", () => {
    const orders = [order(0.1, 100), order(0.2, 200), order(9.5, 300)];
    const s = computeDashboardStats(orders, NOW);
    expect(s.dailyOrderCounts[9]).toBe(2); // today
    expect(s.dailyOrderCounts[0]).toBe(1); // 9 days ago
    expect(s.dailyRevenue[9]).toBe(300);
    expect(s.dailyRevenue[0]).toBe(300);
  });

  it("ignores rows with invalid or future dates", () => {
    const s = computeDashboardStats(
      [
        { total: 100, status: "confirmed", created_at: "not-a-date" },
        order(-2, 100), // future
      ],
      NOW
    );
    expect(s.ordersThisWeek).toBe(0);
  });

  it("coerces string totals (numeric columns arrive as strings)", () => {
    const s = computeDashboardStats(
      [{ total: "1500", status: "confirmed", created_at: NOW.toISOString() }],
      NOW
    );
    expect(s.revenueThisWeek).toBe(1500);
  });
});

describe("percentDelta", () => {
  it("formats increases and decreases", () => {
    expect(percentDelta(112, 100)).toBe("+12%");
    expect(percentDelta(97, 100)).toBe("-3%");
    expect(percentDelta(100, 100)).toBe("+0%");
  });

  it("returns em-dash with no baseline", () => {
    expect(percentDelta(5, 0)).toBe("—");
  });
});

describe("formatCompact", () => {
  it("formats plain, thousands, and millions", () => {
    expect(formatCompact(950)).toBe("950");
    expect(formatCompact(412_000)).toBe("412k");
    expect(formatCompact(10_800)).toBe("11k");
    expect(formatCompact(2_500_000)).toBe("2.5M");
  });
});

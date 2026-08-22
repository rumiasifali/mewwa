export interface OrderLite {
  total: number | string | null;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  ordersThisWeek: number;
  ordersPrevWeek: number;
  revenueThisWeek: number;
  revenuePrevWeek: number;
  avgOrderThisWeek: number;
  avgOrderPrevWeek: number;
  /** Orders per day for the trailing 10 days, oldest first. */
  dailyOrderCounts: number[];
  /** Revenue per day for the trailing 10 days, oldest first. */
  dailyRevenue: number[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Computes dashboard KPIs from raw order rows (expects roughly the last
 * 14 days of orders). Cancelled orders are excluded from revenue and
 * averages but still count as placed orders.
 */
export function computeDashboardStats(
  orders: OrderLite[],
  now: Date = new Date()
): DashboardStats {
  const nowMs = now.getTime();
  const weekAgo = nowMs - 7 * DAY_MS;
  const twoWeeksAgo = nowMs - 14 * DAY_MS;

  let ordersThisWeek = 0;
  let ordersPrevWeek = 0;
  let revenueThisWeek = 0;
  let revenuePrevWeek = 0;
  let revenueCountThisWeek = 0;
  let revenueCountPrevWeek = 0;
  const dailyOrderCounts = Array(10).fill(0);
  const dailyRevenue = Array(10).fill(0);

  for (const order of orders) {
    const t = new Date(order.created_at).getTime();
    if (Number.isNaN(t) || t > nowMs) continue;
    const total = Number(order.total) || 0;
    const countsForRevenue = order.status !== "cancelled";

    if (t >= weekAgo) {
      ordersThisWeek++;
      if (countsForRevenue) {
        revenueThisWeek += total;
        revenueCountThisWeek++;
      }
    } else if (t >= twoWeeksAgo) {
      ordersPrevWeek++;
      if (countsForRevenue) {
        revenuePrevWeek += total;
        revenueCountPrevWeek++;
      }
    }

    const daysAgo = Math.floor((nowMs - t) / DAY_MS);
    if (daysAgo < 10) {
      const bucket = 9 - daysAgo;
      dailyOrderCounts[bucket]++;
      if (countsForRevenue) dailyRevenue[bucket] += total;
    }
  }

  return {
    ordersThisWeek,
    ordersPrevWeek,
    revenueThisWeek,
    revenuePrevWeek,
    avgOrderThisWeek: revenueCountThisWeek ? revenueThisWeek / revenueCountThisWeek : 0,
    avgOrderPrevWeek: revenueCountPrevWeek ? revenuePrevWeek / revenueCountPrevWeek : 0,
    dailyOrderCounts,
    dailyRevenue,
  };
}

/** "+12%" / "-3%" style delta; "—" when there is no baseline. */
export function percentDelta(current: number, previous: number): string {
  if (previous === 0) return "—";
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

/** Compact PKR figure: 412000 → "412k", 950 → "950". */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(Math.round(value));
}

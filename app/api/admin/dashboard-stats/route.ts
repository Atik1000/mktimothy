import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { authService } from "@/lib/services/auth";

// Force dynamic rendering — stats must always reflect current data.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Returns the UTC midnight boundary for a Date (used for date-range filters).
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const token = authHeader.substring(7);
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (authResult.user.role !== "ADMIN" && authResult.user.role !== "MODERATOR") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const now = new Date();

    // --- Date ranges -------------------------------------------------------
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
    const startOfWeek = startOfDay(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    ); // last Sunday 00:00 UTC
    const endOfWeek = endOfDay(new Date(startOfWeek.getTime() + 6 * 86400000)); // this Saturday 23:59
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(now);
    const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
    const endOfYesterday = endOfDay(startOfYesterday);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // --- Totals (run in parallel) -----------------------------------------
    const [
      totalUsers,
      totalListings,
      totalAdmins,
      totalBlogs,
      pendingApprovals,
      usersThisMonth,
      usersLastMonth,
      listingsThisMonth,
      listingsLastMonth,
      blogsThisMonth,
      blogsLastMonth,
      pendingThisMonth,
      pendingLastMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { approvalStatus: "APPROVED" } }),
      prisma.listing.count({ where: { approvalStatus: "APPROVED" } }),
      prisma.user.count({ where: { role: { in: ["ADMIN", "MODERATOR"] } } }),
      prisma.blog.count(),
      prisma.listing.count({ where: { approvalStatus: "PENDING" } }),
      prisma.user.count({
        where: { approvalStatus: "APPROVED", createdAt: { gte: startOfMonth } },
      }),
      prisma.user.count({
        where: {
          approvalStatus: "APPROVED",
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      prisma.listing.count({
        where: { approvalStatus: "APPROVED", createdAt: { gte: startOfMonth } },
      }),
      prisma.listing.count({
        where: {
          approvalStatus: "APPROVED",
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      prisma.blog.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.blog.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.listing.count({
        where: { approvalStatus: "PENDING", createdAt: { gte: startOfMonth } },
      }),
      prisma.listing.count({
        where: {
          approvalStatus: "PENDING",
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ]);

    // --- Monthly trend (last 6 months) ------------------------------------
    // createdAt is a full timestamp, so groupBy would produce one bucket per
    // distinct datetime. Instead fetch the createdAt values for the window and
    // bucket them by year+month ourselves.
    const [usersInWindow, listingsInWindow] = await Promise.all([
      prisma.user.findMany({
        where: { approvalStatus: "APPROVED", createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.listing.findMany({
        where: { approvalStatus: "APPROVED", createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
    ]);

    // Build the 6-month skeleton and fold counts into it.
    const monthBuckets: { key: string; label: string; users: number; listings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthBuckets.push({
        key,
        label: MONTHS_SHORT[d.getMonth()],
        users: 0,
        listings: 0,
      });
    }
    const bucketIndex = new Map(monthBuckets.map((b, i) => [b.key, i]));

    for (const row of usersInWindow) {
      const d = new Date(row.createdAt);
      const idx = bucketIndex.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (idx !== undefined) monthBuckets[idx].users += 1;
    }
    for (const row of listingsInWindow) {
      const d = new Date(row.createdAt);
      const idx = bucketIndex.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (idx !== undefined) monthBuckets[idx].listings += 1;
    }

    // --- Weekly activity (current week, Sun–Sat) --------------------------
    const [weekListings, weekUsers] = await Promise.all([
      prisma.listing.findMany({
        where: { approvalStatus: "APPROVED", createdAt: { gte: startOfWeek, lte: endOfWeek } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: { approvalStatus: "APPROVED", createdAt: { gte: startOfWeek, lte: endOfWeek } },
        select: { createdAt: true },
      }),
    ]);

    const weeklyActivity = Array.from({ length: 7 }, (_, i) => ({
      day: WEEKDAYS_SHORT[i],
      listings: 0,
      users: 0,
    }));
    for (const l of weekListings) weeklyActivity[new Date(l.createdAt).getDay()].listings += 1;
    for (const u of weekUsers) weeklyActivity[new Date(u.createdAt).getDay()].users += 1;

    // --- Today vs yesterday (for the "today's activity" widget) -----------
    const [todaySignups, todayListings, yestSignups, yestListings] = await Promise.all([
      prisma.user.count({
        where: { approvalStatus: "APPROVED", createdAt: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.listing.count({
        where: { approvalStatus: "APPROVED", createdAt: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.user.count({
        where: {
          approvalStatus: "APPROVED",
          createdAt: { gte: startOfYesterday, lte: endOfYesterday },
        },
      }),
      prisma.listing.count({
        where: {
          approvalStatus: "APPROVED",
          createdAt: { gte: startOfYesterday, lte: endOfYesterday },
        },
      }),
    ]);

    // --- Listing status breakdown (for the donut) -------------------------
    const statusGroups = await prisma.listing.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const listingStatusBreakdown = (statusGroups as Array<{ status: string; _count: { _all: number } }>)
      .map((g) => ({ name: g.status, value: g._count._all }))
      .filter((g) => g.value > 0)
      .sort((a, b) => b.value - a.value);

    // --- Top categories (by listing count, top 5) -------------------------
    const topCategoriesRaw = await prisma.category.findMany({
      take: 5,
      orderBy: { listings: { _count: "desc" } },
      select: {
        name: true,
        _count: { select: { listings: true } },
      },
    });
    const topCategories = topCategoriesRaw.map((c) => ({
      name: c.name,
      count: c._count.listings,
    }));

    // --- Helper: month-over-month delta percentage ------------------------
    const pct = (curr: number, prev: number): number => {
      if (prev === 0) return curr === 0 ? 0 : 100;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const response = NextResponse.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          listings: totalListings,
          admins: totalAdmins,
          blogs: totalBlogs,
          pendingApprovals: pendingApprovals,
        },
        deltas: {
          users: pct(usersThisMonth, usersLastMonth),
          listings: pct(listingsThisMonth, listingsLastMonth),
          blogs: pct(blogsThisMonth, blogsLastMonth),
          pendingApprovals: pct(pendingThisMonth, pendingLastMonth),
        },
        monthlyTrend: monthBuckets.map((b) => ({
          month: b.label,
          users: b.users,
          listings: b.listings,
        })),
        weeklyActivity,
        today: {
          signups: todaySignups,
          listings: todayListings,
          yesterdaySignups: yestSignups,
          yesterdayListings: yestListings,
        },
        listingStatusBreakdown,
        topCategories,
      },
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

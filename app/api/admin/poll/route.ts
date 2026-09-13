import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/attendance";
import DailyDistance from "@/models/dailydistance";
import Employee from "@/models/employee";

// 🚀 Disable ALL caching (Vercel + Next.js + CDN)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

// Default window loaded by the admin panel on first open
const DEFAULT_WINDOW_DAYS = 31;
const DAY_MS = 24 * 60 * 60 * 1000;

const toDay = (d: Date) => d.toISOString().slice(0, 10);

function parseDay(v: string | null): string | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return isNaN(new Date(v).getTime()) ? null : v;
}

// Combined admin-panel feed: attendance logs + daily-distance map in one call
// (replaces the separate /api/attendance/allattendance + /api/attendance/daily-distance
// polls so each refresh costs one function invocation instead of two).
//
// Modes:
//   ?since=<ISO>                    incremental — only rows changed after `since`
//   ?from=YYYY-MM-DD&to=YYYY-MM-DD  full rows inside a date window
//   (no params)                     full rows for the last DEFAULT_WINDOW_DAYS
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const params = req.nextUrl.searchParams;
    const sinceRaw = params.get("since");
    const since = sinceRaw ? new Date(sinceRaw) : null;
    const hasSince = !!since && !isNaN(since.getTime());

    const attQuery: any = {};
    const distQuery: any = {};

    if (hasSince) {
      attQuery.$or = [{ updatedAt: { $gt: since } }, { date: { $gt: since } }];
      distQuery.updatedAt = { $gt: since };
    } else {
      const to = parseDay(params.get("to")) ?? toDay(new Date());
      const from =
        parseDay(params.get("from")) ??
        toDay(new Date(Date.now() - DEFAULT_WINDOW_DAYS * DAY_MS));

      // Attendance.date is a Date; pad the window by a day on each side so
      // IST-midnight records at the edges are never cut off (the client
      // filters by exact day anyway).
      const lower = new Date(new Date(from + "T00:00:00.000Z").getTime() - DAY_MS);
      const upper = new Date(new Date(to + "T00:00:00.000Z").getTime() + 2 * DAY_MS);
      attQuery.date = { $gte: lower, $lt: upper };

      // DailyDistance.date is a "YYYY-MM-DD" string — lexical range works.
      distQuery.date = { $gte: toDay(lower), $lte: toDay(upper) };
    }

    const [records, distances] = await Promise.all([
      Attendance.find(attQuery)
        .select(
          "employee date status checkInTime checkOutTime lateApproved work_mode first_visit last_visit km locations_cover",
        )
        .populate("employee", "name phone email role department")
        .sort({ date: -1 })
        .lean(),
      DailyDistance.find(distQuery)
        .select("employeeId date totalKm")
        .populate({ path: "employeeId", select: "phone", model: Employee })
        .lean(),
    ]);

    const attendance = (records as any[]).map((r) => ({
      phone: r.employee?.phone ?? "N/A",
      name: r.employee?.name ?? "Unknown",
      email: r.employee?.email ?? "Unknown",
      department: r.employee?.department ?? "N/A",
      date: r.date,
      status: r.status ?? "—",
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      lateApproved: r.lateApproved ?? false,
      work_mode: r.work_mode || "—",
      first_visit: r.first_visit || null,
      last_visit: r.last_visit || null,
      km: r.km || 0,
      locations_cover: r.locations_cover || 0,
    }));

    // "phone__YYYY-MM-DD" → totalKm
    const distanceMap: Record<string, number> = {};
    for (const d of distances as any[]) {
      const phone = d.employeeId?.phone;
      if (phone && d.date) distanceMap[`${phone}__${d.date}`] = d.totalKm ?? 0;
    }

    return NextResponse.json(
      { success: true, count: attendance.length, attendance, distanceMap },
      { status: 200, headers: NO_STORE },
    );
  } catch (err: any) {
    console.error("❌ Error in admin poll:", err);
    return NextResponse.json(
      { success: false, error: "Server error while fetching admin data" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

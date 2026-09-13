import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/attendance";
import DailyDistance from "@/models/dailydistance";
import Employee from "@/models/employee";
import SentLocation from "@/models/sentLocation";
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// 🚀 Disable ALL caching (Vercel + Next.js + CDN)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

// Default window loaded by the admin panel on first open
const DEFAULT_WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const toDay = (d: Date) => d.toISOString().slice(0, 10);
const istDay = (d: Date | string | number) =>
  dayjs(d).tz("Asia/Kolkata").format("YYYY-MM-DD");
const istTime = (d: Date | string | number) =>
  dayjs(d).tz("Asia/Kolkata").format("hh:mm A");

// Same office geofence as the dashboard / sentlocation page
const OFFICE_CENTER = { lat: 22.723541, lng: 75.884507 };
const BHOPAL_OFFICE_CENTER = { lat: 23.2349541, lng: 77.4354195 };
const OFFICE_RADIUS_METERS = 200;

type LatLng = { lat: number; lng: number };
const haversineMeters = (c1: LatLng, c2: LatLng) => {
  const R = 6371000;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const lat1 = (c1.lat * Math.PI) / 180;
  const lat2 = (c2.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const isValidCoords = (c: any): c is LatLng =>
  !!c && typeof c.lat === "number" && typeof c.lng === "number" && !(c.lat === 0 && c.lng === 0);
const insideOffice = (c: LatLng) =>
  haversineMeters(c, OFFICE_CENTER) <= OFFICE_RADIUS_METERS ||
  haversineMeters(c, BHOPAL_OFFICE_CENTER) <= OFFICE_RADIUS_METERS;

const hasVisit = (v: any) => !!v && typeof v.lat === "number";

// Attendance rows written before sentloc started storing work_mode /
// first_visit / last_visit / locations_cover on the document have none of
// them. Derive those from the day's SentLocation breadcrumbs (+ check-in /
// check-out), with the same rules the sentlocation page uses — one query for
// the whole batch instead of one request per table row.
// Fail-soft: if anything goes wrong here the rows simply keep "—" for these
// columns instead of the whole admin feed returning 500.
async function fillVisitFields(records: any[]) {
  try {
    await deriveVisitFields(records);
  } catch (err) {
    console.error("❌ Could not derive visit fields:", err);
  }
}

const employeeIdOf = (r: any): string | null => {
  const id = r.employee?._id ?? r.employee;
  return id && mongoose.isValidObjectId(id) ? String(id) : null;
};

async function deriveVisitFields(records: any[]) {
  const needs = records.filter(
    (r) =>
      employeeIdOf(r) !== null && // rows whose employee was deleted have nothing to derive
      r.checkInTime &&
      (!hasVisit(r.first_visit) || !hasVisit(r.last_visit) || !r.work_mode || r.work_mode === "—"),
  );
  if (needs.length === 0) return;

  const empIds = Array.from(new Set(needs.map((r) => employeeIdOf(r) as string)));
  const times = needs.map((r) => new Date(r.date).getTime());
  const lower = new Date(Math.min(...times) - DAY_MS);
  const upper = new Date(Math.max(...times) + DAY_MS);

  const crumbs = await SentLocation.find({
    employeeId: { $in: empIds },
    date: { $gte: lower, $lte: upper },
  })
    .select("employeeId date coords hashalt")
    .sort({ date: 1 })
    .lean();

  const byKey = new Map<string, any[]>();
  for (const c of crumbs as any[]) {
    const key = `${c.employeeId}__${istDay(c.date)}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(c);
  }

  for (const r of needs) {
    const key = `${employeeIdOf(r)}__${istDay(r.date)}`;
    const dayCrumbs = byKey.get(key) ?? [];

    const points: { coords: any; date: number; isCheckOut?: boolean }[] = [];
    if (r.checkInTime && r.checkInLocation)
      points.push({ coords: r.checkInLocation, date: Number(r.checkInTime) });
    for (const c of dayCrumbs) points.push({ coords: c.coords, date: new Date(c.date).getTime() });
    if (r.checkOutTime && r.checkOutLocation)
      points.push({ coords: r.checkOutLocation, date: Number(r.checkOutTime), isCheckOut: true });
    points.sort((a, b) => a.date - b.date);
    const valid = points.filter((p) => isValidCoords(p.coords));

    if (!r.work_mode || r.work_mode === "—") {
      const firstValid = valid.find((p) => !p.isCheckOut);
      if (firstValid) r.work_mode = insideOffice(firstValid.coords) ? "Office" : "Field";
    }
    if (!hasVisit(r.first_visit)) {
      const first = valid.find((p) => !insideOffice(p.coords));
      if (first) r.first_visit = { lat: first.coords.lat, lng: first.coords.lng, time: istTime(first.date) };
    }
    if (!hasVisit(r.last_visit)) {
      const last = valid[valid.length - 1];
      if (last) r.last_visit = { lat: last.coords.lat, lng: last.coords.lng, time: istTime(last.date) };
    }
    if (!r.locations_cover && dayCrumbs.length) {
      r.locations_cover = dayCrumbs.filter((c) => !c.hashalt).length;
    }
  }
}

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
          "employee date status checkInTime checkOutTime checkInLocation checkOutLocation lateApproved work_mode first_visit last_visit km locations_cover",
        )
        .populate("employee", "name phone email role department")
        .sort({ date: -1 })
        .lean(),
      DailyDistance.find(distQuery)
        .select("employeeId date totalKm")
        .populate({ path: "employeeId", select: "phone", model: Employee })
        .lean(),
    ]);

    await fillVisitFields(records as any[]);

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

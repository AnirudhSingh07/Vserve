import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Employee from "@/models/employee";
import DailyDistance, { IDailyDistance } from "@/models/dailydistance";
import SentLocation from "@/models/sentLocation";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { connectDB } from "@/lib/db"; // adjust if your path differs
import { getDrivingKm, isValidCoords } from "@/lib/geo";
import { applyVisitFields } from "@/lib/attendanceVisit";

dayjs.extend(utc);
dayjs.extend(timezone);

//  to get specific sent locations for an employee (by phone) and optional date filter
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const date = searchParams.get("date"); // YYYY-MM-DD

    // 🔴 Validation
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone is required" },
        { status: 400 },
      );
    }

    // 🔍 Find employee
    const employee = await Employee.findOne({ phone });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    // 🎯 FIX: Normalize the target date string
    // If date is provided, use it. If not, default to Today.
    const targetDateStr = date
      ? dayjs.tz(date, "Asia/Kolkata").format("YYYY-MM-DD")
      : dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD");

    // 🧠 1. Query the pre-calculated distance
    const distanceRecord = (await DailyDistance.findOne({
      employeeId: employee._id,
      date: targetDateStr,
    })) as IDailyDistance | null;

    const totalDistanceKm = distanceRecord ? distanceRecord.totalKm : 0;

    // 🧠 2. Build Query for Locations
    // We use targetDateStr to create the start/end times.
    // This ensures consistency: distance and locations are always for the same day.
    const targetDateObj = dayjs.tz(targetDateStr, "Asia/Kolkata");

    const start = targetDateObj.startOf("day").toDate(); // 00:00:00.000
    const end = targetDateObj.endOf("day").toDate(); // 23:59:59.999

    const query: any = {
      employeeId: employee._id,
      date: { $gte: start, $lte: end }, // ✅ Always filter by the target date
    };

    // 📍 Fetch sent locations
    const locations = await SentLocation.find(query).sort({ date: 1 }).lean();

    // 📍 Fetch attendance for checkin / checkout
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    }).lean() as any;

    // Build a set of timestamps to deduplicate against (check-in / check-out)
    const DEDUP_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
    const dedupeTimestamps: number[] = [];

    if (attendance) {
      if (attendance.checkInTime) {
        dedupeTimestamps.push(new Date(attendance.checkInTime).getTime());
      }
      if (attendance.checkOutTime) {
        dedupeTimestamps.push(new Date(attendance.checkOutTime).getTime());
      }
    }

    // Filter out SentLocation breadcrumbs that fall within the dedup window
    // of a check-in or check-out timestamp (these are duplicates created by
    // handleSendLocation auto-checking-in then immediately sending a location).
    const filteredLocations = (locations as any[]).filter((loc) => {
      const locTime = new Date(loc.date).getTime();
      return !dedupeTimestamps.some(
        (ts) => Math.abs(locTime - ts) <= DEDUP_WINDOW_MS
      );
    });

    const allLocations: any[] = [...filteredLocations];

    if (attendance) {
      if (attendance.checkInTime && attendance.checkInLocation) {
        allLocations.push({
          _id: attendance._id.toString() + "_in",
          employeeId: employee._id,
          date: attendance.checkInTime,
          coords: attendance.checkInLocation,
          isCheckIn: true,
        });
      }
      if (attendance.checkOutTime && attendance.checkOutLocation) {
        allLocations.push({
          _id: attendance._id.toString() + "_out",
          employeeId: employee._id,
          date: attendance.checkOutTime,
          coords: attendance.checkOutLocation,
          isCheckOut: true,
        });
      }
    }

    // Sort all locations by date ascending
    allLocations.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // --- DEDUP PASS: Remove locations with same coords and close timestamps ---
    // Two locations are considered duplicates if they are within 50m of each
    // other AND within 60 seconds of each other.
    const DEDUP_COORD_THRESHOLD_M = 50; // meters
    const DEDUP_TIME_THRESHOLD_MS = 60 * 1000; // 60 seconds

    const haversineM = (c1: { lat: number; lng: number }, c2: { lat: number; lng: number }) => {
      const R = 6371e3;
      const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
      const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((c1.lat * Math.PI) / 180) *
          Math.cos((c2.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const dedupedLocations: any[] = [];
    for (const loc of allLocations) {
      const locTime = new Date(loc.date).getTime();
      const isDup = dedupedLocations.some((kept) => {
        const keptTime = new Date(kept.date).getTime();
        if (Math.abs(locTime - keptTime) > DEDUP_TIME_THRESHOLD_MS) return false;
        if (!loc.coords || !kept.coords) return false;
        return haversineM(loc.coords, kept.coords) <= DEDUP_COORD_THRESHOLD_M;
      });
      if (!isDup) {
        dedupedLocations.push(loc);
      }
    }

    // console.log("Locations found:", allLocations.length, "for date:", targetDateStr);

    return NextResponse.json({
      employee,
      success: true,
      totalDistanceKm,
      count: dedupedLocations.length,
      data: dedupedLocations,
    });
  } catch (error) {
    console.error("Fetch SentLocation Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone, coords, hashalt } = await req.json();

    // Missing coordinates used to reach the breadcrumb query and throw a 500
    // with an empty body, which the app reports as a JSON parse error.
    if (!phone || typeof coords?.lat !== "number" || typeof coords?.lng !== "number") {
      return NextResponse.json(
        { success: false, error: "Phone and coordinates are required" },
        { status: 400 },
      );
    }

    const employee = await Employee.findOne({ phone });
    if (!employee)
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );

    const nowIST = dayjs().tz("Asia/Kolkata");
    const todayStr = nowIST.format("YYYY-MM-DD");
    const timestamp = nowIST.toDate();
    const startOfDay = nowIST.startOf("day").toDate();
    const endOfDay = nowIST.endOf("day").toDate();

    // Today's attendance row is needed both to resolve the distance baseline
    // and to record the visit fields below — read it once.
    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // --------------------------------------------------
    // 🛣️ DISTANCE BASELINE
    // --------------------------------------------------
    // A leg is only measured from a baseline recorded earlier *the same day*.
    // A baseline left over from yesterday must never be used: it would bill the
    // overnight journey home as work travel on the following morning.
    //
    // Check-in records the baseline, so the office → first-visit leg is
    // measured like any other. When that baseline is missing or stale — an
    // employee whose check-in predates this behaviour, or a baseline write that
    // failed — today's check-in position stands in for it, so the first leg of
    // the day is still counted rather than silently discarded.
    const lastUpdate = employee.lastLocationTimestamp
      ? dayjs(employee.lastLocationTimestamp).tz("Asia/Kolkata")
      : null;
    const baselineIsFromToday = !!lastUpdate && nowIST.isSame(lastUpdate, "day");

    let origin: { lat: number; lng: number } | null = null;

    if (baselineIsFromToday && isValidCoords(employee.lastKnownCoords)) {
      origin = employee.lastKnownCoords;
    } else if (
      attendance?.checkInTime &&
      dayjs(attendance.checkInTime).tz("Asia/Kolkata").isSame(nowIST, "day") &&
      isValidCoords(attendance.checkInLocation)
    ) {
      origin = attendance.checkInLocation;
    }

    const segmentKm = await getDrivingKm(origin, coords);

    // Daily Record Update
    const updatedDailyRecord = (await DailyDistance.findOneAndUpdate(
      { employeeId: employee._id, date: todayStr },
      { $inc: { totalKm: segmentKm } },
      { upsert: true, new: true },
    )) as IDailyDistance;


    // --------------------------------------------------
    // 📍 DUPLICATE CHECK + LOCATION BREADCRUMB
    // --------------------------------------------------
    // Prevent saving a location if one already exists for this employee
    // within the last 60 seconds at the same coordinates (~50m radius).
    const DEDUP_SECONDS = 60;
    const cutoff = new Date(timestamp.getTime() - DEDUP_SECONDS * 1000);

    const recentDuplicate = await SentLocation.findOne({
      employeeId: employee._id,
      date: { $gte: cutoff },
      "coords.lat": { $gte: coords.lat - 0.0002, $lte: coords.lat + 0.0002 },
      "coords.lng": { $gte: coords.lng - 0.0002, $lte: coords.lng + 0.0002 },
    });

    if (recentDuplicate) {
      // Duplicate detected — skip saving, still update employee state below
    } else {
      await SentLocation.create({
        employeeId: employee._id,
        date: timestamp,
        hashalt: !!hashalt,
        coords: {
          lat: coords.lat,
          lng: coords.lng,
        },
      });
    }

    if (isValidCoords(coords)) {
      if (!attendance) {
        // Re-read before creating: the row was absent when the baseline was
        // resolved, but a concurrent check-in may have created it while the
        // Directions lookup was in flight, and two rows for one employee-day
        // would show up as duplicate lines in the admin table.
        attendance =
          (await Attendance.findOne({
            employee: employee._id,
            date: { $gte: startOfDay, $lte: endOfDay },
          })) ||
          new Attendance({
            employee: employee._id,
            date: nowIST.toDate(),
          });
      }

      applyVisitFields(attendance, coords, nowIST.format("hh:mm A"));

      if (typeof attendance.km !== "number") attendance.km = 0;
      attendance.km += segmentKm;

      if (typeof attendance.locations_cover !== "number") attendance.locations_cover = 0;
      if (!hashalt) {
        attendance.locations_cover += 1;
      }

      await attendance.save();
    }

    // --------------------------------------------------
    // 🧠 EMPLOYEE STATE UPDATE (FORCE WRITE)
    // --------------------------------------------------
    // Hum findByIdAndUpdate use kar rahe hain taaki agar schema cache issue ho
    // toh bhi MongoDB direct update accept kar le.

    // Naya Tarika (Direct DB Hit):
    await Employee.findByIdAndUpdate(
      employee._id,
      {
        $set: {
          lastKnownCoords: {
            lat: Number(coords.lat), // Ensure Number type
            lng: Number(coords.lng),
          },
          lastLocationTimestamp: nowIST.toDate(),
        },
      },
      { new: true }, // Return updated doc (optional)
    );



    return NextResponse.json({
      success: true,
      segmentAdded: Number(segmentKm.toFixed(2)),
      totalToday: Number(updatedDailyRecord.totalKm.toFixed(2)),
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 },
    );
  }
}

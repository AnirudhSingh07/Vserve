import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Employee from "@/models/employee";
import DailyDistance, { IDailyDistance } from "@/models/dailydistance";
import SentLocation from "@/models/sentLocation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { connectDB } from "@/lib/db"; // adjust if your path differs

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
    console.log("user total Distance travel :", totalDistanceKm);

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

    // console.log("Locations found:", locations.length, "for date:", targetDateStr);

    return NextResponse.json({
      employee,
      success: true,
      totalDistanceKm,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error("Fetch SentLocation Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();

//     const { phone, coords } = await req.json();

//     if (!phone || !coords?.lat || !coords?.lng) {
//       return NextResponse.json(
//         { success: false, error: "Data missing" },
//         { status: 400 },
//       );
//     }

//     const employee = await Employee.findOne({ phone });
//     if (!employee)
//       return NextResponse.json(
//         { success: false, error: "Not found" },
//         { status: 404 },
//       );

//     const nowIST = dayjs().tz("Asia/Kolkata");
//     const todayStr = nowIST.format("YYYY-MM-DD");
//     const timestamp = dayjs().tz("Asia/Kolkata").toDate();

//     // --- 🛣️ CALCULATION PRE-CHECKS ---
//     let segmentKm = 0;
//     const lastUpdate = employee.lastLocationTimestamp
//       ? dayjs(employee.lastLocationTimestamp).tz("Asia/Kolkata")
//       : null;
//     const isNewDay = !lastUpdate || !nowIST.isSame(lastUpdate, "day");

// if (employee.lastKnownCoords?.lat) {
//   const origin = `${employee.lastKnownCoords.lat},${employee.lastKnownCoords.lng}`;
//   const destination = `${coords.lat},${coords.lng}`;

//   if (origin !== destination) {
//     const apiKey = process.env.GOOGLE_MAPS_API_KEY; // 🔒 fixed

//     const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;

//     const res = await fetch(url);
//     const routeData = await res.json();

//     if (routeData.status === "OK") {
//       segmentKm = routeData.routes[0].legs[0].distance.value / 1000;
//     }
//   }
// }

//     // --- 💾 ATOMIC UPDATES ---

//     // 1. Update Daily Ledger (The string 'todayStr' is key here)
//     const updatedDailyRecord = (await DailyDistance.findOneAndUpdate(
//       { employeeId: employee._id, date: todayStr },
//       { $inc: { totalKm: segmentKm } },
//       { upsert: true, new: true },
//     )) as IDailyDistance;

//     // 2. Breadcrumb entry
//     const sentLocation = await SentLocation.create({
//       employeeId: employee._id,
//       date: timestamp,
//       coords: { lat: coords.lat, lng: coords.lng },
//     });

//     // 3. Update Employee State
//     employee.lastKnownCoords = { lat: coords.lat, lng: coords.lng };
//     console.log(
//       "update employee state:",
//       (employee.lastLocationTimestamp = timestamp),
//     );

//     // Maintain redundant total on employee for quick lookups
//     employee.dailyDistanceKm = isNewDay
//       ? segmentKm
//       : (employee.dailyDistanceKm || 0) + segmentKm;

//     await employee.save();

//     return NextResponse.json({
//       success: true,
//       segmentAdded: Number(segmentKm.toFixed(2)),
//       totalToday: Number(updatedDailyRecord.totalKm.toFixed(2)),
//       data: sentLocation,
//     });
//   } catch (error: any) {
//     console.error("POST Error:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { phone, coords } = await req.json();

    if (!phone || coords?.lat == null || coords?.lng == null) {
      return NextResponse.json(
        { success: false, error: "Data missing" },
        { status: 400 },
      );
    }

    const employee = await Employee.findOne({ phone });
    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    const nowIST = dayjs().tz("Asia/Kolkata");
    const todayStr = nowIST.format("YYYY-MM-DD");
    const timestamp = nowIST.toDate();

    const lastUpdate = employee.lastLocationTimestamp
      ? dayjs(employee.lastLocationTimestamp).tz("Asia/Kolkata")
      : null;

    const isNewDay = !lastUpdate || !nowIST.isSame(lastUpdate, "day");

    // --------------------------------------------------
    // 🛣️ DISTANCE CALCULATION (AUTO-BOOTSTRAP LOGIC)
    // --------------------------------------------------
    let segmentKm = 0;
    const hasBaseline = !!employee.lastKnownCoords?.lat;

    if (hasBaseline && !isNewDay) {
      const origin = `${employee.lastKnownCoords.lat},${employee.lastKnownCoords.lng}`;
      const destination = `${coords.lat},${coords.lng}`;

      if (origin !== destination) {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;

        const res = await fetch(url);
        const routeData = await res.json();

        if (routeData.status === "OK") {
          segmentKm = routeData.routes[0].legs[0].distance.value / 1000;
        }
      }
    }

    // --------------------------------------------------
    // 💾 DAILY DISTANCE LEDGER (PER EMPLOYEE PER DAY)
    // --------------------------------------------------
    const updatedDailyRecord = (await DailyDistance.findOneAndUpdate(
      { employeeId: employee._id, date: todayStr },
      { $inc: { totalKm: segmentKm } },
      { upsert: true, new: true },
    )) as IDailyDistance;

    // --------------------------------------------------
    // 📍 LOCATION BREADCRUMB
    // --------------------------------------------------
    const sentLocation = await SentLocation.create({
      employeeId: employee._id,
      date: timestamp,
      coords: {
        lat: coords.lat,
        lng: coords.lng,
      },
    });

    // --------------------------------------------------
    // 🧠 EMPLOYEE STATE UPDATE (CRITICAL)
    // --------------------------------------------------
    employee.lastKnownCoords = {
      lat: coords.lat,
      lng: coords.lng,
    };

    employee.lastLocationTimestamp = timestamp;

    await employee.save();

    // --------------------------------------------------
    // ✅ RESPONSE
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      baselineInitialized: !hasBaseline,
      segmentAdded: Number(segmentKm.toFixed(2)),
      totalToday: Number(updatedDailyRecord.totalKm.toFixed(2)),
      data: sentLocation,
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

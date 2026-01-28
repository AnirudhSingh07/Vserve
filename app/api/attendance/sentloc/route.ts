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
// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(req.url);
//     const phone = searchParams.get("phone");
//     const date = searchParams.get("date"); // optional

//     // 🔴 Validation
//     if (!phone) {
//       return NextResponse.json(
//         { success: false, error: "Phone is required" },
//         { status: 400 }
//       );
//     }

//     // 🔍 Find employee
//     const employee = await Employee.findOne({ phone });

//     if (!employee) {
//       return NextResponse.json(
//         { success: false, error: "Employee not found" },
//         { status: 404 }
//       );
//     }

//      // Determine the Target Date for the Distance Ledger
//     // If no date is provided, default to Today (IST)
//     const targetDateStr = date || dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD");

//     // 🧠 1. Query the pre-calculated distance from our new ledger
//   const distanceRecord = await DailyDistance.findOne({
//   employeeId: employee._id,
//   date: targetDateStr
// }) as IDailyDistance | null; // Tell TS it could be the interface or null

// const totalDistanceKm = distanceRecord ? distanceRecord.totalKm : 0;

//       // 🧠 Build query
//     const query: any = {
//       employeeId: employee._id,
//     };
//     // 📅 Date filter (optional)
//     if (date) {
//       // ✅ Use IST timezone
//       const now = dayjs().tz("Asia/Kolkata");
//       const start = now.toDate();
//       start.setHours(0, 0, 0, 0);

//       const end = now.toDate();
//       end.setHours(23, 59, 59, 999);
//       query.date = { $gte: start, $lte: end };
//     }

   

//     // 📍 Fetch sent locations
//     const locations = await SentLocation.find(query).sort({ date: 1 }).lean();

//     return NextResponse.json({
//       employee,
//       success: true,
//       totalDistanceKm,
//       count: locations.length,
//       data: locations,
//     });
//   } catch (error) {
//     console.error("Fetch SentLocation Error:", error);

//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(req.url);
//     const phone = searchParams.get("phone");
//     const date = searchParams.get("date");

//     if (!phone) {
//       return NextResponse.json(
//         { success: false, error: "Phone is required" },
//         { status: 400 },
//       );
//     }

//     const employee = await Employee.findOne({ phone });
//     if (!employee) {
//       return NextResponse.json(
//         { success: false, error: "Employee not found" },
//         { status: 404 },
//       );
//     }

//     // 🧠 BUILD QUERY
//     const query: any = { employeeId: employee._id };

//     if (date) {
//       const start = dayjs.tz(date, "Asia/Kolkata").startOf("day").toDate();
//       const end = dayjs.tz(date, "Asia/Kolkata").endOf("day").toDate();
//       query.date = { $gte: start, $lte: end };
//     }

//     // 📍 FETCH & SORT: .sort({ date: 1 }) ensures the path follows the actual timeline
//     // const locations = await SentLocation.find(query).sort({ date: 1 }).lean();

//     // 2. Dummy Data for testing (Your provided coordinates)
//     const locations = [
//       {
//         coords: { lat: 22.997679995606376, lng: 76.06052658983101 }, // Point A (e.g., Office)
//         date: new Date("2024-05-20T09:00:00Z"),
//       },
//       {
//         coords: { lat: 24.079161710703794, lng: 75.07310796366895 }, // Point B (e.g., Client Location)
//         date: new Date("2024-05-20T10:00:00Z"),
//       },
//       {
      
//         coords: { lat: 24.89173497151871, lng: 74.62296316037386 }, // Point B (e.g., Client Location)
//         date: new Date("2024-05-20T10:00:00Z"),
//       },
//        {
      
//         coords: { lat: 23.179974567069394, lng: 75.78849792496277 }, // Point B (e.g., Client Location)
//         date: new Date("2024-05-20T10:05:00Z"),
//       },
//     ];

//     /** * EXAMPLE SORTED DATA FLOW:
//      * 1. 09:00 AM -> Point A (Origin)
//      * 2. 10:30 AM -> Point B (Stop 1)
//      * 3. 01:00 PM -> Point C (Stop 2)
//      */

//     let totalDistanceKm = 0;

//     if (locations.length >= 2) {
//       const apiKey = process.env.GOOGLE_MAPS_API_KEY;

//       for (let i = 0; i < locations.length - 1; i++) {
//         const startPoint = locations[i].coords;
//         const endPoint = locations[i + 1].coords;

//         // Skip calculation if the coordinates are exactly the same (User didn't move)
//         if (startPoint.lat === endPoint.lat && startPoint.lng === endPoint.lng)
//           continue;

//         const origin = `${startPoint.lat},${startPoint.lng}`;
//         const destination = `${endPoint.lat},${endPoint.lng}`;

//         // Calling Directions API for road-specific distance
//         const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;

//         const res = await fetch(url);
//         const routeData = await res.json();

//         if (routeData.status === "OK") {
//           // Legs[0] represents the path between one origin and one destination
//           const segmentMeters = routeData.routes[0].legs[0].distance.value;
//           totalDistanceKm += segmentMeters / 1000;
//         }
//       }
//     }

//     return NextResponse.json({
//       employee,
//       success: true,
//       count: locations.length,
//       totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
//       data: locations,
//     });
//   } catch (error) {
//     console.error("Fetch Error:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }




//  to store a sent location for an employee

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();

//     const body = await req.json();
//     const { phone, coords } = body;

//     // 🔴 Validation
//     if (!phone || !coords?.lat || !coords?.lng) {
//       return NextResponse.json(
//         { success: false, error: "Phone or coordinates missing" },
//         { status: 400 },
//       );
//     }

//     // 🔍 Find employee by phone
//     const employee = await Employee.findOne({ phone });
//     console.log("Employee found for send location:", employee);

//     if (!employee) {
//       return NextResponse.json(
//         { success: false, error: "Employee not found" },
//         { status: 404 },
//       );
//     }
//     // Correct: store exact UTC instant
//     const timestamp = dayjs().tz("Asia/Kolkata").toDate();
//     let segmentKm = 0;

//     // --- 🛣️ INCREMENTAL DISTANCE LOGIC START ---
    
//     // Check if there's a previous location to calculate from
//     if (employee.lastKnownCoords?.lat && employee.lastLocationTimestamp) {
//       const lastUpdate = dayjs(employee.lastLocationTimestamp).tz("Asia/Kolkata");
      
//       // Only calculate if the last ping was TODAY
//       const isSameDay = dayjs().tz("Asia/Kolkata").isSame(lastUpdate, 'day');

//       if (isSameDay) {
//         const origin = `${employee.lastKnownCoords.lat},${employee.lastKnownCoords.lng}`;
//         const destination = `${coords.lat},${coords.lng}`;

//         // Only call Google if the person actually moved
//         if (origin !== destination) {
//           const apiKey = process.env.GOOGLE_MAPS_API_KEY;
//           const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;

//           const res = await fetch(url);
//           const routeData = await res.json();

//           if (routeData.status === "OK") {
//             segmentKm = routeData.routes[0].legs[0].distance.value / 1000;
//           }
//         }
//       }
//     }
//     // --- 🛣️ INCREMENTAL DISTANCE LOGIC END ---

//     // --- 💾 DATABASE UPDATES ---

//     // 1. Permanent Log: Update or Create the distance record for this specific day
//     // We use $inc to add the segmentKm to the existing totalKm
//     const updatedDailyRecord = await DailyDistance.findOneAndUpdate(
//       { employeeId: employee._id, date: timestamp },
//       { $inc: { totalKm: segmentKm } },
//       { upsert: true, new: true } // Create if doesn't exist, return the updated doc
//     );

//     // 📍 Create sent location entry
//     const sentLocation = await SentLocation.create({
//       employeeId: employee._id,
//       date: timestamp,
//       coords: {
//         lat: coords.lat,
//         lng: coords.lng,
//       },
//     });

//     // 👤 2. Update Employee state for the next check-in
//     employee.lastKnownCoords = { lat: coords.lat, lng: coords.lng };
//     employee.lastLocationTimestamp = timestamp;

//     // If you are storing total distance on the employee model:
//     // Reset to 0 if it's a new day, else increment
//     const isNewDay = !employee.lastLocationTimestamp || !dayjs().tz("Asia/Kolkata").isSame(dayjs(employee.lastLocationTimestamp).tz("Asia/Kolkata"), 'day');
//     employee.dailyDistanceKm = isNewDay ? segmentKm : (employee.dailyDistanceKm || 0) + segmentKm;

//     await employee.save();

//     return NextResponse.json({
//       success: true,
//       message: "Location stored successfully",
//       segmentAdded: Number(segmentKm.toFixed(2)),
//       totalToday: Number((employee.dailyDistanceKm || 0).toFixed(2)),
//       data: sentLocation,
//     });
//   } catch (error: any) {
//     console.error("Send Location Error:", error);

//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 },
//     );
//   }
// }


export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const date = searchParams.get("date"); // Format: YYYY-MM-DD

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone is required" }, { status: 400 });
    }

    const employee = await Employee.findOne({ phone });
    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    // Determine the Target Date String
    const targetDateStr = date || dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD");

    // 1. Get pre-calculated distance
    const distanceRecord = await DailyDistance.findOne({
      employeeId: employee._id,
      date: targetDateStr
    }) as IDailyDistance | null;

    const totalDistanceKm = distanceRecord ? distanceRecord.totalKm : 0;

    // 2. Build Query for SentLocations (History)
    const selectedDate = dayjs.tz(targetDateStr, "Asia/Kolkata");
    const start = selectedDate.startOf("day").toDate();
    const end = selectedDate.endOf("day").toDate();

    const query = {
      employeeId: employee._id,
      date: { $gte: start, $lte: end }
    };

    const locations = await SentLocation.find(query).sort({ date: 1 }).lean();

    return NextResponse.json({
      employee,
      success: true,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { phone, coords } = await req.json();

    if (!phone || !coords?.lat || !coords?.lng) {
      return NextResponse.json({ success: false, error: "Data missing" }, { status: 400 });
    }

    const employee = await Employee.findOne({ phone });
    if (!employee) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const nowIST = dayjs().tz("Asia/Kolkata");
    const todayStr = nowIST.format("YYYY-MM-DD");
    const timestamp = nowIST.toDate();
    
    // --- 🛣️ CALCULATION PRE-CHECKS ---
    let segmentKm = 0;
    const lastUpdate = employee.lastLocationTimestamp ? dayjs(employee.lastLocationTimestamp).tz("Asia/Kolkata") : null;
    const isNewDay = !lastUpdate || !nowIST.isSame(lastUpdate, 'day');

    if (employee.lastKnownCoords?.lat && !isNewDay) {
      const origin = `${employee.lastKnownCoords.lat},${employee.lastKnownCoords.lng}`;
      const destination = `${coords.lat},${coords.lng}`;

      if (origin !== destination) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;

        const res = await fetch(url);
        const routeData = await res.json();

        if (routeData.status === "OK") {
          segmentKm = routeData.routes[0].legs[0].distance.value / 1000;
        }
      }
    }

    // --- 💾 ATOMIC UPDATES ---

    // 1. Update Daily Ledger (The string 'todayStr' is key here)
    const updatedDailyRecord = await DailyDistance.findOneAndUpdate(
      { employeeId: employee._id, date: todayStr },
      { $inc: { totalKm: segmentKm } },
      { upsert: true, new: true }
    ) as IDailyDistance;

    // 2. Breadcrumb entry
    const sentLocation = await SentLocation.create({
      employeeId: employee._id,
      date: timestamp,
      coords: { lat: coords.lat, lng: coords.lng },
    });

    // 3. Update Employee State
    employee.lastKnownCoords = { lat: coords.lat, lng: coords.lng };
    employee.lastLocationTimestamp = timestamp;
    
    // Maintain redundant total on employee for quick lookups
    employee.dailyDistanceKm = isNewDay ? segmentKm : (employee.dailyDistanceKm || 0) + segmentKm;
    
    await employee.save();

    return NextResponse.json({
      success: true,
      segmentAdded: Number(segmentKm.toFixed(2)),
      totalToday: Number(updatedDailyRecord.totalKm.toFixed(2)),
      data: sentLocation,
    });
  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
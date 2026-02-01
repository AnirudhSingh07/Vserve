// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";
// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";
// import timezone from "dayjs/plugin/timezone";

// // Database & Models
// import { connectDB } from "@/lib/db";
// import Employee from "@/models/employee";
// import Attendance from "@/models/attendance";
// import DailyDistance from "@/models/dailydistance";
// import SentLocation from "@/models/sentLocation";

// // Configuration
// dayjs.extend(utc);
// dayjs.extend(timezone);
// const TZ = "Asia/Kolkata";

// export const dynamic = "force-dynamic";

// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();

//     const { searchParams } = new URL(req.url);
//     const phone = searchParams.get("phone");
//     const startMonth = searchParams.get("startMonth"); // Format: "YYYY-MM"
//     const endMonth = searchParams.get("endMonth"); // Format: "YYYY-MM"

//     // 1. Validation
//     if (!phone) {
//       return NextResponse.json(
//         { success: false, error: "Employee phone number is required" },
//         { status: 400 },
//       );
//     }

//     // 2. Fetch Employee
//     const employee = await Employee.findOne({ phone }).select(
//       "name role department phone",
//     );
//     if (!employee) {
//       return NextResponse.json(
//         { success: false, error: "Employee not found" },
//         { status: 404 },
//       );
//     }

//     // 3. Date Range Logic (Month-Month)
//     let start: dayjs.Dayjs;
//     let end: dayjs.Dayjs;

//     if (startMonth && endMonth) {
//       // Range: Start of first month to End of last month
//       start = dayjs.tz(startMonth, "YYYY-MM", TZ).startOf("month");
//       end = dayjs.tz(endMonth, "YYYY-MM", TZ).endOf("month");
//     } else if (startMonth) {
//       // Single Month selected
//       start = dayjs.tz(startMonth, "YYYY-MM", TZ).startOf("month");
//       end = dayjs.tz(startMonth, "YYYY-MM", TZ).endOf("month");
//     } else {
//       // Default: Current Month
//       start = dayjs().tz(TZ).startOf("month");
//       end = dayjs().tz(TZ).endOf("month");
//     }

//     // 4. Aggregation Filters

//     // A. Date Range Filter
//     // Note: $dayOfWeek returns 1 for Sunday
//     const sundayFilter = { $ne: [{ $dayOfWeek: "$date" }, 1] };
//     const stringDateSundayFilter = {
//       $ne: [{ $dayOfWeek: { $toDate: "$date" } }, 1],
//     };

//     // 5. Parallel Aggregation Execution
//     const [attendanceStats, distanceStats, locationStats] = await Promise.all([
//       // --- A. Attendance Summary (Excluding Sundays) ---
//       Attendance.aggregate([
//         {
//           $match: {
//             employee: employee._id,
//             date: { $gte: start.toDate(), $lte: end.toDate() },
//             $expr: sundayFilter, // Exclude Sundays
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalDays: { $sum: 1 },
//             onTimeCount: {
//               $sum: { $cond: [{ $eq: ["$status", "on-time"] }, 1, 0] },
//             },
//             lateCount: {
//               $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] },
//             },
//           },
//         },
//       ]),

//       // --- B. Travel Analytics (Summing DailyDistance, Excluding Sundays) ---
//       // Note: DailyDistance uses String dates ("YYYY-MM-DD")
//       DailyDistance.aggregate([
//         {
//           $match: {
//             employeeId: employee._id,
//             date: {
//               $gte: start.format("YYYY-MM-DD"),
//               $lte: end.format("YYYY-MM-DD"),
//             },
//             $expr: stringDateSundayFilter, // Convert string date to object to check for Sunday
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalKm: { $sum: "$totalKm" }, // Summing up daily totals
//           },
//         },
//       ]),

//       // --- C. Location Activity (Distinct Locations, Excluding Sundays) ---
//       SentLocation.aggregate([
//         {
//           $match: {
//             employeeId: employee._id,
//             date: { $gte: start.toDate(), $lte: end.toDate() },
//             $expr: sundayFilter, // Exclude Sundays
//           },
//         },
//         {
//           // Group by unique coordinates to find distinct locations visited
//           $group: {
//             _id: { lat: "$coords.lat", lng: "$coords.lng" },
//           },
//         },
//         {
//           $count: "distinctCount",
//         },
//       ]),
//     ]);

//     // 6. Data Formatting & Defaults
//     const attendance = attendanceStats[0] || {
//       totalDays: 0,
//       onTimeCount: 0,
//       lateCount: 0,
//     };
//     const travel = distanceStats[0] || { totalKm: 0 };
//     const locations = locationStats[0] || { distinctCount: 0 };

//     return NextResponse.json({
//       success: true,
//       meta: {
//         range: {
//           start: start.format("YYYY-MM-DD"),
//           end: end.format("YYYY-MM-DD"),
//         },
//         sundayExcluded: true,
//       },
//       employee: {
//         name: employee.name,
//         role: employee.role,
//         department: employee.department,
//       },
//       report: {
//         attendance: {
//           presentDays: attendance.totalDays,
//           status: {
//             onTime: attendance.onTimeCount,
//             late: attendance.lateCount,
//           },
//         },
//         travel: {
//           totalDistanceKm: Number(travel.totalKm.toFixed(2)),
//         },
//         activity: {
//           distinctLocationsVisited: locations.distinctCount,
//         },
//       },
//     });
//   } catch (error: any) {
//     console.error("Report Generation Error:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Database & Models
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import Attendance from "@/models/attendance";
import DailyDistance from "@/models/dailydistance";
import SentLocation from "@/models/sentLocation";

// Configuration
dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = "Asia/Kolkata";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const startMonth = searchParams.get("startMonth"); // Format: "YYYY-MM"
    const endMonth = searchParams.get("endMonth"); // Format: "YYYY-MM"

    // 1. Validation
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Employee phone number is required" },
        { status: 400 },
      );
    }

    // 2. Fetch Employee
    const employee = await Employee.findOne({ phone });
    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    // 3. Date Range Logic (Month-Month)
    let start: dayjs.Dayjs;
    let end: dayjs.Dayjs;

    if (startMonth && endMonth) {
      // Range: Start of first month to End of last month
      start = dayjs.tz(startMonth, "YYYY-MM", TZ).startOf("month");
      end = dayjs.tz(endMonth, "YYYY-MM", TZ).endOf("month");
    } else if (startMonth) {
      // Single Month selected
      start = dayjs.tz(startMonth, "YYYY-MM", TZ).startOf("month");
      end = dayjs.tz(startMonth, "YYYY-MM", TZ).endOf("month");
    } else {
      // Default: Current Month
      start = dayjs().tz(TZ).startOf("month");
      end = dayjs().tz(TZ).endOf("month");
    }

    // 4. Aggregation Filters

    // A. Date Range Filter
    // Note: $dayOfWeek returns 1 for Sunday
    const sundayFilter = { $ne: [{ $dayOfWeek: "$date" }, 1] };
    const stringDateSundayFilter = {
      $ne: [{ $dayOfWeek: { $toDate: "$date" } }, 1],
    };

    // 5. Parallel Aggregation Execution
    const [attendanceStats, distanceStats, locationStats] = await Promise.all([
      // --- A. Attendance Summary (Excluding Sundays + 10 AM Logic) ---
      Attendance.aggregate([
        {
          $match: {
            employee: employee._id,
            date: { $gte: start.toDate(), $lte: end.toDate() },
            $expr: sundayFilter, // Exclude Sundays
          },
        },
        {
          $group: {
            _id: null,
            totalDays: { $sum: 1 },
            onTimeCount: {
              $sum: {
                $cond: [
                  {
                    $lt: [
                      {
                        $hour: {
                          date: { $toDate: "$checkInTime" },
                          timezone: TZ,
                        },
                      },
                      10,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            lateCount: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      {
                        $hour: {
                          date: { $toDate: "$checkInTime" },
                          timezone: TZ,
                        },
                      },
                      10,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      // --- B. Travel Analytics (Summing DailyDistance, Excluding Sundays) ---
      DailyDistance.aggregate([
        {
          $match: {
            employeeId: employee._id,
            date: {
              $gte: start.format("YYYY-MM-DD"),
              $lte: end.format("YYYY-MM-DD"),
            },
            $expr: stringDateSundayFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalKm: { $sum: "$totalKm" },
          },
        },
      ]),

      // --- C. Location Activity (Distinct Locations, Excluding Sundays) ---
      SentLocation.aggregate([
        {
          $match: {
            employeeId: employee._id,
            date: { $gte: start.toDate(), $lte: end.toDate() },
            $expr: sundayFilter,
          },
        },
        {
          $group: {
            _id: { lat: "$coords.lat", lng: "$coords.lng" },
          },
        },
        {
          $count: "distinctCount",
        },
      ]),
    ]);

    // 6. Data Formatting & Defaults
    const attendance = attendanceStats[0] || {
      totalDays: 0,
      onTimeCount: 0,
      lateCount: 0,
    };
    const travel = distanceStats[0] || { totalKm: 0 };
    const locations = locationStats[0] || { distinctCount: 0 };

    return NextResponse.json({
      success: true,
      meta: {
        range: {
          start: start.format("YYYY-MM-DD"),
          end: end.format("YYYY-MM-DD"),
        },
        sundayExcluded: true,
      },
      employee: {
        name: employee.name,
        fatherName: employee.fatherName,
        role: employee.role,
        department: employee.department,
        location: employee.location,
        phone: employee.phone,
        panCard: employee.panCard,
        bankAccountNumber: employee.bankAccountNumber,
        dateOfJoining: employee.dateOfJoining,
        addressProof: employee.addressProof,
        idCardNumber: employee.idCardNumber,
      },
      report: {
        attendance: {
          presentDays: attendance.totalDays,
          status: {
            onTime: attendance.onTimeCount,
            late: attendance.lateCount,
          },
        },
        travel: {
          totalDistanceKm: Number(travel.totalKm.toFixed(2)),
        },
        activity: {
          distinctLocationsVisited: locations.distinctCount,
        },
      },
    });
  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

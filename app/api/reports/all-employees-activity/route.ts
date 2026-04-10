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
    const startMonth = searchParams.get("startMonth"); // Format: "YYYY-MM"
    const endMonth = searchParams.get("endMonth"); // Format: "YYYY-MM"

    // 1. Date Range Logic (Month-Month)
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

    // 2. Fetch All Employees
    const employees = await Employee.find({});

    // 3. Aggregation Filters
    // Note: $dayOfWeek returns 1 for Sunday
    const sundayFilter = { $ne: [{ $dayOfWeek: "$date" }, 1] };
    const stringDateSundayFilter = {
      $ne: [{ $dayOfWeek: { $toDate: "$date" } }, 1],
    };

    // Calculate total week off days (Sundays) and total days in the given range
    let totalWeekOffs = 0;
    let totalDaysInMonth = 0;
    let tempDate = start.clone();
    while (!tempDate.isAfter(end, "day")) {
      totalDaysInMonth++;
      if (tempDate.day() === 0) {
        totalWeekOffs++;
      }
      tempDate = tempDate.add(1, "day");
    }

    // 4. Parallel Aggregation Execution (for all employees simultaneously)
    const [attendanceStats, distanceStats, locationStats] = await Promise.all([
      // --- A. Attendance Summary (Excluding Sundays + 10 AM Logic) ---
      Attendance.aggregate([
        {
          $match: {
            date: { $gte: start.toDate(), $lte: end.toDate() },
            $expr: sundayFilter, // Exclude Sundays
          },
        },
        {
          $group: {
            _id: "$employee",
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
            date: {
              $gte: start.format("YYYY-MM-DD"),
              $lte: end.format("YYYY-MM-DD"),
            },
            $expr: stringDateSundayFilter,
          },
        },
        {
          $group: {
            _id: "$employeeId",
            totalKm: { $sum: "$totalKm" },
          },
        },
      ]),

      // --- C. Location Activity (Distinct Locations, Excluding Sundays) ---
      SentLocation.aggregate([
        {
          $match: {
            date: { $gte: start.toDate(), $lte: end.toDate() },
            $expr: sundayFilter,
          },
        },
        {
          $group: {
            _id: { employeeId: "$employeeId", lat: "$coords.lat", lng: "$coords.lng" },
          },
        },
        {
          $group: {
            _id: "$_id.employeeId",
            distinctCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    // 5. Build lookup maps
    const attendanceMap = new Map(attendanceStats.map((s) => [s._id?.toString(), s]));
    const distanceMap = new Map(distanceStats.map((s) => [s._id?.toString(), s]));
    const locationMap = new Map(locationStats.map((s) => [s._id?.toString(), s]));

    // 6. Map Employee Data with Reports
    const reports = employees.map((emp) => {
      const empId = emp._id.toString();
      const attendance = attendanceMap.get(empId) || {
        totalDays: 0,
        onTimeCount: 0,
        lateCount: 0,
      };
      const travel = distanceMap.get(empId) || { totalKm: 0 };
      const locations = locationMap.get(empId) || { distinctCount: 0 };

      return {
        employee: {
          name: emp.name,
          fatherName: emp.fatherName,
          role: emp.role,
          department: emp.department,
          location: emp.location,
          phone: emp.phone,
          panCard: emp.panCard,
          bankAccountNumber: emp.bankAccountNumber,
          dateOfJoining: emp.dateOfJoining,
          addressProof: emp.addressProof,
          idCardNumber: emp.idCardNumber,
        },
        report: {
          attendance: {
            totalDaysInMonth: totalDaysInMonth,
            presentDays: attendance.totalDays,
            weekOffs: totalWeekOffs,
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
      };
    });

    return NextResponse.json({
      success: true,
      meta: {
        range: {
          start: start.format("YYYY-MM-DD"),
          end: end.format("YYYY-MM-DD"),
        },
        sundayExcluded: true,
      },
      reports,
    });
  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DailyDistance from "@/models/dailydistance";
import SentLocation from "@/models/sentLocation";
import Employee from "@/models/employee";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const phone = req.nextUrl.searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone is required" },
        { status: 400 }
      );
    }

    // Find employee by phone
    const employee = await Employee.findOne({ phone });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    const employeeId = employee._id as mongoose.Types.ObjectId;

    // Today's date in IST as "YYYY-MM-DD" — matches DailyDistance date format
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const todayStr = nowIST.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // Start and end of today in UTC for SentLocation date range query
    const startOfTodayIST = new Date(
      `${todayStr}T00:00:00+05:30`
    );
    const endOfTodayIST = new Date(
      `${todayStr}T23:59:59+05:30`
    );

    // 1. Get today's KM from DailyDistance (one record per employee per day)
    const todayDistance = await DailyDistance.findOne({
      employeeId,
      date: todayStr,
    });

    const totalKm = todayDistance
      ? parseFloat((todayDistance as any).totalKm.toFixed(2))
      : 0;

    // 2. Count today's SentLocation records for this employee
    const totalLocations = await SentLocation.countDocuments({
      employeeId,
      date: { $gte: startOfTodayIST, $lte: endOfTodayIST },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          totalKm,
          totalLocations,
          date: todayStr,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("EMPLOYEE STATS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


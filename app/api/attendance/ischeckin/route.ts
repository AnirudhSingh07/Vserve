import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { phone } = await req.json();

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

    // 📅 IST day start
    const now = dayjs().tz("Asia/Kolkata");
    const todayStart = now.startOf("day").toDate();

    // 🔎 Check attendance
    const attendance = (await Attendance.findOne({
      employee: employee._id,
      date: { $gte: todayStart },
      checkedIn: true,
    }).lean()) as {
      checkInTime?: Date;
    } | null;

    return NextResponse.json({
      success: true,
      checkedIn: Boolean(attendance),
      checkInTime: attendance?.checkInTime || null,
    });
  } catch (err) {
    console.error("❌ isCheckin error:", err);

    return NextResponse.json(
      { success: false, error: "Server error during check-in verification" },
      { status: 500 },
    );
  }
}

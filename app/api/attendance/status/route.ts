import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { phone } = await req.json();
    if (!phone)
      return NextResponse.json({ success: false, error: "Phone missing" });

    const employee = await Employee.findOne({ phone });
    if (!employee)
      return NextResponse.json({ success: false, error: "Employee not found" });

    const now = dayjs();
    const currentHour = now.hour();
    const WORK_START_HOUR = 9; // 9:00 AM
    const WORK_END_HOUR = 18; // 6:00 PM

    // ⛔ Access blocked outside allowed hours
    if (currentHour < WORK_START_HOUR || currentHour >= WORK_END_HOUR) {
      return NextResponse.json({
        success: false,
        accessDenied: true,
        message:
          "Access restricted: system available between 9:00 AM and 6:00 PM only.",
      });
    }

    const today = now.startOf("day").toDate();

    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: today },
    });

    // ✅ Auto-checkout safeguard (if still checked in after 6 PM)
    if (
      attendance &&
      attendance.checkInTime &&
      !attendance.checkOutTime &&
      currentHour >= WORK_END_HOUR
    ) {
      attendance.checkOutTime = now.toDate();
      attendance.checkOutLocation = { auto: true };
      attendance.checkedIn = false;
      await attendance.save();
    }

    const checkedIn = !!(
      attendance &&
      attendance.checkInTime &&
      !attendance.checkOutTime
    );

    return NextResponse.json({
      success: true,
      checkedIn,
      accessDenied: false,
    });
  } catch (err: any) {
    console.error("❌ Attendance status error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during status check" },
      { status: 500 }
    );
  }
}

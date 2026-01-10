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
    const { phone, coords } = await req.json();

    if (!phone || !coords)
      return NextResponse.json({ success: false, error: "Missing data" });

    const employee = await Employee.findOne({ phone });
    if (!employee)
      return NextResponse.json({ success: false, error: "Employee not found" });

    // ✅ Correct working hours (9 AM to 6 PM)
    const WORK_START_HOUR = 9;   // 9:00 AM
    const WORK_END_HOUR = 18;    // 6:00 PM

    // ✅ Use IST timezone
    const now = dayjs().tz("Asia/Kolkata");
    const currentHour = now.hour();
    console.log("current hours from checkin (IST): ", currentHour);

    if (currentHour < WORK_START_HOUR || currentHour >= WORK_END_HOUR) {
      return NextResponse.json(
        {
          success: false,
          error: "Check-in allowed only between 8:00 AM and 7:00 PM.",
        },
        { status: 403 }
      );
    }

    const today = now.startOf("day").toDate();

    // ✅ Prevent double check-in
    const existing = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: today },
    });

    if (existing?.checkInTime)
      return NextResponse.json({
        success: false,
        error: "Already checked in today",
      });

    const attendance =
      existing ||
      new Attendance({
        employee: employee._id,
        date: new Date(),
      });

    attendance.checkInTime = now.toDate();
    attendance.checkInLocation = coords;
    attendance.checkedIn = true;
    await attendance.save();

    return NextResponse.json({ success: true, message: "Checked in successfully." });
  } catch (err: any) {
    console.error("❌ Check-in error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during check-in" },
      { status: 500 }
    );
  }
}

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
    const WORK_START_HOUR = 6;
    const WORK_END_HOUR = 23;

    // ⛔ Access blocked outside allowed hours
    if (currentHour < WORK_START_HOUR || currentHour >= WORK_END_HOUR) {
      return NextResponse.json({
        success: false,
        accessDenied: true,
      });
    }

    const today = now.startOf("day").toDate();
    const tomorrow = now.endOf("day").toDate();

    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: today, $lte: tomorrow },
    });

    // ✅ Auto-checkout safeguard (if still checked in after 11 PM)
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

    // ✅ Mark as absent if employee didn’t check in or out during the day
    if (!attendance) {
      attendance = new Attendance({
        employee: employee._id,
        date: now.toDate(),
        status: "Absent",
      });
      await attendance.save();
      console.log(
        `📅 Marked ${employee.name} as Absent for ${now.format("YYYY-MM-DD")}`
      );
    } else if (!attendance.checkInTime && !attendance.checkOutTime) {
      attendance.status = "Absent";
      await attendance.save();
      console.log(
        `📅 Updated ${employee.name} as Absent for ${now.format("YYYY-MM-DD")}`
      );
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
      status: attendance.status || "Absent",
    });
  } catch (err: any) {
    console.error("❌ Attendance status error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during status check" },
      { status: 500 }
    );
  }
}

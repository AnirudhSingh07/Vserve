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

    const today = dayjs().startOf("day").toDate();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: today },
    });

    const checkedIn = !!(
      attendance &&
      attendance.checkInTime &&
      !attendance.checkOutTime
    );

    return NextResponse.json({ success: true, checkedIn });
  } catch (err: any) {
    console.error("❌ Attendance status error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during status check" },
      { status: 500 }
    );
  }
}

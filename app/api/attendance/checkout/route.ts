import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone, coords } = await req.json();

    if (!phone || !coords)
      return NextResponse.json({ success: false, error: "Missing data" });

    const employee = await Employee.findOne({ phone });
    if (!employee)
      return NextResponse.json({ success: false, error: "Employee not found" });

    const today = dayjs().startOf("day").toDate();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: today },
    });

    if (!attendance?.checkInTime)
      return NextResponse.json({
        success: false,
        error: "No check-in found for today",
      });

    if (attendance.checkOutTime)
      return NextResponse.json({
        success: false,
        error: "Already checked out today",
      });

    attendance.checkOutTime = Date.now();
    attendance.checkOutLocation = coords;
    await attendance.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Check-out error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during check-out" },
      { status: 500 }
    );
  }
}

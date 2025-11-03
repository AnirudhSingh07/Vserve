import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import Attendance from "@/models/attendance"; // You must have an Attendance model
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

    // Prevent double check-in
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

    attendance.checkInTime = Date.now();
    attendance.checkInLocation = coords;
    await attendance.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Check-in error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during check-in" },
      { status: 500 }
    );
  }
}

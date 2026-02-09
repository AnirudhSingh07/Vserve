import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone, coords, auto } = await req.json(); // 'auto' optional for auto-checkout calls

    if (!phone)
      return NextResponse.json({ success: false, error: "Missing phone number" });

    const employee = await Employee.findOne({ phone });
    if (!employee)
      return NextResponse.json({ success: false, error: "Employee not found" });

    const now = dayjs();
    
   
    const today = now.startOf("day").toDate();

    // 🔍 Find today's attendance
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


 
    // ✅ Normal manual checkout (within hours)
    attendance.checkOutTime = now.toDate();
    attendance.checkOutLocation = coords;
    attendance.checkedIn = false;
    await attendance.save();

    return NextResponse.json({
      success: true,
      message: "Checked out successfully.",
    });
  } catch (err: any) {
    console.error("❌ Check-out error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during check-out" },
      { status: 500 }
    );
  }
}

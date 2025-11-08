import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/attendance";
import Employee from "@/models/employee";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    console.log("📡 [API] /api/attendance/allattendance called");

    // ✅ Fetch all attendance records and populate employee details
    const records = await Attendance.find()
      .populate("employee", "name phone email role department")
      .sort({ date: -1 });

    console.log("📋 [API] Attendance records fetched:", records.length);

    if (!records || records.length === 0) {
      console.warn("⚠️ No attendance records found in DB");
      return NextResponse.json({
        success: true,
        message: "No attendance records found",
        data: [],
      });
    }

    // 🔍 Log a few sample records to verify data structure
    console.log("🧾 Sample record[0]:", JSON.stringify(records[0], null, 2));

    // ✅ Ensure phone and employee info are correctly extracted
    const data = records.map((r) => ({
      phone: r.employee?.phone ?? "N/A", // fix: phone comes from populated employee
      name: r.employee?.name ?? "Unknown",
      email: r.employee?.email ?? "Unknown",
      department: r.employee?.department ?? "N/A",
      date: r.date,
      status: r.status ?? "—",
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      lateApproved: r.lateApproved ?? false,
    }));

    console.log("✅ [API] Processed attendance data count:", data.length);

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err: any) {
    console.error("❌ [API] Error fetching all attendance:", err);
    return NextResponse.json(
      { success: false, error: "Server error while fetching attendance" },
      { status: 500 }
    );
  }
}

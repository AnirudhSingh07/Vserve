import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/attendance";
import Employee from "@/models/employee";

// 🚀 Disable ALL caching (Vercel + Next.js + CDN)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    console.log("📡 [API] /api/allattendance called");

    // Fetch data fresh every time
    const records = await Attendance.find()
      .populate("employee", "name phone email role department")
      .sort({ date: -1 });

    console.log("📋 Total attendance records:", records.length);

    if (!records || records.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No attendance records found",
          data: [],
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    const data = records.map((r) => ({
      phone: r.employee?.phone ?? "N/A",
      name: r.employee?.name ?? "Unknown",
      email: r.employee?.email ?? "Unknown",
      department: r.employee?.department ?? "N/A",
      date: r.date,
      status: r.status ?? "—",
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      lateApproved: r.lateApproved ?? false,
    }));

    console.log("✅ Processed attendance:", data.length);

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("❌ Error fetching attendance:", err);
    return NextResponse.json(
      { success: false, error: "Server error while fetching attendance" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

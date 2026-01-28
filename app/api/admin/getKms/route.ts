import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DistanceTrack from "@/models/dailydistance";
import Employee from "@/models/employee";

// Disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // GET /api/getkms?date=2025-11-29
    const date =
      req.nextUrl.searchParams.get("date") ||
      new Date().toISOString().slice(0, 10); // default today

    // Fetch all distance records for the date
    const kmData = await DistanceTrack.find({ date });

    // Fetch employee details for mapping names
    const employees = await Employee.find({});

    // Convert employee array to dictionary for fast lookup
    const employeeMap: Record<string, any> = {};
    employees.forEach((emp) => {
      employeeMap[emp._id.toString()] = emp;
      if (emp.phone) employeeMap[emp.phone] = emp; // if employeeId is phone
    });

    // Format response
    const result = kmData.map((item) => {
      const emp = employeeMap[item.employeeId] || {};

      return {
        employeeId: item.employeeId,
        name: emp.name || "Unknown",
        phone: emp.phone || "N/A",
        totalKm: item.totalKm?.toFixed(2) || "0.00",
      };
    });

    return NextResponse.json(
      { success: true, date, data: result },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (error: any) {
    console.error("GET KMS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

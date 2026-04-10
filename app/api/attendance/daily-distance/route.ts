import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DailyDistance from "@/models/dailydistance";
import Employee from "@/models/employee";

// 🚀 Disable ALL caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    await connectDB();

    // Fetch all daily distance records with employee phone populated
    const records = await DailyDistance.find()
      .populate({
        path: "employeeId",
        select: "phone",
        model: Employee,
      })
      .lean();

    // Build a map: "phone__YYYY-MM-DD" → totalKm
    const distanceMap: Record<string, number> = {};

    for (const record of records as any[]) {
      const phone: string | undefined = record.employeeId?.phone;
      const date: string | undefined = record.date; // stored as "YYYY-MM-DD"
      if (phone && date) {
        const key = `${phone}__${date}`;
        distanceMap[key] = record.totalKm ?? 0;
      }
    }

    return NextResponse.json(
      { success: true, distanceMap },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("❌ Error fetching daily distances:", err);
    return NextResponse.json(
      { success: false, error: "Server error while fetching daily distances" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

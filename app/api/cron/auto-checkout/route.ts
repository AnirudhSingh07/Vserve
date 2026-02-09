import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";

export async function GET(req: Request) {
  // 1. Security check: Only allow Vercel's Cron to call this
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await connectDB();
    const today = dayjs().startOf("day").toDate();
    const checkoutTime = dayjs().set("hour", 20).set("minute", 0).toDate(); // 8:00 PM

    // 2. Find all records for today that have checkIn but NO checkOut
    const result = await Attendance.updateMany(
      {
        date: { $gte: today },
        checkInTime: { $exists: true },
        checkOutTime: { $exists: false },
      },
      {
        $set: {
          checkOutTime: checkoutTime.getTime(), // Storing as Number per your schema
          checkOutLocation: { lat: 0, lng: 0 }, // Placeholder for auto-checkout
          checkedIn: false,
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: `Auto-checkout completed for ${result.modifiedCount} employees.`,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 },
    );
  }
}

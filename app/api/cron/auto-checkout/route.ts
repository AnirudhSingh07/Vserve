import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await connectDB();

    // 1. Explicitly set the timezone to India (or your local zone)
    const userTimezone = "Asia/Kolkata"; 
    
    // 2. Get "Today" relative to the timezone
    const nowInTZ = dayjs().tz(userTimezone);
    const todayStart = nowInTZ.startOf("day").toDate();

    // 3. Create 8:00 PM specifically in that timezone
    const checkoutTime = nowInTZ
      .set("hour", 20)
      .set("minute", 0)
      .set("second", 0)
      .set("millisecond", 0);

    const result = await Attendance.updateMany(
      {
        date: { $gte: todayStart },
        checkInTime: { $exists: true },
        checkOutTime: { $exists: false },
      },
      {
        $set: {
          // .valueOf() returns the Unix timestamp in milliseconds
          checkOutTime: checkoutTime.valueOf(), 
          checkOutLocation: { lat: 0, lng: 0 },
          checkedIn: false,
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: `Auto-checkout completed for ${result.modifiedCount} employees at ${checkoutTime.format('hh:mm A')}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 },
    );
  }
}
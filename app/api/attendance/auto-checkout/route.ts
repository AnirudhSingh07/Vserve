import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";

export async function GET() {
  try {
    await connectDB();

    const now = dayjs();
    const today = now.startOf("day").toDate();

    const records = await Attendance.find({
      date: { $gte: today },
      checkInTime: { $exists: true },
      checkOutTime: { $exists: false },
    });

    for (const record of records) {
      record.checkOutTime = now.toDate();
      record.checkOutLocation = { auto: true };
      record.checkedIn = false;
      await record.save();
    }

    return NextResponse.json({
      success: true,
      message: `Auto-checked out ${records.length} users.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}

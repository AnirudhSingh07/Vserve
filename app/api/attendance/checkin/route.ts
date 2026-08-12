import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone, coords } = await req.json();

    if (!phone || !coords)
      return NextResponse.json({ success: false, error: "Missing data" });

    const employee = await Employee.findOne({ phone });
    if (!employee)
      return NextResponse.json({ success: false, error: "Employee not found" });

    // ✅ Correct working hours (8 AM to 7.30 PM)
    const WORK_START_HOUR = 8;   // 8:00 AM
    const WORK_END_HOUR = 19.30;    // 7:30 PM

    // ✅ Use IST timezone
    const now = dayjs().tz("Asia/Kolkata");
    const currentHour = now.hour();
    console.log("current hours from checkin (IST): ", currentHour);

    if (currentHour < WORK_START_HOUR || currentHour >= WORK_END_HOUR) {
      return NextResponse.json(
        {
          success: false,
          error: "Check-in allowed only between 8:00 AM and 7:30 PM.",
        },
        { status: 403 }
      );
    }

    const today = now.startOf("day").toDate();

    // ✅ Prevent double check-in
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

    attendance.checkInTime = now.toDate();
    attendance.checkInLocation = coords;
    attendance.checkedIn = true;

    if (coords && coords.lat !== 0 && coords.lng !== 0) {
      const OFFICE_CENTER = { lat: 22.723541, lng: 75.884507 };
      const BHOPAL_OFFICE_CENTER = { lat: 23.2349541, lng: 77.4354195 };
      
      const haversineMeters = (c1: { lat: number; lng: number }, c2: { lat: number; lng: number }) => {
        const R = 6371000;
        const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
        const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
        const lat1 = (c1.lat * Math.PI) / 180;
        const lat2 = (c2.lat * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const dIndore = haversineMeters(coords, OFFICE_CENTER);
      const dBhopal = haversineMeters(coords, BHOPAL_OFFICE_CENTER);
      const isInsideOffice = dIndore <= 200 || dBhopal <= 200;
      
      const timeStr = now.format("hh:mm A");

      if (!attendance.work_mode || attendance.work_mode === "—") {
        attendance.work_mode = isInsideOffice ? "Office" : "Field";
      }

      if (!isInsideOffice) {
        if (!attendance.first_visit || !attendance.first_visit.lat) {
          attendance.first_visit = { lat: coords.lat, lng: coords.lng, time: timeStr };
        }
      }

      attendance.last_visit = { lat: coords.lat, lng: coords.lng, time: timeStr };
    }

    await attendance.save();

    return NextResponse.json({ success: true, message: "Checked in successfully." });
  } catch (err: any) {
    console.error("❌ Check-in error:", err);
    return NextResponse.json(
      { success: false, error: "Server error during check-in" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import Attendance from "@/models/attendance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DailyDistance from "@/models/dailydistance";

dayjs.extend(utc);
dayjs.extend(timezone);

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

    // --- CHECKOUT DISTANCE CALCULATION (Same as sentloc) ---
    const nowIST = dayjs().tz("Asia/Kolkata");
    const todayStr = nowIST.format("YYYY-MM-DD");

    let segmentKm = 0;
    const hasBaseline = !!employee.lastKnownCoords?.lat;

    const lastUpdate = employee.lastLocationTimestamp
      ? dayjs(employee.lastLocationTimestamp).tz("Asia/Kolkata")
      : null;
    const isNewDay = !lastUpdate || !nowIST.isSame(lastUpdate, "day");

    if (hasBaseline && !isNewDay && coords && coords.lat && coords.lng) {
      const origin = `${employee.lastKnownCoords.lat},${employee.lastKnownCoords.lng}`;
      const destination = `${coords.lat},${coords.lng}`;

      if (origin !== destination) {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;

        try {
          const res = await fetch(url);
          const routeData = await res.json();

          if (routeData.status === "OK") {
            segmentKm = routeData.routes[0].legs[0].distance.value / 1000;
          }
        } catch (err) {
          console.error("Error fetching map api during checkout", err);
        }
      }
    }

    if (segmentKm > 0) {
      await DailyDistance.findOneAndUpdate(
        { employeeId: employee._id, date: todayStr },
        { $inc: { totalKm: segmentKm } },
        { upsert: true, new: true }
      );
    }

    if (coords && coords.lat && coords.lng) {
      await Employee.findByIdAndUpdate(employee._id, {
        $set: {
          lastKnownCoords: {
            lat: Number(coords.lat),
            lng: Number(coords.lng),
          },
          lastLocationTimestamp: nowIST.toDate(),
        },
      });
    }
    // --- END CHECKOUT DISTANCE ---

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

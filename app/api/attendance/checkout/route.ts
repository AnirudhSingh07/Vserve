import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import Attendance from "@/models/attendance";
import { getDrivingKm, isValidCoords } from "@/lib/geo";
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

    const now = dayjs().tz("Asia/Kolkata");
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
    // Recorded before the distance call so a slow or failing Directions lookup
    // can never cost the employee their check-out.
    attendance.checkOutTime = now.toDate();
    attendance.checkOutLocation = coords;
    attendance.checkedIn = false;
    await attendance.save();

    // --- CHECKOUT DISTANCE CALCULATION (same baseline rules as sentloc) ---
    const nowIST = dayjs().tz("Asia/Kolkata");
    const todayStr = nowIST.format("YYYY-MM-DD");

    // Only a baseline recorded earlier today may be measured from; otherwise
    // fall back to today's check-in position, so an employee who checked in and
    // drove straight to check-out still has that leg counted.
    const lastUpdate = employee.lastLocationTimestamp
      ? dayjs(employee.lastLocationTimestamp).tz("Asia/Kolkata")
      : null;
    const baselineIsFromToday = !!lastUpdate && nowIST.isSame(lastUpdate, "day");

    let origin: { lat: number; lng: number } | null = null;

    if (baselineIsFromToday && isValidCoords(employee.lastKnownCoords)) {
      origin = employee.lastKnownCoords;
    } else if (isValidCoords(attendance.checkInLocation)) {
      origin = attendance.checkInLocation;
    }

    const segmentKm = await getDrivingKm(origin, coords);

    if (segmentKm > 0) {
      await DailyDistance.findOneAndUpdate(
        { employeeId: employee._id, date: todayStr },
        { $inc: { totalKm: segmentKm } },
        { upsert: true, new: true }
      );

      // Keep the attendance ledger in step with the daily ledger. The admin
      // table prefers Attendance.km whenever it is non-zero, so leaving this
      // out dropped the final leg from the figure shown for anyone who had
      // tagged at least one location during the day.
      await Attendance.updateOne(
        { _id: attendance._id },
        { $inc: { km: segmentKm } }
      );
    }

    if (isValidCoords(coords)) {
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

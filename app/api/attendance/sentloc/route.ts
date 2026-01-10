import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Employee from "@/models/employee";
import SentLocation from "@/models/sentLocation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { connectDB } from "@/lib/db"; // adjust if your path differs

dayjs.extend(utc);
dayjs.extend(timezone);

//  to get specific sent locations for an employee (by phone) and optional date filter
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const date = searchParams.get("date"); // optional

    // 🔴 Validation
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone is required" },
        { status: 400 }
      );
    }

    // 🔍 Find employee
    const employee = await Employee.findOne({ phone });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    // 🧠 Build query
    const query: any = {
      employeeId: employee._id,
    };

    // 📅 Date filter (optional)
    if (date) {
      // ✅ Use IST timezone
      const now = dayjs().tz("Asia/Kolkata");
      const start = now.toDate();
      start.setHours(0, 0, 0, 0);

      const end = now.toDate();
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    // 📍 Fetch sent locations
    const locations = await SentLocation.find(query).sort({ date: 1 }).lean();

    return NextResponse.json({
      employee,
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error("Fetch SentLocation Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

//  to store a sent location for an employee
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { phone, coords } = body;

    // 🔴 Validation
    if (!phone || !coords?.lat || !coords?.lng) {
      return NextResponse.json(
        { success: false, error: "Phone or coordinates missing" },
        { status: 400 }
      );
    }

    // 🔍 Find employee by phone
    const employee = await Employee.findOne({ phone });
    console.log("Employee found for send location:", employee);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }
    // Correct: store exact UTC instant
    const timestamp = dayjs().tz("Asia/Kolkata").toDate();

    // 📍 Create sent location entry
    const sentLocation = await SentLocation.create({
      employeeId: employee._id,
      date: timestamp,
      coords: {
        lat: coords.lat,
        lng: coords.lng,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Location stored successfully",
      data: sentLocation,
    });
  } catch (error: any) {
    console.error("Send Location Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import LeaveRequest from "@/models/leaverequest";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      phoneNo,
      leaveFrom,
      leaveTo,
      numberOfDays,
      subject,
      message,
      halfDaySlot, // This is the key field from your frontend
    } = body;

    const employee = await Employee.findOne({ phone: phoneNo });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    // Basic Validation
    if (!employee._id || !leaveFrom || !leaveTo || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }


    // IMPROVED LOGIC:
    // Only save the slot if the frontend explicitly sent it (Morning or Afternoon)
    // This handles your "Half Day as 1 day" change correctly.
    const isHalfDay = halfDaySlot === "Morning" || halfDaySlot === "Afternoon";

    const newRequest = await LeaveRequest.create({
      employeeId: employee._id,
      employeeName: employee.name,
      leaveFrom: new Date(leaveFrom),
      leaveTo: new Date(leaveTo),
      numberOfDays,
      subject,
      message,
      // If it's a half-day, save the slot. If not, explicitly save null.
      halfDaySlot: isHalfDay ? halfDaySlot : null,
      status: "Pending",
    });

    return NextResponse.json(
      { message: "Leave request submitted successfully", data: newRequest },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { error: "Failed to submit leave request" },
      { status: 500 },
    );
  }
}

// GET remains the same
export async function GET(req: Request) {
  try {
    await connectDB();
    const allRequests = await LeaveRequest.find({})
      .sort({ createdAt: -1 })
      .populate("employeeId", "department role phone");

    return NextResponse.json(
      { count: allRequests.length, data: allRequests },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

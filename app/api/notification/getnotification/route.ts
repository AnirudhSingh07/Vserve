import { NextResponse } from "next/server";
import mongoose from "mongoose";
import LeaveRequest from "@/models/leaverequest"; // Adjust path as needed
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";

//  GET : employee fetches their own leave requests to see status

export async function POST(req: Request) {
  try {
    await connectDB();

    const { phoneNo } = await req.json();

    const employee = await Employee.findOne({ phone: phoneNo });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 400 });
    }

    const employeeId = employee._id;

    const leaveRequest = await LeaveRequest.find({ employeeId });

    return NextResponse.json({ data: leaveRequest }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json({
      error: "Failed to fetch leave requests",
    }, { status: 500 });
  }
}

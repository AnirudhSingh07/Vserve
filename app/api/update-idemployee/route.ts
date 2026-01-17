import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { id, idCardNumber } = await request.json();

    // ✅ Validation
    if (!id || !idCardNumber) {
      return NextResponse.json(
        { success: false, error: "ID and idCardNumber are required" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid employee ID" },
        { status: 400 },
      );
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { idCardNumber },
      { new: true },
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, employee }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Update ID error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

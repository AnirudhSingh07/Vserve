import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { id } = await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid employee ID" },
        { status: 400 },
      );
    }


    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 },
      );
    }


    // ✅ SINGLE response — MUST return
    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
      data: deletedEmployee._id,
    });
  } catch (error: any) {
    console.error("❌ Delete employee error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

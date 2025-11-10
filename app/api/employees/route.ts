import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";

export async function GET() {
  try {
    await connectDB();

    // ✅ Find all employees except those with role 'admin'
    const employees = await Employee.find({ role: { $ne: "admin" } });

    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

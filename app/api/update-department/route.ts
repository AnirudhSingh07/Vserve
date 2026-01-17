import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { id, department } = await request.json();
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { department },
      { new: true }
    );
    if (!updatedEmployee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, employee: updatedEmployee },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";

export async function POST(req: Request) {
  try {
    await connectDB();

    // Parse request body
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Employee name is required." },
        { status: 400 }
      );
    }

    // Find and delete the employee
    const deletedEmployee = await Employee.findOneAndDelete({ phone });

    if (!deletedEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee not found." },
        { status: 404 }
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: "Employee deleted successfully.",
        deletedEmployee,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { location , id } = await request.json();

    // Here, you would typically get the authenticated user's ID from the session or token
    const userId = id; // Replace with actual user ID retrieval logic
    console.log("✅ Updating location for user ID:", userId);

    // Update the employee's location
    const updatedEmployee = await Employee.findByIdAndUpdate(
      userId,
      { location },
      { new: true }
    );
    console.log("✅ Updated employee location:", updatedEmployee);
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

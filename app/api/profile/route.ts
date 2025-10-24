import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";

export async function GET() {
  try {
    await connectDB();

    // Return all fields except passwordHash
    const employees = await Employee.find().select("-passwordHash");

    return NextResponse.json({ success: true, employees });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

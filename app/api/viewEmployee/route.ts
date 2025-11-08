import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";

export async function GET(req: Request) {
  try {
    await connectDB();

    // extract ?id=... from query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing employee ID" },
        { status: 400 }
      );
    }

    // find employee by _id
    const user = await Employee.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // return clean data with id alias
    return NextResponse.json({
      employee: {
        id: user._id.toString(),
        ...user.toObject(),
      },
    });
  } catch (err: any) {
    console.error("Error fetching employee:", err);
    return NextResponse.json(
      { error: "Server error while fetching employee" },
      { status: 500 }
    );
  }
}

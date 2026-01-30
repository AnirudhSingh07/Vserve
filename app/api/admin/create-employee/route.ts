import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    // Parse the request body
    const bodyText = await req.text();
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const {
      phone,
      password,
      name,
      role,
      fatherName,
      panCard,
      bankAccountNumber,
      dateOfJoining,
      addressProof,
      department,
      location,
    } = data;

    // Validation
    if (
      !phone ||
      !password ||
      !name ||
      !role ||
      !fatherName ||
      !panCard ||
      !bankAccountNumber ||
      !dateOfJoining ||
      !department ||
      !addressProof ||
      !location
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate phone format
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit mobile number" },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 },
      );
    }

    // Check if phone already exists
    const existing = await Employee.findOne({ phone });
    if (existing) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 },
      );
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new employee
    const employee = await Employee.create({
      phone,
      passwordHash: hash,
      name,
      role,
      fatherName,
      panCard,
      bankAccountNumber,
      dateOfJoining: new Date(dateOfJoining),
      location,
      department,
      addressProof,
    });

    // ✅ Return success WITHOUT JWT token or cookie
    // This ensures the admin stays logged in and the new employee is NOT logged in
    return NextResponse.json({
      success: true,
      message: "Employee created successfully",
      employee: {
        id: employee._id,
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
        department: employee.department,
        location: employee.location,
      },
    });
  } catch (err) {
    console.error("Employee creation error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

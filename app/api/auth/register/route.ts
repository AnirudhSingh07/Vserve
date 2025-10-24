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
      idCardNumber,
    } = data;

    // Validation
    if (!phone || !password || !name || !role || !fatherName || !panCard || !bankAccountNumber || !dateOfJoining || !addressProof || !idCardNumber) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if phone already exists
    const existing = await Employee.findOne({ phone });
    if (existing) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
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
      addressProof,
      idCardNumber,
    });

    return NextResponse.json({
      success: true,
      employee: { id: employee._id, phone: employee.phone, role: employee.role },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt"; // ✅ use centralized JWT utils

export async function POST(req: Request) {
  await connectDB();

  const { phone, password } = await req.json();

  if (!phone || !password) {
    return NextResponse.json(
      { error: "Phone and password required" },
      { status: 400 }
    );
  }

  // 🔹 Find employee
  const employee = await Employee.findOne({ phone });
  if (!employee) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 🔹 Verify password
  const valid = await bcrypt.compare(password, employee.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 🔹 Generate token using lib/jwt.ts
  const token = signToken({ sub: employee._id, role: employee.role });

  // 🔹 Prepare success response
  const response = NextResponse.json({
    success: true,
    message: "Login successful",
    employee: {
      id: employee._id,
      phone: employee.phone,
      role: employee.role,
    },
  });

  // 🔹 Store token in secure HttpOnly cookie
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}

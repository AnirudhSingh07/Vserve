import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Employee from "@/models/employee"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string

export async function POST(req: Request) {
  await connectDB()
  const { phone, password } = await req.json()

  if (!phone || !password) {
    return NextResponse.json({ error: "Phone and password required" }, { status: 400 })
  }

  const employee = await Employee.findOne({ phone })
  if (!employee) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const valid = await bcrypt.compare(password, employee.passwordHash)
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const token = jwt.sign({ sub: employee._id, role: employee.role }, JWT_SECRET, { expiresIn: "1d" })

  return NextResponse.json({
    success: true,
    token,
    employee: { id: employee._id, phone: employee.phone, role: employee.role },
  })
}

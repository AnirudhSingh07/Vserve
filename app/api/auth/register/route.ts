import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Employee from "@/models/employee"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    await connectDB()
    const { phone, password, name, role } = await req.json()

    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password required" }, { status: 400 })
    }

    const existing = await Employee.findOne({ phone })
    if (existing) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)
    const employee = await Employee.create({ phone, passwordHash: hash, name, role })

    return NextResponse.json({
      success: true,
      employee: { id: employee._id, phone: employee.phone, role: employee.role },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import Employee from "@/models/employee";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = verifyToken(token);
    await connectDB();
    const employee = await Employee.findById(decoded.sub);
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ employee });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

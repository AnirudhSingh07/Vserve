import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import Employee from "@/models/employee";
import { connectDB } from "@/lib/db";

// ⚡ Make this route dynamic for edge/serverless runtime
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // ✅ Get the token from cookies instead of Authorization header
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { loggedIn: false, message: "No token found" },
        { status: 401 }
      );
    }

    // ✅ Verify token using lib/jwt.ts
    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { loggedIn: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // ✅ Connect to DB and fetch user
    await connectDB();
    const employee = await Employee.findById(decoded.sub).select(
      "-passwordHash"
    );
    if (!employee) {
      return NextResponse.json(
        { loggedIn: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Return user data if valid
    return NextResponse.json({
      loggedIn: true,
      user: employee,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { loggedIn: false, message: "Authentication failed" },
      { status: 401 }
    );
  }
}

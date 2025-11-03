import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export const getUserFromRequest = (req: NextRequest) => {
  const token =
    req.headers.get("authorization")?.split(" ")[1] ||
    req.cookies.get("token")?.value;

  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded;
};

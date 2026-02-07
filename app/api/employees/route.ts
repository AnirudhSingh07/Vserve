import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";

// export async function GET() {
//   try {
//     await connectDB();
//     const employees = await Employee.find({});
//     return NextResponse.json({ success: true, employees });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// 🚀 This tells Next.js and Vercel to NEVER cache this API route
 export const dynamic = "force-dynamic";
export const revalidate = 0; // disable ISR (Incremental Static Regeneration)
 export const fetchCache = "force-no-store"; // for Next.js 14+

export async function GET() {
  try {
    await connectDB();
    console.log("✅ Fetching latest employee data from DB...");
    const employees = await Employee.find({});
    return NextResponse.json({ success: true, employees },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


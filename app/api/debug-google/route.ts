import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { origin, destination } = await req.json();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Direct .env se key uthayega

    if (!apiKey) {
      return NextResponse.json({ status: "ERROR", error_message: "API Key not found in .env file" }, { status: 500 });
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;
    
    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: "FETCH_FAILED", error: "Server error" }, { status: 500 });
  }
}
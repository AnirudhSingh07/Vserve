import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DistanceTrack from "@/models/dailydistance";

// Disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Get Real Road Distance Using OpenRouteService
async function getRoadDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenRouteService API key missing. Add ORS_API_KEY in .env.local",
    );
  }

  const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

  const payload = {
    coordinates: [
      [lon1, lat1],
      [lon2, lat2],
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  const meters = json?.routes?.[0]?.summary?.distance || 0;
  return meters / 1000; // Convert meters → KM
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Accept employeeId OR phone (fallback)
    const employeeId: string = body.employeeId || body["phone"];

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId is required" },
        { status: 400 },
      );
    }

    const { lat, lng } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat and lng required" },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    // Fetch record for TODAY
    let record = await DistanceTrack.findOne({ employeeId, date: today });

    if (!record) {
      // FIRST ENTRY OF THE DAY
      record = await DistanceTrack.create({
        employeeId,
        date: today,
        lastLat: lat,
        lastLng: lng,
        totalKm: 0,
      });

      return NextResponse.json({
        success: true,
        message: "First location recorded",
        totalKm: 0,
      });
    }

    let addedKm = 0;

    // If previous location exists → calculate real road distance
    if (record.lastLat && record.lastLng) {
      addedKm = await getRoadDistance(record.lastLat, record.lastLng, lat, lng);
    }

    // Update record
    record.lastLat = lat;
    record.lastLng = lng;
    record.totalKm += addedKm;

    await record.save();

    return NextResponse.json({
      success: true,
      addedKm: addedKm.toFixed(3),
      totalKm: record.totalKm.toFixed(2),
    });
  } catch (error: any) {
    console.error("TRACK-LOC ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

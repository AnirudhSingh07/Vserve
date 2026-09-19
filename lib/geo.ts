/**
 * Shared geo + distance helpers.
 *
 * Every route that measures travel (check-in, send-location, check-out) used to
 * carry its own copy of the haversine formula, the office coordinates and the
 * Google Directions call. They are centralised here so the office list, the
 * geofence radius and the "how do we measure a leg" rules can only ever have
 * one definition.
 */

export type Coords = { lat: number; lng: number };

export const OFFICE_CENTERS: Coords[] = [
  { lat: 22.723541, lng: 75.884507 },   // Indore
  { lat: 23.2349541, lng: 77.4354195 }, // Bhopal
];

/** An employee within this many metres of an office is treated as "at office". */
export const OFFICE_RADIUS_M = 200;

/**
 * Legs shorter than this are treated as no movement.
 *
 * GPS jitter means two readings taken at the same desk are never byte-identical.
 * Without this floor, Google snaps both readings to the nearest road and hands
 * back a few hundred metres of "travel" for someone who never left the building.
 */
export const MIN_SEGMENT_M = 100;

/** Abort a slow Directions call rather than burn function time waiting on it. */
const DIRECTIONS_TIMEOUT_MS = 8000;

export function haversineMeters(c1: Coords, c2: Coords): number {
  const R = 6371000;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const lat1 = (c1.lat * Math.PI) / 180;
  const lat2 = (c2.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** True when the reading is a usable fix (the auto-checkout cron writes 0,0). */
export function isValidCoords(coords: any): coords is Coords {
  return (
    !!coords &&
    typeof coords.lat === "number" &&
    typeof coords.lng === "number" &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    !(coords.lat === 0 && coords.lng === 0)
  );
}

export function isInsideOffice(coords: Coords): boolean {
  return OFFICE_CENTERS.some(
    (office) => haversineMeters(coords, office) <= OFFICE_RADIUS_M,
  );
}

/**
 * Driving distance in km between two points, or 0 when it cannot be measured.
 *
 * Never throws: a Google outage, a bad key or a timeout costs us the kilometres
 * for that one leg, it must not fail the caller's request — losing the location
 * breadcrumb or the check-out itself would be far worse than losing the number.
 */
export async function getDrivingKm(
  origin: Coords | null | undefined,
  destination: Coords | null | undefined,
): Promise<number> {
  if (!isValidCoords(origin) || !isValidCoords(destination)) return 0;
  if (haversineMeters(origin, destination) < MIN_SEGMENT_M) return 0;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY is not set — distance not measured");
    return 0;
  }

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.lat},${destination.lng}` +
    `&mode=driving&key=${apiKey}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(DIRECTIONS_TIMEOUT_MS),
    });
    const routeData = await res.json();

    if (routeData.status === "OK") {
      const meters = routeData.routes?.[0]?.legs?.[0]?.distance?.value;
      return typeof meters === "number" ? meters / 1000 : 0;
    }

    console.error(
      "Google Directions error:",
      routeData.status,
      routeData.error_message || "no error message",
    );
    return 0;
  } catch (err) {
    console.error("Google Directions request failed:", err);
    return 0;
  }
}

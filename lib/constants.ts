export const OFFICE_CENTER = { lat: 22.99793312024704, lng: 76.06059952886626 }; // (example)22.99793312024704, 76.06059952886626
export const OFFICE_RADIUS_METERS = 200000; // 200m

export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isWithinCheckinWindow(now: Date) {
  // 9:30–10:00 AM local
  const start = new Date(now);
  start.setHours(9, 30, 0, 0);
  const end = new Date(now);
  end.setHours(10, 0, 0, 0);
  return now >= start && now <= end;
}

export function todayKey(d: Date = new Date()) {
  return d.toISOString().slice(0, 10);
}

/**
 * Applies the work_mode / first_visit / last_visit fields to an attendance
 * document from a single location reading.
 *
 * Check-in and send-location both derive these the same way; keeping one copy
 * means the office geofence and the "first visit is the first reading taken
 * away from an office" rule cannot drift apart between the two routes.
 *
 * Mutates the document in place. The caller decides when to save.
 */
import { isInsideOffice, isValidCoords, type Coords } from "@/lib/geo";

export function applyVisitFields(
  attendance: any,
  coords: Coords,
  timeStr: string,
): void {
  if (!isValidCoords(coords)) return;

  const atOffice = isInsideOffice(coords);

  if (!attendance.work_mode || attendance.work_mode === "—") {
    attendance.work_mode = atOffice ? "Office" : "Field";
  }

  if (!atOffice && (!attendance.first_visit || !attendance.first_visit.lat)) {
    attendance.first_visit = { lat: coords.lat, lng: coords.lng, time: timeStr };
  }

  attendance.last_visit = { lat: coords.lat, lng: coords.lng, time: timeStr };
}

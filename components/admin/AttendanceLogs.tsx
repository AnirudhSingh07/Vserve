"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Download,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowRight,
  Loader2,
  MapPin,
  Building,
  User,
  Navigation,
} from "lucide-react";

type AttendanceRow = {
  phone: string;
  date: string;
  name: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  location?: string;
  department?: string;
};

interface AttendanceLogsProps {
  attRows: AttendanceRow[];
  downloadCSV: () => void;
  users?: { name?: string; phone: string; role?: string; department?: string; location?: string }[];
  totalEmployees?: number;
  // Map of "phone__YYYY-MM-DD" → totalKm for the daily distance column
  dailyDistanceMap?: Record<string, number>;
}

const LocationCountCell = ({ phone, date }: { phone: string; date: string }) => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Replicate the exact date formatting used in handleRowClick
  const formattedDate = date.split("T")[0].split(" ")[0];

  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `/api/attendance/sentloc?phone=${phone}&date=${formattedDate}`
        );
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            // Get total location length and subtract the ones we don't want
            const totalLocations = result.data.length;
            const invalidLocations = result.data.filter(
              (loc: any) => loc.isCheckIn || loc.isCheckOut || loc.hashalt
            ).length;
            
            const validCount = totalLocations - invalidLocations;
            
            if (isMounted) setCount(validCount);
          } else {
            if (isMounted) setCount(0);
          }
        } else {
          if (isMounted) setCount(0);
        }
      } catch (err) {
        if (isMounted) setCount(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLocations();

    return () => {
      isMounted = false;
    };
  }, [phone, formattedDate]);

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin text-slate-300" />;
  }

  if (count === 0 || count === null) {
    return <span className="text-gray-400">--</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-gray-700 ">
      {count}
    </span>
  );
};

// Office location constants (must match dashboard/page.tsx)
const OFFICE_CENTER = { lat: 22.723541, lng: 75.884507 };
const BHOPAL_OFFICE_CENTER = { lat: 23.2349541, lng: 77.4354195 };
const OFFICE_RADIUS_METERS = 200;

const haversineMeters = (c1: { lat: number; lng: number }, c2: { lat: number; lng: number }) => {
  const R = 6371000;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const lat1 = (c1.lat * Math.PI) / 180;
  const lat2 = (c2.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const WorkModeCell = ({ phone, date, onModeLoaded }: { phone: string; date: string; onModeLoaded?: (mode: string) => void }) => {
  const [mode, setMode] = useState<"office" | "field" | null>(null);
  const [loading, setLoading] = useState(true);

  const formattedDate = date.split("T")[0].split(" ")[0];

  useEffect(() => {
    let isMounted = true;
    const fetchFirstVisit = async () => {
      try {
        const res = await fetch(
          `/api/attendance/sentloc?phone=${phone}&date=${formattedDate}`
        );
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.length > 0) {
            // Find the first valid location (including check-in, excluding check-out and 0,0)
            const firstVisit = result.data.find((loc: any) => {
              if (!loc.coords || typeof loc.coords.lat !== "number") return false;
              if (loc.coords.lat === 0 && loc.coords.lng === 0) return false;
              if (loc.isCheckOut) return false;
              return true;
            });

            if (firstVisit && isMounted) {
              const dIndore = haversineMeters(firstVisit.coords, OFFICE_CENTER);
              const dBhopal = haversineMeters(firstVisit.coords, BHOPAL_OFFICE_CENTER);
              const insideOffice =
                dIndore <= OFFICE_RADIUS_METERS || dBhopal <= OFFICE_RADIUS_METERS;
              setMode(insideOffice ? "office" : "field");
              if (onModeLoaded) onModeLoaded(insideOffice ? "Office" : "Field");
            } else if (isMounted) {
              setMode(null);
              if (onModeLoaded) onModeLoaded("—");
            }
          } else {
            if (isMounted) setMode(null);
            if (onModeLoaded) onModeLoaded("—");
          }
        } else {
          if (isMounted) setMode(null);
          if (onModeLoaded) onModeLoaded("—");
        }
      } catch {
        if (isMounted) setMode(null);
        if (onModeLoaded) onModeLoaded("—");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFirstVisit();
    return () => { isMounted = false; };
  }, [phone, formattedDate]);

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin text-slate-300" />;
  }

  if (mode === null) {
    return <span className="text-gray-400">--</span>;
  }

  return mode === "field" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
      <MapPin className="w-3 h-3" /> Field
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
      <Building className="w-3 h-3" /> Office
    </span>
  );
};

// ── First Visit / Last Visit Cell ──────────────────────────────────────────
// Reuses the same sentloc API and office-radius logic from the sentlocation page.
const FirstLastVisitCell = ({ phone, date }: { phone: string; date: string }) => {
  const [firstVisit, setFirstVisit] = useState<{ lat: number; lng: number; time: string } | null>(null);
  const [lastVisit, setLastVisit] = useState<{ lat: number; lng: number; time: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const formattedDate = date.split("T")[0].split(" ")[0];

  useEffect(() => {
    let isMounted = true;
    const fetchVisits = async () => {
      try {
        const res = await fetch(
          `/api/attendance/sentloc?phone=${phone}&date=${formattedDate}`
        );
        if (!res.ok) { if (isMounted) setLoading(false); return; }

        const result = await res.json();
        if (!result.success || !result.data || result.data.length === 0) {
          if (isMounted) setLoading(false);
          return;
        }

        const locs: any[] = result.data;

        // First Visit: first location OUTSIDE office radius (same as sentlocation page)
        const first = locs.find((loc: any) => {
          if (!loc.coords || typeof loc.coords.lat !== "number") return false;
          if (loc.coords.lat === 0 && loc.coords.lng === 0) return false;
          const dIndore = haversineMeters(loc.coords, OFFICE_CENTER);
          const dBhopal = haversineMeters(loc.coords, BHOPAL_OFFICE_CENTER);
          return dIndore > OFFICE_RADIUS_METERS && dBhopal > OFFICE_RADIUS_METERS;
        });

        // Last Visit: last valid non-0,0 location (same as sentlocation page)
        let last = null;
        for (let i = locs.length - 1; i >= 0; i--) {
          const loc = locs[i];
          if (!loc.coords) continue;
          if (loc.coords.lat === 0 && loc.coords.lng === 0) continue;
          last = loc;
          break;
        }

        if (isMounted) {
          if (first) {
            setFirstVisit({
              lat: first.coords.lat,
              lng: first.coords.lng,
              time: new Date(first.date).toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit",
              }),
            });
          }
          if (last) {
            setLastVisit({
              lat: last.coords.lat,
              lng: last.coords.lng,
              time: new Date(last.date).toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit",
              }),
            });
          }
        }
      } catch {
        // silently fail
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVisits();
    return () => { isMounted = false; };
  }, [phone, formattedDate]);

  if (loading) {
    return (
      <>
        <td className="px-3 sm:px-4 py-2"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></td>
        <td className="px-3 sm:px-4 py-2"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></td>
      </>
    );
  }

  const renderVisit = (visit: { lat: number; lng: number; time: string } | null, color: string) => {
    if (!visit) return <span className="text-gray-400">--</span>;
    return (
      <a
        href={`https://www.google.com/maps?q=${visit.lat},${visit.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1 text-xs font-medium ${color} hover:underline`}
        title={`${visit.lat.toFixed(6)}, ${visit.lng.toFixed(6)}`}
      >
        <Navigation className="w-3 h-3" />
        {visit.time}
      </a>
    );
  };

  return (
    <>
      <td className="px-3 sm:px-4 py-2">{renderVisit(firstVisit, "text-green-600")}</td>
      <td className="px-3 sm:px-4 py-2">{renderVisit(lastVisit, "text-red-600")}</td>
    </>
  );
};

type DateFilterType = "today" | "yesterday" | "date" | "range" | "all";

export default function AttendanceLogs({
  attRows,
  downloadCSV,
  totalEmployees,
  dailyDistanceMap = {},
  users = [],
}: AttendanceLogsProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("today");
  const workModesRef = useRef<Record<string, string>>({});

  const [allReportMonth, setAllReportMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [fromDate, setFromDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // ✅ New Helper function to format time to 12-hour format
  function formatTo12Hour(timeStr?: string) {
    if (!timeStr || timeStr === "—") return "—";

    // 1. If the string already contains AM or PM, it's already formatted.
    // We can just clean up the seconds if you want.
    if (
      timeStr.toLowerCase().includes("am") ||
      timeStr.toLowerCase().includes("pm")
    ) {
      const [time, modifier] = timeStr.split(" "); // ["5:46:41", "PM"]
      const parts = time.split(":");
      return `${parts[0]}:${parts[1]} ${modifier}`; // Returns "05:46 PM"
    }

    // 2. Fallback logic for 24-hour strings (like "17:46:00")
    const parts = timeStr.split(":");
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  }

  function extractDate(input: string) {
    const date = new Date(input);
    if (isNaN(date.getTime())) return input;

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  function normalizeDate(input: string) {
    const date = new Date(input);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  }

  // Build the lookup key used in dailyDistanceMap
  function buildDistanceKey(phone: string, date: string): string {
    return `${phone}__${normalizeDate(date)}`;
  }

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  function getYesterdayDate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }

  // ─── NEW: All Employees Monthly Report Download ────────────────────────────
  const handleDownloadAllEmployeesReport = async () => {
    try {
      setIsDownloadingAll(true);
      const res = await fetch(`/api/reports/all-employees-activity?startMonth=${allReportMonth}&endMonth=${allReportMonth}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert("Failed to fetch data: " + (data.error || "Unknown error"));
        return;
      }

      // Convert to CSV
      const rows = [];
      // Header
      rows.push([
        "Name", "Phone", "Department", "Role",
        "Total Month Days", "Present Days", "Week Offs", "On-Time", "Late",
        "Total Distance (km)", "Distinct Locations"
      ].join(","));

      for (const item of data.reports) {
        const { employee, report } = item;
        const { name, phone, department, role } = employee || {};
        const totalMonthDays = report?.attendance?.totalDaysInMonth || 0;
        const present = report?.attendance?.presentDays || 0;
        const weekOffs = report?.attendance?.weekOffs || 0;
        const onTime = report?.attendance?.status?.onTime || 0;
        const late = report?.attendance?.status?.late || 0;
        const dist = report?.travel?.totalDistanceKm || 0;
        const distinct = report?.activity?.distinctLocationsVisited || 0;

        const cell = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;
        rows.push([
          cell(name), cell(phone), cell(department), cell(role),
          cell(totalMonthDays), cell(present), cell(weekOffs), cell(onTime), cell(late), cell(dist), cell(distinct)
        ].join(","));
      }

      const csvContent = rows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `all_employees_report_${allReportMonth}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      alert("Error generating report");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  // ─── NEW: Work Duration Report CSV Download ─────────────────────────────────
  const handleDownloadCSV = async () => {
    try {
      setIsDownloadingCSV(true);

      // Fetch distinct locations map in bulk for the CSV to use synchronously
      let distinctLocationsMap: Record<string, number> = {};
      const locRes = await fetch("/api/attendance/distinct-locations");
      if (locRes.ok) {
        const locData = await locRes.json();
        distinctLocationsMap = locData.locationMap || {};
      }

    // Helper: parse time string (12h or 24h) → total minutes from midnight
    function parseTimeToMinutes(timeStr?: string): number | null {
      if (!timeStr || timeStr === "—") return null;

      let hours = 0;
      let minutes = 0;

      if (
        timeStr.toLowerCase().includes("am") ||
        timeStr.toLowerCase().includes("pm")
      ) {
        // 12-hour format: "10:21 AM" / "02:27 PM"
        const [timePart, meridiem] = timeStr.trim().split(" ");
        const [h, m] = timePart.split(":").map(Number);
        hours = meridiem.toUpperCase() === "PM" && h !== 12 ? h + 12 : h;
        if (meridiem.toUpperCase() === "AM" && h === 12) hours = 0;
        minutes = m;
      } else {
        // 24-hour format: "09:48" / "09:48:00"
        const parts = timeStr.split(":");
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
      }

      return hours * 60 + minutes;
    }

    // Helper: compute HH:MM duration between checkIn and checkOut
    function computeDuration(checkIn?: string, checkOut?: string): string {
      const inMin = parseTimeToMinutes(checkIn);
      const outMin = parseTimeToMinutes(checkOut);
      if (inMin === null || outMin === null) return "00:00";
      const diff = outMin - inMin;
      if (diff <= 0) return "00:00";
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    // Helper: convert any time string to 12-hour format (e.g. "02:27 PM")
    function toReportTime(timeStr?: string): string {
      if (!timeStr || timeStr === "—") return "";

      let hours = 0;
      let minutes = 0;

      const lower = timeStr.toLowerCase();
      if (lower.includes("am") || lower.includes("pm")) {
        // Already 12-hour: "10:21 AM" or "2:27 PM"
        const isPM = lower.includes("pm");
        const timePart = timeStr.trim().split(" ")[0]; // "10:21"
        const parts = timePart.split(":");
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
        // Normalise to 24h first so we can re-format consistently
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
      } else {
        // 24-hour string: "14:27" or "14:27:00"
        const parts = timeStr.split(":");
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
      }

      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 === 0 ? 12 : hours % 12;
      return `${String(h12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
    }

    // Helper: escape CSV cell value
    function cell(val: string): string {
      return `"${String(val).replace(/"/g, '""')}"`;
    }

    // ── Step 1: Generate ALL dates in the full range (min → max) ───────────
    const presentDates = filteredRows
      .map((r) => normalizeDate(r.date))
      .filter(Boolean);

    let allDates: string[] = [];
    if (presentDates.length === 0) {
      if (dateFilterType === "today") allDates = [getTodayDate()];
      else if (dateFilterType === "yesterday") allDates = [getYesterdayDate()];
      else if (dateFilterType === "date") allDates = [selectedDate];
      else if (dateFilterType === "range") {
        const cursor = new Date(fromDate + "T00:00:00Z");
        const end = new Date(toDate + "T00:00:00Z");
        while (cursor <= end) {
          allDates.push(cursor.toISOString().split("T")[0]);
          cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
      } else {
        setIsDownloadingCSV(false);
        return; // nothing to download for 'all' time if absolutely no records exist
      }
    } else {
      const minDate = presentDates.reduce((a, b) => (a < b ? a : b));
      const maxDate = presentDates.reduce((a, b) => (a > b ? a : b));

      // Walk every calendar day from minDate to maxDate
      const cursor = new Date(minDate + "T00:00:00Z");
      const end = new Date(maxDate + "T00:00:00Z");
      while (cursor <= end) {
        allDates.push(cursor.toISOString().split("T")[0]);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }

    // Helper: is a date a Sunday?
    function isSunday(d: string): boolean {
      return new Date(d + "T00:00:00Z").getUTCDay() === 0;
    }

    // ── Step 2: Group rows by employee (phone as unique key) ───────────────
    const employeeMap = new Map<string, AttendanceRow[]>();
    filteredRows.forEach((row) => {
      if (!employeeMap.has(row.phone)) employeeMap.set(row.phone, []);
      employeeMap.get(row.phone)!.push(row);
    });

    // Ensure all known active users are in the map, so they appear as marked Absent if missing
    users.forEach((u) => {
      if (u.phone && !employeeMap.has(u.phone)) {
        employeeMap.set(u.phone, []);
      }
    });

    // ── Step 3: Build Flat CSV lines ─────────────────────────────────────────────
    const lines: string[] = [];

    // Flat Top Header
    lines.push(
      [
        "Name",
        "Phone",
        "Department",
        "Employee Location",
        "Date",
        "Status",
        "Check-In",
        "Work Mode",
        "Check-Out",
        "Work Duration",
        "Km Distance",
      ].join(",")
    );

    // One row per active date per employee
    employeeMap.forEach((rows, phoneKey) => {
      // Find user details from users array or fallback to rows
      const matchedUser = users.find(u => u.phone === phoneKey);
      
      const name = matchedUser?.name?.trim() || (rows[0] ? rows[0].name?.trim() : "—") || "—";
      const phone = phoneKey;
      const dept = matchedUser?.department?.trim() || (rows[0] ? rows[0].department?.trim() : "—") || "—";
      const empLocation = matchedUser?.location?.trim() || (rows[0] ? rows[0].location?.trim() : "—") || "—";

      // Build quick lookup: normalizedDate → row
      const dateMap = new Map<string, AttendanceRow>();
      rows.forEach((r) => dateMap.set(normalizeDate(r.date), r));

      allDates.forEach((d) => {
        const r = dateMap.get(d);
        
        let status = "A";
        if (isSunday(d)) status = "WO";
        if (r && r.checkIn) status = "P";

        const inTime = r ? toReportTime(r.checkIn) : "";
        const outTime = r ? toReportTime(r.checkOut) : "";
        const duration = r ? computeDuration(r.checkIn, r.checkOut) : "";
        
        const kmKey = buildDistanceKey(phone, d);
        const kmValue = dailyDistanceMap[kmKey];
        const distanceStr = (kmValue !== undefined && kmValue !== null) ? kmValue.toFixed(2) : "—";
        
        const wmKey = `${phone}__${d}`;
        const workMode = workModesRef.current[wmKey] || "—";

        lines.push(
          [
            cell(name),
            cell(phone),
            cell(dept),
            cell(empLocation),
            cell(d),
            cell(status),
            cell(inTime),
            cell(workMode),
            cell(outTime),
            cell(duration),
            cell(distanceStr),
          ].join(",")
        );
      });
    });

    // ── Step 4: Trigger download ────────────────────────────────────────────
    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `work_duration_report_${dateFilterType}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    } catch (e: any) {
      console.error(e);
      alert("Error generating CSV");
    } finally {
      setIsDownloadingCSV(false);
    }
  };
  // ─── END: Work Duration Report CSV Download ──────────────────────────────

  const handleRowClick = (phone: string, date: string) => {
    const formattedDate = date.split("T")[0].split(" ")[0];
    router.push(`/admin/sentlocation/${phone}?date=${formattedDate}`);
  };

  const filteredRows = attRows
    .filter((row) => {
      const rowDate = normalizeDate(row.date);
      if (dateFilterType === "all") return true;
      if (dateFilterType === "today") return rowDate === getTodayDate();
      if (dateFilterType === "yesterday") return rowDate === getYesterdayDate();
      if (dateFilterType === "date") return rowDate === selectedDate;
      if (dateFilterType === "range") {
        return rowDate >= fromDate && rowDate <= toDate;
      }
      return true;
    })
    .filter((row) => {
      const query = search.toLowerCase();
      return (
        row.name.toLowerCase().includes(query) ||
        row.phone.includes(query) ||
        extractDate(row.date).includes(query) ||
        (row.checkIn || "").includes(query) ||
        (row.checkOut || "").includes(query)
      );
    });

  const todayDate = getTodayDate();
  const todayAttendedPhones = new Set(
    attRows
      .filter((r) => normalizeDate(r.date) === todayDate && r.checkIn)
      .map((r) => r.phone)
  );
  const totalAttendanceToday = todayAttendedPhones.size;
  const totalEmployeesCount = totalEmployees || 0;
  const remainingToday = Math.max(0, totalEmployeesCount - totalAttendanceToday);

  // Calculate absent employees detail today
  const absentUsers = users.filter((u) => !todayAttendedPhones.has(u.phone));

  console.log("Filtered rows data: ", filteredRows);
  return (
    <Card className="shadow-lg border-0 overflow-hidden w-full">
      <CardHeader className=" bg-gradient-to-r from-slate-50 to-purple-50 border-b px-4 sm:px-6 py-4">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-2xl font-semibold">
                Attendance Logs
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {filteredRows.length} records
              </p>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center gap-3 w-full 2xl:w-auto">
            {/* Search and Date Filters */}
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto items-stretch sm:items-center">
              <div className="relative w-full sm:w-56 lg:w-64 flex-shrink-0">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, phone, date..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <select
                  value={dateFilterType}
                  onChange={(e) =>
                    setDateFilterType(e.target.value as DateFilterType)
                  }
                  className="px-3 py-2 w-full sm:w-auto text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="date">Specific Date</option>
                  <option value="range">Date Range</option>
                  <option value="all">All Time</option>
                </select>

                {dateFilterType === "date" && (
                  <div className="w-full sm:w-40 flex-shrink-0">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                )}

                {dateFilterType === "range" && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="w-full sm:w-36 flex-shrink-0">
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block flex-shrink-0 mx-auto" />
                    <div className="w-full sm:w-36 flex-shrink-0">
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        min={fromDate}
                        className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col m-5 sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto flex-shrink-0 xl:border-l xl:border-gray-200 xl:pl-3">
              <div className="flex bg-white sm:bg-slate-100 gap-5 rounded-md sm:rounded-lg items-center text-sm w-full sm:w-auto border sm:border-0">
                <input
                  type="month"
                  value={allReportMonth}
                  onChange={(e) => setAllReportMonth(e.target.value)}
                  className="pl-2 py-1.5 bg-transparent border-none text-sm w-full sm:w-32 focus:outline-none font-medium text-slate-700 flex-1"
                />
                <Button
                  onClick={handleDownloadAllEmployeesReport}
                  disabled={isDownloadingAll}
                  variant="ghost"
                  size="sm"
                  className="text-purple-700  hover:bg-slate-200 h-8 px-3 shrink-0 bg-slate-100 sm:bg-transparent ml-2 sm:ml-0"
                >
                  {isDownloadingAll ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Monthly (All)
                </Button>
              </div>

              <Button
                onClick={handleDownloadCSV}
                className="bg-purple-600 m-10 hover:bg-purple-700 text-white shadow-md w-full sm:w-auto lg:h-10 shrink-0"
              >
                <Download className="w-4 h-4 mr-2" />
                Today Report
              </Button>
            </div>
          </div>
        </div>

        {/* NEW Snapshot Metrics */}
        {totalEmployees !== undefined && (
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-purple-100/50">
            <div className="bg-white/60 px-4 py-3 rounded-lg border border-purple-100 flex-1 min-w-[140px] shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Employees</p>
              <p className="text-2xl font-bold text-slate-800 mt-1.5">{totalEmployeesCount}</p>
            </div>
            <div className="bg-white/60 px-4 py-3 rounded-lg border border-green-100 flex-1 min-w-[140px] shadow-sm">
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Present Today</p>
              <p className="text-2xl font-bold text-green-700 mt-1.5">{totalAttendanceToday}</p>
            </div>
            <div className="bg-white/60 px-4 py-3 rounded-lg border border-orange-100 flex-1 min-w-[140px] shadow-sm">
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider">Absent (Today)</p>
              <p className="text-2xl font-bold text-orange-700 mt-1.5">{remainingToday}</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  <Calendar className="inline w-4 h-4 mr-1" /> Date
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Check-in
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  <MapPin className="inline w-4 h-4 mr-1" /> Work Mode
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Check-Out
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  <MapPin className="inline w-4 h-4 mr-1 text-green-500" /> First Visit
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  <MapPin className="inline w-4 h-4 mr-1 text-red-500" /> Last Visit
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Km
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  
                  Locations
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRows.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(row.phone, row.date)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.name}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {extractDate(row.date)}
                  </td>

                  <td className="px-3 sm:px-4 py-2">
                    {(() => {
                      if (!row.checkIn)
                        return <span className="text-gray-400">--</span>;
                      const [hours, minutes] = row.checkIn
                        .split(":")
                        .map(Number);
                      const checkInMinutes = hours * 60 + minutes;
                      const nineAM = 8 * 60;
                      const tenAM = 10 * 60;
                      let status =
                        checkInMinutes < nineAM || checkInMinutes > tenAM
                          ? "Late"
                          : "On-time";

                      return status === "On-time" ? (
                        <span className="flex items-center text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" /> On-time
                        </span>
                      ) : (
                        <span className="flex items-center text-orange-600 font-medium">
                          <AlertCircle className="w-4 h-4 mr-1" /> Late
                        </span>
                      );
                    })()}
                  </td>

                  {/* ✅ Applied 12-hour formatting here */}
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {formatTo12Hour(row.checkIn)}
                  </td>
                  <td className="px-3 sm:px-4 py-2">
                    {row.checkIn ? (
                      <WorkModeCell 
                        phone={row.phone} 
                        date={row.date} 
                        onModeLoaded={(m) => {
                          workModesRef.current[`${row.phone}__${normalizeDate(row.date)}`] = m;
                        }}
                      />
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {formatTo12Hour(row.checkOut)}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.location || "—"}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.department || "—"}
                  </td>
                  {/* First Visit & Last Visit Columns */}
                  {row.checkIn ? (
                    <FirstLastVisitCell phone={row.phone} date={row.date} />
                  ) : (
                    <>
                      <td className="px-3 sm:px-4 py-2"><span className="text-gray-400">--</span></td>
                      <td className="px-3 sm:px-4 py-2"><span className="text-gray-400">--</span></td>
                    </>
                  )}
                  <td className="px-3 sm:px-4 py-2">
                    {(() => {
                      const km = dailyDistanceMap[buildDistanceKey(row.phone, row.date)];
                      if (km === undefined || km === null) {
                        return <span className="text-gray-400">—</span>;
                      }
                      return (
                        <span className="inline-flex items-center gap-1 text-gray-700 whitespace-nowrap">
                          {km.toFixed(2)} km
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 sm:px-4 py-2">
                    <LocationCountCell phone={row.phone} date={row.date} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* New section for Absent users today */}
      {dateFilterType === "today" && absentUsers.length > 0 && (
        <div className="p-4 sm:p-6 bg-orange-50/30 border-t border-orange-100/50">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Absent / Remaining Today ({absentUsers.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {absentUsers.map((user, idx) => (
              <div 
                key={user.phone || idx} 
                className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="bg-orange-100 p-2 rounded-full shrink-0">
                  <User className="w-4 h-4 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.name || "Unknown"}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {user.phone}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building className="w-3 h-3" />
                    {user.department}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {user.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
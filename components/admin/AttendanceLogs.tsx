"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
}

type DateFilterType = "today" | "yesterday" | "date" | "range" | "all";

export default function AttendanceLogs({
  attRows,
  downloadCSV,
}: AttendanceLogsProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("today");

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

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  function getYesterdayDate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }

  // ─── NEW: Work Duration Report CSV Download ─────────────────────────────────
  const handleDownloadCSV = () => {
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
    const DAY_ABBR = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const presentDates = filteredRows
      .map((r) => normalizeDate(r.date))
      .filter(Boolean);

    if (presentDates.length === 0) return;

    const minDate = presentDates.reduce((a, b) => (a < b ? a : b));
    const maxDate = presentDates.reduce((a, b) => (a > b ? a : b));

    // Walk every calendar day from minDate to maxDate
    const allDates: string[] = [];
    const cursor = new Date(minDate + "T00:00:00Z");
    const end = new Date(maxDate + "T00:00:00Z");
    while (cursor <= end) {
      allDates.push(cursor.toISOString().split("T")[0]);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    // Helper: is a date a Sunday?
    function isSunday(d: string): boolean {
      return new Date(d + "T00:00:00Z").getUTCDay() === 0;
    }

    // ── Step 2: Build date column headers: "10 Tu" style ───────────────────
    const dateColHeaders = allDates.map((d) => {
      const dt = new Date(d + "T00:00:00Z");
      const dayNum = dt.getUTCDate();
      const dayAbbr = DAY_ABBR[dt.getUTCDay()];
      return `${dayNum} ${dayAbbr}`;
    });

    // ── Step 3: Group rows by employee (phone as unique key) ───────────────
    const employeeMap = new Map<string, AttendanceRow[]>();
    filteredRows.forEach((row) => {
      if (!employeeMap.has(row.phone)) employeeMap.set(row.phone, []);
      employeeMap.get(row.phone)!.push(row);
    });

    // ── Step 4: Build CSV lines ─────────────────────────────────────────────
    const lines: string[] = [];

    // Top header row: fixed cols + date cols + summary cols
    const fixedCols = ["Name", "Phone", "Department", "Row"];
    const summaryCols = ["P", "A", "WO", "Working Days"];
    lines.push(
      [
        ...fixedCols.map(cell),
        ...dateColHeaders.map(cell),
        ...summaryCols.map(cell),
      ].join(",")
    );

    // One block per employee
    employeeMap.forEach((rows) => {
      const name = rows[0].name?.trim() || "—";
      const phone = rows[0].phone || "—";
      const dept = rows[0].department?.trim() || "—";

      // Build quick lookup: normalizedDate → row
      const dateMap = new Map<string, AttendanceRow>();
      rows.forEach((r) => dateMap.set(normalizeDate(r.date), r));

      // Compute summary counts
      let presentCount = 0;
      let absentCount = 0;
      let woCount = 0;
      allDates.forEach((d) => {
        if (isSunday(d)) {
          woCount++;
        } else {
          const r = dateMap.get(d);
          if (r && r.checkIn) presentCount++;
          else absentCount++;
        }
      });
      const workingDays = presentCount;

      // ── Row A: Employee header (name, phone, dept, blank date cells, summary)
      lines.push(
        [
          cell(name),
          cell(phone),
          cell(dept),
          cell(""), // Row label cell blank for emp header
          ...allDates.map(() => cell("")),
          cell(String(presentCount)),
          cell(String(absentCount)),
          cell(String(woCount)),
          cell(String(workingDays)),
        ].join(",")
      );

      // ── Row B: Status (P = present, A = absent, WO = Sunday)
      lines.push(
        [
          cell(""),
          cell(""),
          cell(""),
          cell("Status"),
          ...allDates.map((d) => {
            if (isSunday(d)) return cell("WO");
            const r = dateMap.get(d);
            if (!r) return cell("A");
            return cell(r.checkIn ? "P" : "A");
          }),
          ...summaryCols.map(() => cell("")),
        ].join(",")
      );

      // ── Row C: InTime
      lines.push(
        [
          cell(""),
          cell(""),
          cell(""),
          cell("InTime"),
          ...allDates.map((d) => {
            if (isSunday(d)) return cell("WO");
            const r = dateMap.get(d);
            return cell(r ? toReportTime(r.checkIn) : "");
          }),
          ...summaryCols.map(() => cell("")),
        ].join(",")
      );

      // ── Row D: OutTime
      lines.push(
        [
          cell(""),
          cell(""),
          cell(""),
          cell("OutTime"),
          ...allDates.map((d) => {
            if (isSunday(d)) return cell("WO");
            const r = dateMap.get(d);
            return cell(r ? toReportTime(r.checkOut) : "");
          }),
          ...summaryCols.map(() => cell("")),
        ].join(",")
      );

      // ── Row E: Total (work duration)
      lines.push(
        [
          cell(""),
          cell(""),
          cell(""),
          cell("Total"),
          ...allDates.map((d) => {
            if (isSunday(d)) return cell("WO");
            const r = dateMap.get(d);
            return cell(r ? computeDuration(r.checkIn, r.checkOut) : "");
          }),
          ...summaryCols.map(() => cell("")),
        ].join(",")
      );

      // Blank separator row between employees
      lines.push("");
    });

    // ── Step 5: Trigger download ────────────────────────────────────────────
    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `attendance_${dateFilterType}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  console.log("Filtered rows data: ", filteredRows);
  return (
    <Card className="shadow-lg border-0 overflow-hidden w-full">
      <CardHeader className=" bg-gradient-to-r from-slate-50 to-purple-50 border-b px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

          <div className="flex flex-col xl:flex-row gap-2 w-full xl:w-auto">
            <div className="relative w-full xl:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, phone, date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={dateFilterType}
                onChange={(e) =>
                  setDateFilterType(e.target.value as DateFilterType)
                }
                className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="date">Specific Date</option>
                <option value="range">Date Range</option>
                <option value="all">All Time</option>
              </select>

              {dateFilterType === "date" && (
                <div className="relative w-full sm:w-40">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {dateFilterType === "range" && (
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-36">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                  <div className="relative w-full sm:w-36">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      min={fromDate}
                      className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleDownloadCSV}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md w-full lg:w-auto text-sm sm:text-base"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
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
                  <Phone className="inline w-4 h-4 mr-1" /> Phone
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
                  Check-Out
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Department
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
                    {row.phone}
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
                      const nineAM = 9 * 60;
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
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {formatTo12Hour(row.checkOut)}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.location || "—"}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.department || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
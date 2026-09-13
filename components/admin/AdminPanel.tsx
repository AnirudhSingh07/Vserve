"use client";

import { UserPlus } from "lucide-react";
import AttendanceLogs from "../admin/AttendanceLogs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Loader2, AlertCircle, User } from "lucide-react";

type User = {
  _id: string;
  id: string;
  phone: string;
  role: string;
  name?: string;
  profileCompleted?: boolean;
};

type AttendanceRow = {
  phone: string;
  name: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  location?: string;
  department?: string;
};

type LateReq = {
  id: string;
  phone: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  remarks?: string;
  createdAt: number;
};

// ── Polling policy ─────────────────────────────────────────────────────────
// Poll every 3 min (was 30 s), only while the tab is visible and only during
// working hours in IST. Outside that window the panel still loads on open and
// refreshes when the tab regains focus; it just doesn't poll in the background.
const POLL_INTERVAL_MS = 3 * 60 * 1000;
const POLL_START_MINUTES = 7 * 60; // 07:00 IST
const POLL_END_MINUTES = 20 * 60 + 30; // 20:30 IST (auto-checkout cron runs at 20:00)
// Days of attendance loaded on first open; older days load on demand via the date filter
const DEFAULT_WINDOW_DAYS = 31;

function isWithinPollingHours(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const mins = h * 60 + m;
  return mins >= POLL_START_MINUTES && mins <= POLL_END_MINUTES;
}

function daysAgoStr(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function normalizeDate(input: string) {
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export default function AdminPanel() {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [attRows, setAttRows] = useState<AttendanceRow[]>([]);
  const [lateReqs, setLateReqs] = useState<LateReq[]>([]);
  const [search, setSearch] = useState("");
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 ADDED: store raw attendance separately
  const [rawAttendance, setRawAttendance] = useState<any[]>([]);

  // 🔹 ADDED: daily distance map — "phone__YYYY-MM-DD" → totalKm
  const [dailyDistanceMap, setDailyDistanceMap] = useState<Record<string, number>>({});

  // 🔹 ADDED: employee phone → location map
  const employeeLocationMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u: any) => {
      if (u.phone && u.location) {
        map[u.phone] = u.location;
      }
    });
    return map;
  }, [users]);

  const lastSyncRef = useRef<string | null>(null);
  // Earliest day (YYYY-MM-DD) currently loaded into rawAttendance
  const loadedFromRef = useRef<string>(daysAgoStr(DEFAULT_WINDOW_DAYS));
  const lastFetchAtRef = useRef<number>(0);
  const inFlightRef = useRef(false);

  // Merge incoming rows into existing ones, keyed by phone + day
  const mergeAttendance = (prev: any[], incoming: any[]) => {
    const merged = [...prev];
    incoming.forEach((newRec: any) => {
      const newKey = `${newRec.phone}__${normalizeDate(newRec.date)}`;
      const idx = merged.findIndex(
        (r) => `${r.phone}__${normalizeDate(r.date)}` === newKey,
      );
      if (idx > -1) merged[idx] = newRec;
      else merged.push(newRec);
    });
    return merged;
  };

  useEffect(() => {
    const fetchData = async (isBackground = false) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        if (!isBackground && rawAttendance.length === 0) setLoading(true);

        const currentLastSync = lastSyncRef.current;

        // Fetch admin info and employee directory only initially (not on background polls)
        if (!isBackground) {
          const [adminRes, empRes] = await Promise.all([
            fetch("/api/me", { credentials: "include" }),
            fetch("/api/employees"),
          ]);

          if (!adminRes.ok) throw new Error("Failed to fetch admin data");
          if (!empRes.ok) throw new Error("Failed to fetch employee list");

          const adminData = await adminRes.json();
          const empData = await empRes.json();

          setAdmin(adminData.employee || null);
          setUsers(empData.employees || []);
        }

        // One combined request: attendance logs + daily distance map.
        // Full window (last DEFAULT_WINDOW_DAYS) initially, incremental `since` afterwards.
        const pollUrl = currentLastSync
          ? `/api/admin/poll?since=${encodeURIComponent(currentLastSync)}`
          : "/api/admin/poll";
        const pollRes = await fetch(pollUrl, { credentials: "include" });

        // Record timestamp immediately before checking response
        const nextSyncTime = new Date().toISOString();

        if (pollRes.ok) {
          const resData = await pollRes.json();
          const newRecords = resData.attendance || [];

          setDailyDistanceMap((prev) => ({
            ...prev,
            ...(resData.distanceMap || {}),
          }));

          if (currentLastSync) {
            setRawAttendance((prev) => mergeAttendance(prev, newRecords));
          } else {
            setRawAttendance(newRecords);
          }
          lastSyncRef.current = nextSyncTime;
          lastFetchAtRef.current = Date.now();
        }
      } catch (err: any) {
        console.error(err);
        if (!isBackground) setError(err.message);
      } finally {
        inFlightRef.current = false;
        if (!isBackground) setLoading(false);
      }
    };

    fetchData(); // initial fetch

    // Background polling: only while the tab is visible and within working hours.
    const intervalId = setInterval(() => {
      if (document.hidden || !isWithinPollingHours()) return;
      fetchData(true);
    }, POLL_INTERVAL_MS);

    // When the admin comes back to the tab, refresh once if the data is stale.
    const onVisible = () => {
      if (document.hidden) return;
      if (Date.now() - lastFetchAtRef.current >= POLL_INTERVAL_MS) fetchData(true);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Called by AttendanceLogs when a date filter needs days older than what is loaded.
  // Fetches the missing range once (no polling) and merges it in.
  const ensureLoadedFrom = useCallback(async (from: string) => {
    if (!from || from >= loadedFromRef.current) return;
    const to = loadedFromRef.current;
    loadedFromRef.current = from;
    try {
      const res = await fetch(
        `/api/admin/poll?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to load older attendance");
      const data = await res.json();
      setDailyDistanceMap((prev) => ({ ...prev, ...(data.distanceMap || {}) }));
      setRawAttendance((prev) => mergeAttendance(prev, data.attendance || []));
    } catch (err) {
      console.error(err);
      loadedFromRef.current = to; // allow a retry
    }
  }, []);

  // 🔹 ADDED: build attendance rows AFTER users + attendance are ready
  useEffect(() => {
    if (!rawAttendance.length || !users.length) return;

    setAttRows(
      rawAttendance.map((r: any) => ({
        phone: r.phone,
        name: r.name,
        date: r.date,
        department: r.department,
        location: employeeLocationMap[r.phone] || "—",
        status:
          r.status === "on-time"
            ? "On-time"
            : r.lateApproved
              ? "Late (Approved)"
              : r.status === "late"
                ? "Late"
                : "—",
        checkIn: r.checkInTime
          ? new Date(r.checkInTime).toLocaleTimeString()
          : undefined,
        checkOut: r.checkOutTime
          ? new Date(r.checkOutTime).toLocaleTimeString()
          : undefined,
        work_mode: r.work_mode,
        first_visit: r.first_visit,
        last_visit: r.last_visit,
        // Attendance.km is only populated for rows written after the sentloc
        // change; fall back to the DailyDistance ledger (what the table used before).
        km: r.km > 0 ? r.km : (dailyDistanceMap[`${r.phone}__${normalizeDate(r.date)}`] ?? r.km),
        locations_cover: r.locations_cover,
      })),
    );
  }, [rawAttendance, employeeLocationMap, users, dailyDistanceMap]);

  // 🔹 NEW: Handler for create employee navigation
  const handleCreateEmployeeClick = () => {
    router.push("/admin/create-employee");
  };

  const downloadCSV = () => {
    const header = ["Phone", "Date", "Status", "Check-in", "Check-out"];
    const lines = [header.join(",")];
    attRows.forEach((r) =>
      lines.push(
        [r.phone, r.date, r.status, r.checkIn || "", r.checkOut || ""]
          .map((v) => `"${v}"`)
          .join(","),
      ),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmployeeClick = () => {
    router.push("/admin/employee");
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto h-10 w-10 text-blue-600 mb-3" />
          <p className="text-sm font-medium text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <p className="text-lg font-semibold text-red-600 mb-1">Error Loading Data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleEmployeeClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          Employee Directory
        </button>

        {/* 🔹 NEW: Create Employee Button */}
        <button
          onClick={handleCreateEmployeeClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Create Employee
        </button>
      </div>

      {/* Attendance Logs Card */}
      <div className="rounded-2xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-sm overflow-hidden">
        <AttendanceLogs attRows={attRows} downloadCSV={downloadCSV} totalEmployees={users.length} dailyDistanceMap={dailyDistanceMap} users={users} onRangeNeeded={ensureLoadedFrom} />
      </div>
    </div>
  );
}

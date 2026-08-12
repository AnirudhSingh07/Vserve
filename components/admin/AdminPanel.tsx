"use client";

import { UserPlus } from "lucide-react";
import AttendanceLogs from "../admin/AttendanceLogs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
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

  useEffect(() => {
    const fetchData = async (isBackground = false) => {
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

        // Fetch daily distance (full map initially, incremental updates during polling)
        const distUrl = currentLastSync
          ? `/api/attendance/daily-distance?since=${encodeURIComponent(currentLastSync)}`
          : "/api/attendance/daily-distance";
        const distRes = await fetch(distUrl);

        if (distRes.ok) {
          const distData = await distRes.json();
          setDailyDistanceMap((prev) => ({
            ...prev,
            ...(distData.distanceMap || {}),
          }));
        }

        // Fetch attendance logs (full logs initially, incremental updates during polling)
        const attUrl = currentLastSync
          ? `/api/attendance/allattendance?since=${encodeURIComponent(currentLastSync)}`
          : "/api/attendance/allattendance";
        const attRes = await fetch(attUrl, { credentials: "include" });

        // Record timestamp immediately before checking response
        const nextSyncTime = new Date().toISOString();

        if (attRes.ok) {
          const resData = await attRes.json();
          const newRecords = resData.data || [];

          if (currentLastSync) {
            setRawAttendance((prev) => {
              const merged = [...prev];
              newRecords.forEach((newRec: any) => {
                const normalizeDate = (input: string) => {
                  const d = new Date(input);
                  if (isNaN(d.getTime())) return "";
                  return d.toISOString().split("T")[0];
                };
                const newKey = `${newRec.phone}__${normalizeDate(newRec.date)}`;
                const idx = merged.findIndex(
                  (r) => `${r.phone}__${normalizeDate(r.date)}` === newKey
                );
                if (idx > -1) {
                  merged[idx] = newRec;
                } else {
                  merged.push(newRec);
                }
              });
              return merged;
            });
          } else {
            setRawAttendance(newRecords);
          }
          lastSyncRef.current = nextSyncTime;
        }
      } catch (err: any) {
        console.error(err);
        if (!isBackground) setError(err.message);
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    fetchData(); // initial fetch

    const intervalId = setInterval(() => {
      fetchData(true); // background fetch
    }, 30000); // 30 seconds polling

    return () => clearInterval(intervalId);
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
        km: r.km,
        locations_cover: r.locations_cover,
      })),
    );
  }, [rawAttendance, employeeLocationMap, users]);

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
        <AttendanceLogs attRows={attRows} downloadCSV={downloadCSV} totalEmployees={users.length} dailyDistanceMap={dailyDistanceMap} users={users} />
      </div>
    </div>
  );
}

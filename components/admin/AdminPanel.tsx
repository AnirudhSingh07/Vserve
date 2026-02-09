"use client";

import { UserPlus } from "lucide-react";
import AttendanceLogs from "../admin/AttendanceLogs";
import LateRequests from "../admin/LateRequests";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

        const attRes = await fetch("/api/attendance/allattendance", {
          credentials: "include",
        });

        if (attRes.ok) {
          const data = await attRes.json();
   
          // 🔹 ADDED: store raw attendance only
          setRawAttendance(data.data || []);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto h-12 w-12 text-blue-600 mb-4" />
          <p className="text-lg font-medium text-gray-600">
            Loading admin panel...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <p className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Data
          </p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-start gap-3">
          <button
            onClick={handleEmployeeClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-2 rounded"
          >
            Employee Directory
          </button>

          {/* 🔹 NEW: Create Employee Button */}
          <button
            onClick={handleCreateEmployeeClick}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create Employee
          </button>
        </div>

        <AttendanceLogs attRows={attRows} downloadCSV={downloadCSV} />
      </div>
    </div>
  );
}

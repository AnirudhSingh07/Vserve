"use client";

import AdminHeader from "../admin/AdminHeader";
import EmployeeDirectory from "../admin/EmployeeDirectory";
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
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
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
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log("users", empData.employees);
        const attRes = await fetch("/api/attendance/allattendance", {
          credentials: "include",
        });

        const lateRes = await fetch("/api/late-requests", {
          credentials: "include",
        });
        if (attRes.ok) {
          const data = await attRes.json();
          setAttRows(
            (data.data || []).map((r: any) => ({
              phone: r.phone,
              date: r.date,
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
            }))
          );
          console.log("response from admin panel", attRows);
        }

        if (lateRes.ok) {
          const data = await lateRes.json();
          setLateReqs(data.requests || []);
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

  const updateLate = async (
    id: string,
    status: "approved" | "rejected",
    remarks: string
  ) => {
    try {
      const res = await fetch(`/api/late-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update late request");

      setLateReqs((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, remarks } : r))
      );
    } catch (err: any) {
      console.error(err);
      alert("Error updating late request: " + err.message);
    }
  };

  const downloadCSV = () => {
    const header = ["Phone", "Date", "Status", "Check-in", "Check-out"];
    const lines = [header.join(",")];
    attRows.forEach((r) =>
      lines.push(
        [r.phone, r.date, r.status, r.checkIn || "", r.checkOut || ""]
          .map((v) => `"${v}"`)
          .join(",")
      )
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

  const pendingLateReqs = lateReqs.filter((r) => r.status === "pending");

  const openUserProfile = (id: string) => {
    const user = users.find((u) => u._id === id);
    console.log("user", user);
    if (!user) return alert("User not found");
    router.push(`/profile/employee/${user._id}`);
  };

  const toggleEmployeeExpand = (id: string) => {
    setExpandedEmployeeId((prev) => (prev === id ? null : id));
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
  // same state, useEffect, etc.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader
          admin={admin}
          users={users}
          pendingLateReqs={pendingLateReqs}
        />
        <EmployeeDirectory users={users} />

        <AttendanceLogs attRows={attRows} downloadCSV={downloadCSV} />
        <LateRequests
          lateReqs={lateReqs}
          pendingLateReqs={pendingLateReqs}
          updateLate={updateLate}
        />
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Search,
  Download,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  User,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Mail,
  MapPin,
  CreditCard,
  Building2,
} from "lucide-react";

type User = {
  _id: string;
  id: string;
  phone: string;
  role: string;
  name?: string;
  profileCompleted?: boolean;
};

type Attendance = {
  date: string;
  checkInTime?: number;
  checkOutTime?: number;
  status?: "on-time" | "late";
  lateApproved?: boolean;
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
  const [attRows, setAttRows] = useState<
    Array<{
      phone: string;
      date: string;
      status: string;
      checkIn?: string;
      checkOut?: string;
    }>
  >([]);
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
  (data.attendance || []).map((r: any) => ({
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

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.phone.includes(q) || (u.name || "").toLowerCase().includes(q)
    );
  }, [users, search]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ADMIN HEADER */}
        {admin && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Welcome back, {admin.name || "Admin"}! 👋
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Role: {admin.role} • Managing your organization's workforce
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                  <Users className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-blue-100">Employees</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                  <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-2xl font-bold">{pendingLateReqs.length}</p>
                  <p className="text-xs text-blue-100">Pending</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYEE LIST */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Employee Directory</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredUsers.length} employees found
                  </p>
                </div>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No employees found
                  </p>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your search
                  </p>
                </div>
              ) : (
                filteredUsers.map((u, idx) => {
                  // ensure a stable unique id used for toggle/comparison/key
                  const uid = u.id ?? `user-${idx}`;

                  return (
                    <Card
                      key={uid}
                      className="overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-blue-500"
                    >
                      {/* Collapsed View */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEmployeeExpand(uid);
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-semibold text-lg shadow-md">
                            {(u.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {u.name || "Unnamed Employee"}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5" />
                                {u.role}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                {u.phone}
                              </span>
                              {u.profileCompleted ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  <CheckCircle className="w-3 h-3" />
                                  Complete
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openUserProfile(u._id);
                            }}
                          >
                            View Profile
                          </Button>

                          <div className="text-gray-400">
                            {expandedEmployeeId === uid ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {expandedEmployeeId === uid && (
                        <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 p-6 animate-in slide-in-from-top duration-300">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">
                                    Employee ID
                                  </p>
                                  <p className="text-gray-900 font-medium mt-1">
                                    #{u.id ?? uid}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">
                                    Full Name
                                  </p>
                                  <p className="text-gray-900 font-medium mt-1">
                                    {u.name || "—"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Phone className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">
                                    Phone Number
                                  </p>
                                  <p className="text-gray-900 font-medium mt-1">
                                    {u.phone}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Briefcase className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">
                                    Role
                                  </p>
                                  <p className="text-gray-900 font-medium mt-1 capitalize">
                                    {u.role}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">
                                    Profile Status
                                  </p>
                                  <p className="text-gray-900 font-medium mt-1">
                                    {u.profileCompleted
                                      ? "Completed"
                                      : "Incomplete - Pending Details"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {!u.profileCompleted && (
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-amber-900">
                                    Profile Incomplete
                                  </p>
                                  <p className="text-xs text-amber-700 mt-1">
                                    This employee needs to complete their
                                    profile information.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* ATTENDANCE LOGS */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Attendance Logs</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {attRows.length} records
                  </p>
                </div>
              </div>
              <Button
                onClick={downloadCSV}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Check-out
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attRows.length === 0 ? (
                    <tr>
                      <td className="py-12 text-center" colSpan={5}>
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                          No attendance logs available
                        </p>
                      </td>
                    </tr>
                  ) : (
                    attRows.map((r, i) => (
                      <tr
                        key={r.phone + r.date + i}
                        className="hover:bg-purple-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {r.phone}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {r.date}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {r.status === "On-time" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {r.status}
                            </span>
                          ) : r.status === "Late (Approved)" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {r.status}
                            </span>
                          ) : r.status === "Late" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {r.status}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {r.status}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {r.checkIn || "—"}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">
                          {r.checkOut || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* LATE REQUESTS */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Late Requests</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingLateReqs.length} pending • {lateReqs.length} total
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {lateReqs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No late requests</p>
                <p className="text-gray-400 text-sm">
                  All employees are on time!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lateReqs.map((r) => (
                  <LateRequestRow key={r.id} req={r} onResolve={updateLate} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LateRequestRow({
  req,
  onResolve,
}: {
  req: LateReq;
  onResolve: (
    id: string,
    status: "approved" | "rejected",
    remarks: string
  ) => void;
}) {
  const [remarks, setRemarks] = useState(req.remarks || "");

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="grid md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Phone
            </div>
          </div>
          <div className="text-sm font-medium text-gray-900">{req.phone}</div>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Date
            </div>
          </div>
          <div className="text-sm font-medium text-gray-900">{req.date}</div>
        </div>

        <div className="md:col-span-3">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Reason
          </div>
          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
            {req.reason}
          </div>
        </div>

        <div className="md:col-span-5 space-y-3">
          <div>
            <Label
              htmlFor={`remarks-${req.id}`}
              className="text-xs font-semibold text-gray-500 uppercase mb-2 block"
            >
              Admin Remarks
            </Label>
            <Textarea
              id={`remarks-${req.id}`}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add your remarks here..."
              className="min-h-[60px] resize-none"
              disabled={req.status !== "pending"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => onResolve(req.id, "approved", remarks)}
              disabled={req.status !== "pending"}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onResolve(req.id, "rejected", remarks)}
              disabled={req.status !== "pending"}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <div className="ml-auto">
              {req.status === "pending" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  PENDING
                </span>
              ) : req.status === "approved" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  APPROVED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  <XCircle className="w-3.5 h-3.5" />
                  REJECTED
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  User,
  Search,
} from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Initialize dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const IST_TIMEZONE = "Asia/Kolkata";

// Type definition for better code safety
interface LeaveRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  leaveFrom: string;
  leaveTo: string;
  numberOfDays: number;
  halfDaySlot?: "Morning" | "Afternoon" | null;
  subject: string;
  message: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export default function AdminLeaveDashboard() {
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter States
  const [filterType, setFilterType] = useState<
    "all" | "today" | "pending" | "approved"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    empId: string;
    type: "accept" | "reject";
    employeeName: string; // Added for better modal UX
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Manual Leave State
  const [employees, setEmployees] = useState<any[]>([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeePhone: "",
    date: dayjs().tz(IST_TIMEZONE).format("YYYY-MM-DD"),
    shift: "Morning" as "Morning" | "Afternoon",
  });
  const [manualLoading, setManualLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  useEffect(() => {
    fetchRequests();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/notification/leavereq");
      const result = await res.json();
      // Ensure data is sorted by newest first
      const sortedData = (result.data || []).sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setAllRequests(sortedData);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  // Optimized Filter Logic
  const filteredRequests = useMemo(() => {
    let data = [...allRequests];
    const todayIST = dayjs().tz(IST_TIMEZONE).format("YYYY-MM-DD");

    // 1. Filter by Type/Status
    if (filterType === "today") {
      data = data.filter(
        (req) =>
          dayjs(req.leaveFrom).tz(IST_TIMEZONE).format("YYYY-MM-DD") ===
          todayIST,
      );
    } else if (filterType !== "all") {
      // Matches "pending", "approved", "rejected" (case-insensitive check)
      data = data.filter((req) => req.status.toLowerCase() === filterType);
    }

    // 2. Search by Name
    if (searchQuery) {
      data = data.filter((req) =>
        req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return data;
  }, [allRequests, filterType, searchQuery]);

  const handleAssignManualLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.employeePhone) return alert("Please select an employee.");
    setManualLoading(true);

    try {
      // 1. Create a Leave Request
      const createRes = await fetch("/api/notification/leavereq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNo: manualForm.employeePhone,
          leaveFrom: manualForm.date,
          leaveTo: manualForm.date,
          numberOfDays: 0.5,
          halfDaySlot: manualForm.shift,
          subject: "Admin Assigned Leave",
          message: "Automatically approved by administrator.",
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.data) {
        throw new Error(createData.error || "Failed to create leave request");
      }

      // 2. Immediately Approve It
      const createdRequest = createData.data;
      const approveRes = await fetch("/api/notification/leavestatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: createdRequest._id,
          employeeId: createdRequest.employeeId,
          action: "accept",
        }),
      });

      if (!approveRes.ok) {
        throw new Error("Failed to auto-approve leave request");
      }

      // Success
      setIsManualModalOpen(false);
      setManualForm({
        employeePhone: "",
        date: dayjs().tz(IST_TIMEZONE).format("YYYY-MM-DD"),
        shift: "Morning",
      });
      fetchRequests(); // Refresh the list entirely
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred");
    } finally {
      setManualLoading(false);
    }
  };

  const handleStatusAction = async () => {
    if (!confirmModal) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/notification/leavestatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: confirmModal.id,
          employeeId: confirmModal.empId,
          action: confirmModal.type,
        }),
      });

      if (res.ok) {
        // OPTIMISTIC UPDATE: Update local state immediately instead of refetching
        setAllRequests((prev) =>
          prev.map((req) =>
            req._id === confirmModal.id
              ? {
                  ...req,
                  status:
                    confirmModal.type === "accept" ? "Approved" : "Rejected",
                }
              : req,
          ),
        );
        setConfirmModal(null);
        // Close the expanded view automatically after action
        setExpandedId(null);
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Action failed", err);
      alert("Network error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-25">
        <div className="px-4 sm:px-6 py-5">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Leave Requests
            </h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <Clock size={14} />
              Server Time:{" "}
              {dayjs().tz(IST_TIMEZONE).format("DD MMM YYYY, h:mm A")}
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500 shadow-sm flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-auto xl:mr-2"
            >
              <Plus size={16} />
              Assign Leave
            </button>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search employee..."
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full xl:w-64 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                {(["all", "pending", "today", "approved"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      filterType === tab
                        ? "bg-slate-900 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Request List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => {
                const isHalfDay = req.halfDaySlot && req.halfDaySlot !== null;
                const isPending = req.status === "Pending";

                return (
                  <div
                    key={req._id}
                    className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                      expandedId === req._id
                        ? "shadow-lg ring-1 ring-slate-200"
                        : "shadow-sm border-slate-200 hover:shadow-md"
                    }`}
                  >
                    {/* Card Header (Always Visible) */}
                    <div
                      onClick={() =>
                        setExpandedId(expandedId === req._id ? null : req._id)
                      }
                      className="p-5 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${
                            req.status === "Approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : req.status === "Rejected"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-indigo-50 text-indigo-600"
                          }`}
                        >
                          {req.employeeName.charAt(0)}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-800 text-base">
                            {req.employeeName}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                              {req.subject}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <CalendarDays size={12} />
                              {dayjs(req.leaveFrom)
                                .tz(IST_TIMEZONE)
                                .format("DD MMM")}
                              {!isHalfDay &&
                                req.leaveFrom !== req.leaveTo &&
                                ` - ${dayjs(req.leaveTo).tz(IST_TIMEZONE).format("DD MMM")}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Status Badge */}
                        <div
                          className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                            req.status === "Approved"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : req.status === "Rejected"
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {req.status === "Approved" && (
                            <CheckCircle2 size={12} />
                          )}
                          {req.status === "Rejected" && <XCircle size={12} />}
                          {req.status === "Pending" && <Clock size={12} />}
                          {req.status}
                        </div>

                        {expandedId === req._id ? (
                          <ChevronUp size={20} className="text-slate-300" />
                        ) : (
                          <ChevronDown size={20} className="text-slate-300" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    {expandedId === req._id && (
                      <div className="px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          {/* Leave Details Block */}
                          <div className="md:col-span-2 space-y-4">
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Reason
                              </h4>
                              <p className="text-sm text-slate-600 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                                "{req.message}"
                              </p>
                            </div>
                          </div>

                          {/* Date & Shift Info Block */}
                          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Date
                              </h4>
                              <p className="text-sm font-bold text-slate-800">
                                {dayjs(req.leaveFrom)
                                  .tz(IST_TIMEZONE)
                                  .format("ddd, DD MMMM YYYY")}
                              </p>
                            </div>

                            {/* Half Day / Duration Logic */}
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                Duration & Shift
                              </h4>
                              {isHalfDay ? (
                                <div className="flex items-center gap-2">
                                  <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                    Half Day
                                  </span>
                                  <span className="text-sm font-semibold text-slate-700">
                                    {req.halfDaySlot === "Morning"
                                      ? "☀️ Morning Shift"
                                      : "🌤️ Afternoon Shift"}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-sm font-semibold text-slate-700">
                                  Full Day ({req.numberOfDays} Days)
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - Only Show if PENDING */}
                        {isPending ? (
                          <div className="flex gap-3 pt-2 border-t border-slate-200/50">
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  id: req._id,
                                  empId: req.employeeId,
                                  type: "reject",
                                  employeeName: req.employeeName,
                                })
                              }
                              className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl text-sm font-bold transition-all"
                            >
                              Reject Request
                            </button>
                            <button
                              onClick={() =>
                                setConfirmModal({
                                  id: req._id,
                                  empId: req.employeeId,
                                  type: "accept",
                                  employeeName: req.employeeName,
                                })
                              }
                              className="flex-1 py-2.5 bg-slate-900 text-white hover:bg-emerald-600 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all transform active:scale-[0.98]"
                            >
                              Approve Request
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-slate-400 italic pt-2 border-t border-slate-200/50">
                            {req.status === "Approved" ? (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-500"
                              />
                            ) : (
                              <XCircle size={16} className="text-rose-500" />
                            )}
                            Request already processed as{" "}
                            <span className="font-bold lowercase">
                              {req.status}
                            </span>
                            .
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                  <User size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No requests found
                </h3>
                <p className="text-slate-400 text-sm">
                  Try adjusting your filters or search.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 transform transition-all scale-100">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto ${confirmModal.type === "accept" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
            >
              {confirmModal.type === "accept" ? (
                <CheckCircle2 size={28} />
              ) : (
                <XCircle size={28} />
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-2 capitalize">
              {confirmModal.type} Request?
            </h3>
            <p className="text-center text-slate-500 text-sm mb-6 px-4">
              Are you sure you want to <strong>{confirmModal.type}</strong> the
              leave request for{" "}
              <span className="text-slate-900 font-bold">
                {confirmModal.employeeName}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusAction}
                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95 flex justify-center items-center gap-2 ${
                  confirmModal.type === "accept"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                }`}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Leave Request Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] transform transition-all animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            {/* Header */}
            <div className="flex justify-between items-center p-5 sm:p-6 sm:px-7 border-b border-slate-100 shrink-0">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Assign Half-Day Leave
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors"
                type="button"
              >
                <XCircle size={24} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-5 sm:p-6 sm:px-7">
              <form onSubmit={handleAssignManualLeave} className="space-y-5 sm:space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Select Employee *
                  </label>

                  {/* Trigger button */}
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    >
                      <span className="truncate pr-4 text-left font-medium">
                        {manualForm.employeePhone
                          ? (() => {
                              const sel = employees.find((e) => e.phone === manualForm.employeePhone);
                              return sel ? `${sel.name} (${sel.department || "No Dept"})` : "-- Select an Employee --";
                            })()
                          : <span className="text-slate-400">-- Select an Employee --</span>}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Desktop inline dropdown (sm and above) */}
                    {dropdownOpen && (
                      <div className="hidden sm:block absolute z-[70] top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl ring-1 ring-black/5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        {employees.length === 0 ? (
                          <div className="px-4 py-5 text-center text-sm text-slate-400">No employees found</div>
                        ) : employees.map((emp) => (
                          <div
                            key={emp._id}
                            onClick={() => { setManualForm({ ...manualForm, employeePhone: emp.phone }); setDropdownOpen(false); }}
                            className={`flex flex-col px-4 py-3 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors hover:bg-slate-50 ${
                              manualForm.employeePhone === emp.phone ? "bg-indigo-50/60" : ""
                            }`}
                          >
                            <span className="font-bold text-slate-800 text-sm truncate">{emp.name}</span>
                            <span className="text-[11px] text-slate-500">{emp.department || "No Dept"} • {emp.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile bottom-sheet (below sm) */}
                  {dropdownOpen && (
                    <div
                      className="sm:hidden fixed inset-0 z-[100] bg-black/40 flex items-end"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div
                        className="w-full bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                          <h4 className="font-extrabold text-slate-900 text-base">Select Employee</h4>
                          <button
                            type="button"
                            onClick={() => setDropdownOpen(false)}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {employees.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">No employees found</div>
                          ) : employees.map((emp) => (
                            <div
                              key={emp._id}
                              onClick={() => { setManualForm({ ...manualForm, employeePhone: emp.phone }); setDropdownOpen(false); }}
                              className={`flex items-center gap-4 px-5 py-4 cursor-pointer active:bg-slate-100 transition-colors ${
                                manualForm.employeePhone === emp.phone ? "bg-indigo-50" : ""
                              }`}
                            >
                              <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-base flex items-center justify-center shrink-0">
                                {emp.name?.charAt(0)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-800 text-sm truncate">{emp.name}</span>
                                <span className="text-xs text-slate-500">{emp.department || "No Dept"} • {emp.phone}</span>
                              </div>
                              {manualForm.employeePhone === emp.phone && (
                                <CheckCircle2 size={18} className="text-indigo-600 ml-auto shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="h-6 shrink-0" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Leave Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, date: e.target.value })
                    }
                    className="w-full px-4 py-3.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Shift Slot *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, shift: "Morning" })}
                      className={`py-3.5 sm:py-3 rounded-xl border font-bold text-sm transition-all flex justify-center items-center gap-2 ${
                        manualForm.shift === "Morning"
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-lg">☀️</span> Morning
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, shift: "Afternoon" })}
                      className={`py-3.5 sm:py-3 rounded-xl border font-bold text-sm transition-all flex justify-center items-center gap-2 ${
                        manualForm.shift === "Afternoon"
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-lg">🌤️</span> Afternoon
                    </button>
                  </div>
                </div>

                <div className="pt-2 sm:pt-0 pb-2 sm:pb-0">
                  <button
                    type="submit"
                    disabled={manualLoading}
                    className="w-full py-4 sm:py-3.5 bg-slate-900 text-white text-base sm:text-sm font-extrabold rounded-xl shadow-lg shadow-slate-300 transition-all hover:bg-indigo-600 active:scale-[0.98] flex justify-center items-center"
                  >
                    {manualLoading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      "Confirm & Auto-Approve"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

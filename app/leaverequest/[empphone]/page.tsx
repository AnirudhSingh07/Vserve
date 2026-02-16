"use client";

import Navbar from "@/components/Navbar";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function LeaveRequestPage() {
  const { empphone } = useParams();

  // State Management
  const [leaveType, setLeaveType] = useState<"today" | "range" | "half">(
    "range",
  );
  const [formData, setFormData] = useState({
    phoneNo: empphone || "",
    subject: "",
    message: "",
    leaveFrom: "",
    leaveTo: "",
    numberOfDays: 0,
    halfDaySlot: null as "Morning" | "Afternoon" | null,
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<
    "all" | "today" | "yesterday" | "custom"
  >("all");
  const [customDate, setCustomDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // 1. Sync Form Data based on Leave Type
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    if (leaveType === "today") {
      setFormData((prev) => ({
        ...prev,
        leaveFrom: todayStr,
        leaveTo: todayStr,
        numberOfDays: 1,
        halfDaySlot: null,
      }));
    } else if (leaveType === "half") {
      setFormData((prev) => ({
        ...prev,
        leaveFrom: prev.leaveFrom || todayStr,
        leaveTo: prev.leaveFrom || todayStr,
        numberOfDays: 1, // Per your requirement: half day counted as 1
        halfDaySlot: prev.halfDaySlot || "Morning",
      }));
    } else {
      setFormData((prev) => ({ ...prev, halfDaySlot: null }));
    }
  }, [leaveType]);

  // 2. Calculate Date Range
  useEffect(() => {
    if (leaveType === "range" && formData.leaveFrom && formData.leaveTo) {
      const start = new Date(formData.leaveFrom);
      const end = new Date(formData.leaveTo);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData((prev) => ({
        ...prev,
        numberOfDays: diffDays > 0 ? diffDays : 0,
      }));
    }
  }, [formData.leaveFrom, formData.leaveTo, leaveType]);

  // 3. Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notification/getnotification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNo: empphone }),
        });
        const data = await res.json();
        if (res.ok) setNotifications(data.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [empphone]);

  // 4. Filter Logic
  const filteredNotifications = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    return notifications.filter((notif) => {
      const notifDate = new Date(notif.createdAt || new Date())
        .toISOString()
        .split("T")[0];
      if (filterType === "today") return notifDate === todayStr;
      if (filterType === "yesterday") return notifDate === yesterdayStr;
      if (filterType === "custom") return notifDate === customDate;
      return true;
    });
  }, [notifications, filterType, customDate]);

  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
    setLoading(true);
    try {
      const response = await fetch("/api/notification/leavereq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus({ type: "success", msg: "Submitted" });
        // Refresh local list or reset form
        setFormData({
          phoneNo: empphone || "",
          subject: "",
          message: "",
          leaveFrom: "",
          leaveTo: "",
          numberOfDays: 0,
          halfDaySlot: null,
        });
      } else {
        setStatus({ type: "error", msg: "Failed to submit" });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Server Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-25">
        <div className="px-4 sm:px-6 py-5">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT COLUMN: APPLICATION FORM --- */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24 overflow-hidden">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Leave Application
              </h2>

              <form onSubmit={handleOpenModal} className="space-y-5">
                {/* Leave Type Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {(["today", "half", "range"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLeaveType(t)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                        leaveType === t
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t === "range" ? "Range" : t}
                    </button>
                  ))}
                </div>

                {/* Half Day Slot Picker */}
                {leaveType === "half" && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-3">
                      {(["Morning", "Afternoon"] as const).map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, halfDaySlot: slot })
                          }
                          className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                            formData.halfDaySlot === slot
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-gray-100 text-gray-400"
                          }`}
                        >
                          {slot === "Morning" ? "☀️ Morning" : "🌤️ Afternoon"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-gray-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={leaveType !== "range" ? "col-span-2" : ""}>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                      {leaveType === "range" ? "From Date" : "Leave Date"}
                    </label>
                    <input
                      type="date"
                      required
                      disabled={leaveType === "today"}
                      className="w-full rounded-xl border border-gray-200 p-3 disabled:bg-gray-50"
                      value={formData.leaveFrom}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leaveFrom: e.target.value,
                          leaveTo:
                            leaveType !== "range"
                              ? e.target.value
                              : formData.leaveTo,
                        })
                      }
                    />
                  </div>
                  {leaveType === "range" && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full rounded-xl border border-gray-200 p-3"
                        value={formData.leaveTo}
                        onChange={(e) =>
                          setFormData({ ...formData, leaveTo: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-sm font-semibold text-blue-700">
                    Duration
                  </span>
                  <span className="text-sm font-black text-blue-800 bg-white px-3 py-1 rounded-lg shadow-sm">
                    {formData.numberOfDays} Day(s)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                    Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-100 transform active:scale-[0.98]"
                >
                  Verify Application
                </button>
              </form>

              {/* SUCCESS OVERLAY */}
              {status?.type === "success" && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white animate-in fade-in zoom-in duration-500 p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Submitted!
                  </h2>
                  <p className="text-gray-500 mb-8">
                    Your leave request is now pending approval.
                  </p>
                  <button
                    onClick={() => {
                      setStatus(null);
                      window.location.reload();
                    }}
                    className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl transition"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: NOTIFICATION HISTORY --- */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[600px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-50 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">History</h2>
                  <p className="text-sm text-gray-500">
                    Recent leave notifications
                  </p>
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="text-sm border border-gray-200 rounded-xl p-2.5 bg-gray-50 outline-none"
                  >
                    <option value="all">All Records</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="custom">Pick Date</option>
                  </select>
                  {filterType === "custom" && (
                    <input
                      type="date"
                      className="text-sm border border-gray-200 rounded-xl p-2.5 bg-gray-50"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif, idx) => {
                    // FIX: Explicitly check if halfDaySlot has a value to determine Half Day status
                    const isHalfDay =
                      notif.halfDaySlot && notif.halfDaySlot !== "";

                    return (
                      <div
                        key={idx}
                        className="p-5 border border-gray-50 rounded-2xl hover:bg-gray-50 transition border-l-4 border-l-blue-500 group relative bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">
                                {notif.subject}
                              </span>

                              {/* FIXED LABEL: Now showing clearly for Half Day requests */}
                              {isHalfDay && (
                                <span className="text-[9px] bg-orange-500 text-white px-2 py-0.5 rounded-md font-black tracking-tighter">
                                  HALF DAY
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-gray-800 text-lg">
                              {notif.employeeName}
                            </h4>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              notif.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : notif.status === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {notif.status || "Pending"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 italic mb-4 leading-relaxed">
                          "{notif.message}"
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-tight">
                              Applied Date
                            </p>
                            <p className="text-xs font-bold text-gray-700">
                              {new Date(notif.leaveFrom).toLocaleDateString(
                                undefined,
                                { dateStyle: "medium" },
                              )}
                            </p>

                            {/* FIXED SHIFT LABEL: Showing Morning/Afternoon under the date */}
                            {isHalfDay && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                  {notif.halfDaySlot === "Morning"
                                    ? "☀️ Morning Shift"
                                    : "🌤️ Afternoon Shift"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Hide "Until" for half days as they are single-day events */}
                          {!isHalfDay && notif.leaveFrom !== notif.leaveTo && (
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-tight">
                                Returning On
                              </p>
                              <p className="text-xs font-bold text-gray-700">
                                {new Date(notif.leaveTo).toLocaleDateString(
                                  undefined,
                                  { dateStyle: "medium" },
                                )}
                              </p>
                            </div>
                          )}

                          <div className="sm:text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-tight">
                              Duration
                            </p>
                            <p className="text-xs font-black text-blue-600">
                              {notif.numberOfDays}{" "}
                              {notif.numberOfDays === 1 ? "Day" : "Days"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center text-gray-400 font-medium">
                    No leave records found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- VERIFICATION SLIP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                Verify Details
              </h3>
              <p className="text-sm text-gray-500">
                Review before final submission.
              </p>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Subject
                  </p>
                  <p className="text-gray-800 font-bold">{formData.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Leave Type
                  </p>
                  <p className="text-gray-800 font-bold capitalize">
                    {leaveType === "half"
                      ? `Half Day (${formData.halfDaySlot})`
                      : leaveType}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Duration
                  </p>
                  <p className="text-blue-600 font-bold">
                    {formData.numberOfDays} Day(s)
                  </p>
                </div>
                <div className="col-span-2 p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      From
                    </p>
                    <p className="text-sm font-bold">{formData.leaveFrom}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      To
                    </p>
                    <p className="text-sm font-bold">{formData.leaveTo}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Message
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    "{formData.message}"
                  </p>
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-green-400 bg-white hover:text-white hover:bg-green-400 rounded-xl border border-green-400 transition"
              >
                Edit
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

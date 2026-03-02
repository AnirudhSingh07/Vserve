"use client";

import React, { useState, useEffect } from "react";

export default function LeaveRequestPage() {
  const [formData, setFormData] = useState({
    phone: "",
    subject: "",
    message: "",
    leaveFrom: "",
    leaveTo: "",
    numberOfDays: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Calculate days automatically
  useEffect(() => {
    if (formData.leaveFrom && formData.leaveTo) {
      const start = new Date(formData.leaveFrom);
      const end = new Date(formData.leaveTo);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData((prev) => ({
        ...prev,
        numberOfDays: diffDays > 0 ? diffDays : 0,
      }));
    }
  }, [formData.leaveFrom, formData.leaveTo]);

  // 1. Intercept Submit to show Modal
  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  // 2. Final API Call from Modal
  const handleConfirmSubmit = async () => {
    setIsModalOpen(false); // Close modal
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/notification/leavereq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: "success", msg: "Leave request sent successfully!" });
        setFormData({
          phone: "",
          subject: "",
          message: "",
          leaveFrom: "",
          leaveTo: "",
          numberOfDays: 0,
        });
      } else {
        setStatus({
          type: "error",
          msg: result.error || "Something went wrong",
        });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Leave Application
        </h2>

        <form onSubmit={handleOpenModal} className="space-y-5">
          {/* Form Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Phone Number
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Subject
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600">
                From
              </label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.leaveFrom}
                onChange={(e) =>
                  setFormData({ ...formData, leaveFrom: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600">
                To
              </label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.leaveTo}
                onChange={(e) =>
                  setFormData({ ...formData, leaveTo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="text-right text-sm text-gray-500 font-medium">
            Total Leave Duration:{" "}
            <span className="text-blue-600 font-bold">
              {formData.numberOfDays} Days
            </span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Reason
            </label>
            <textarea
              required
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Review and Submit
          </button>

          {status && (
            <div
              className={`mt-4 p-3 rounded-lg text-center font-medium ${status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {status.msg}
            </div>
          )}
        </form>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Leave Request
            </h3>

            <div className="space-y-3 text-sm text-gray-700 border-y py-4">
              <p>
                <span className="font-semibold">Subject:</span>{" "}
                {formData.subject}
              </p>
              <p>
                <span className="font-semibold">Duration:</span>{" "}
                {formData.leaveFrom} to {formData.leaveTo}
              </p>
              <p>
                <span className="font-semibold">Total Days:</span>{" "}
                {formData.numberOfDays}
              </p>
              <p className="italic text-gray-500 line-clamp-2">
                "{formData.message}"
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white bg-opacity-70">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

interface Props {
  phone?: string;
}

export default function CheckInOutButtons({ phone }: Props) {
  const [loading, setLoading] = useState(false);

  if (!phone) return null;

  const handleCheck = async (type: "checkin" | "checkout") => {
    try {
      const now = new Date();
      const hours = now.getHours();
      if (hours < 6 || hours >= 23) {
        alert(
          `${
            type === "checkin" ? "Check-in" : "Check-out"
          } allowed only between 6:00 AM and 11:00 PM`
        );
        return;
      }

      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/attendance/${type}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, coords: { lat: 0, lng: 0 } }),
        }
      );
      const data = await res.json();
      alert(data.message ?? data.error);
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Error during check-in/out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex gap-4">
      <button
        onClick={() => handleCheck("checkin")}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        Check In
      </button>
      <button
        onClick={() => handleCheck("checkout")}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Check Out
      </button>
    </div>
  );
}

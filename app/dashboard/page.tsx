"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Circle,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Constants
const OFFICE_CENTER = { lat: 22.99793312024704, lng: 76.06059952886626 };
const OFFICE_RADIUS_METERS = 2000;

// Utilities
const haversineMeters = (coords1: any, coords2: any) => {
  const R = 6371000;
  const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
  const dLng = ((coords2.lng - coords1.lng) * Math.PI) / 180;
  const lat1 = (coords1.lat * Math.PI) / 180;
  const lat2 = (coords2.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Google Maps Libraries
const libraries: "places"[] = ["places"];

// Types
type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
};

export default function DashboardPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [inside, setInside] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [path, setPath] = useState<Array<[number, number]>>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  // ✅ Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // ✅ Fetch Logged-in User + Attendance Status
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();

        if (!data.loggedIn) throw new Error("Not logged in");
        setUserData({
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
        });

        // 👇 Fetch attendance status (with access time restriction)
        const attRes = await fetch("/api/attendance/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: data.user.phone }),
        });

        const attData = await attRes.json();

        if (attData.accessDenied) {
          alert(
            attData.message ||
              "Access restricted: You can only check in between 8:00 AM and 7:00 PM."
          );
          setCheckedIn(false);
        } else if (attData.success && attData.checkedIn) {
          setCheckedIn(true);
        } else {
          setCheckedIn(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load user data");
      }
    };
    fetchUser();
  }, []);

  // ✅ Track live location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setInside(haversineMeters(c, OFFICE_CENTER) <= OFFICE_RADIUS_METERS);
        if (checkedIn) setPath((p) => [...p, [c.lat, c.lng]]);
        if (mapRef.current) mapRef.current.panTo(c);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [checkedIn]);

  const canCheckIn = useMemo(() => inside && !checkedIn, [inside, checkedIn]);

  // ✅ Check-In Handler
  const handleCheckIn = async () => {
    if (!coords || !userData?.phone) return alert("Location or user missing");

    try {
      const res = await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userData.phone, coords }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      setCheckedIn(true);
      setPath([]);
      alert("✅ Checked in successfully!");
    } catch (err: any) {
      alert("❌ Check-in failed: " + err.message);
    }
  };

  // ✅ Check-Out Handler
  const handleCheckOut = async () => {
    if (!coords || !userData?.phone) return alert("Location or user missing");

    try {
      const res = await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userData.phone, coords }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error);
      setCheckedIn(false);
      setPath([]);
      alert("✅ Checked out successfully!");
    } catch (err: any) {
      alert("❌ Check-out failed: " + err.message);
    }
  };

  if (!isLoaded)
    return (
      <div className="h-[70vh] flex justify-center items-center">
        Loading Google Map...
      </div>
    );

  return (
    <main>
      <Navbar />
      <div className="p-4 mt-20 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Office Check-In</h1>

        {/* User Info */}
        {userData && (
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Name:</strong> {userData.name}
              </p>
              <p>
                <strong>Email:</strong> {userData.email}
              </p>
              <p>
                <strong>Phone:</strong> {userData.phone}
              </p>
              {userData.role && (
                <p>
                  <strong>Role:</strong> {userData.role}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Google Map */}
        <div style={{ width: "100%", height: "400px" }}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={coords || OFFICE_CENTER}
            zoom={17}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            <Circle
              center={OFFICE_CENTER}
              radius={OFFICE_RADIUS_METERS}
              options={{
                strokeColor: "#3b82f6",
                fillColor: "#93c5fd",
                fillOpacity: 0.2,
              }}
            />
            <Marker position={OFFICE_CENTER} label="Office" />
            {coords && <Marker position={coords} label="You" />}
            {path.length > 1 && (
              <Polyline
                path={path.map(([lat, lng]) => ({ lat, lng }))}
                options={{ strokeColor: "#16a34a", strokeWeight: 4 }}
              />
            )}
          </GoogleMap>
        </div>

        {/* Buttons */}
        <div className="text-center space-x-4">
          {(() => {
            const now = new Date();
            const hour = now.getHours();
            const withinTime = hour >= 6 && hour < 23; // 8 AM - 7 PM

            if (!withinTime) {
              return (
                <button
                  disabled
                  className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
                >
                  Attendance Closed (6:00 AM - 11:00 PM)
                </button>
              );
            }

            if (!checkedIn) {
              return (
                <button
                  onClick={handleCheckIn}
                  disabled={!canCheckIn}
                  className={`px-4 py-2 rounded text-white ${
                    canCheckIn
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Check In
                </button>
              );
            } else {
              return (
                <button
                  onClick={handleCheckOut}
                  disabled={!inside}
                  className={`px-4 py-2 rounded text-white ${
                    inside
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Check Out
                </button>
              );
            }
          })()}
        </div>

        {/* Status */}
        {(() => {
          const now = new Date();
          const hour = now.getHours();
          const withinTime = hour >= 6 && hour < 23;

          if (!withinTime) {
            return (
              <p className="text-red-500 mt-2 text-center">
                Attendance available only between{" "}
                <strong>6:00 AM and 11:00 PM</strong>.
              </p>
            );
          }

          if (!inside) {
            return (
              <p className="text-red-500 mt-2 text-center">
                You are outside office radius.
              </p>
            );
          }

          if (inside && !checkedIn) {
            return (
              <p className="text-green-600 mt-2 text-center">
                You are inside office radius. You can check in.
              </p>
            );
          }

          if (checkedIn) {
            return (
              <p className="text-blue-600 mt-2 text-center">
                Checked in successfully.
              </p>
            );
          }

          return null;
        })()}
      </div>
    </main>
  );
}

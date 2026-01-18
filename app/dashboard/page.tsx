"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Circle,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { Geolocation } from "@capacitor/geolocation"; // ✅ Added Capacitor import
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { set } from "mongoose";

// Constants
const OFFICE_CENTER = { lat: 22.723541, lng: 75.884507 };
const BHOPAL_OFFICE_CENTER = { lat: 23.2349541, lng: 77.4354195 };
const OFFICE_RADIUS_METERS = 200;

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

type UserData = {
  id: string;
  name: string;
  // email: string;
  phone: string;
  role?: string;
};

export default function DashboardPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [inside, setInside] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [path, setPath] = useState<Array<[number, number]>>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [show, setShow] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const WORK_START_HOUR = 9; // 9:00 AM
  const WORK_END_HOUR = 18; // 6:00 PM

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // ✅ Fetch user info and attendance
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();

        if (!data.loggedIn) throw new Error("Not logged in");
        setUserData({
          id: data.user._id,
          name: data.user.name,
          // email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
        });

        const attRes = await fetch("/api/attendance/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: data.user.phone }),
        });

        const attData = await attRes.json();

        if (attData.accessDenied) {
          alert(
            attData.message ||
              "Access restricted: You can only check in between 8:00 AM and 7:00 PM.",
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

  // ✅ Universal Location Watcher (Web + Android)
  useEffect(() => {
    let watchId: number | string | null = null;

    const startTracking = async () => {
      try {
        // Ask permission (works on both web and native)
        const perm = await Geolocation.requestPermissions();
        if (perm.location !== "granted") {
          setError("Location permission not granted");
          return;
        }

        // Use Capacitor's native watcher (automatically works on web too)
        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (position, err) => {
            if (err) {
              console.error("Error watching position:", err);
              setError("Error getting location");
              return;
            }
            if (!position) return;

            const c = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            setCoords(c);
            const insideIndore =
              haversineMeters(c, OFFICE_CENTER) <= OFFICE_RADIUS_METERS;
            const insideBhopal =
              haversineMeters(c, BHOPAL_OFFICE_CENTER) <= OFFICE_RADIUS_METERS;
            setInside(insideIndore || insideBhopal);
            if (checkedIn) setPath((p) => [...p, [c.lat, c.lng]]);
            if (mapRef.current) mapRef.current.panTo(c);
          },
        );
      } catch (err) {
        console.error(err);
        setError("Failed to start location tracking");
      }
    };

    startTracking();

    return () => {
      if (watchId) Geolocation.clearWatch({ id: String(watchId) });
    };
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
      setShow(true);
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
      setShow(false);
      setTimeout(() => setShow(true), 5000);
      alert("✅ Checked out successfully!");
    } catch (err: any) {
      alert("❌ Check-out failed: " + err.message);
    }
  };

  // handler to sent the location of current user to the backend :
  const handleSendLocation = async () => {
    if (!coords || !userData?.phone) {
      alert("Location or user missing");
      return;
    }

    try {
      // 1️⃣ Check check-in status from backend
      const statusRes = await fetch("/api/attendance/ischeckin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userData.phone }),
      });

      const statusData = await statusRes.json();

      if (!statusData.success) {
        throw new Error(statusData.error || "Failed to verify check-in status");
      }

      // 2️⃣ Auto check-in ONLY if not checked in
      if (!statusData.checkedIn) {
        const checkinRes = await fetch("/api/attendance/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: userData.phone,
            coords,
          }),
        });

        const checkinData = await checkinRes.json();

        // tolerate "already checked in" safely
        if (
          !checkinData.success &&
          !checkinData.error?.toLowerCase().includes("already")
        ) {
          throw new Error(checkinData.error || "Auto check-in failed");
        }
      }

      // 3️⃣ Send location (independent of check-in result)
      const locRes = await fetch("/api/attendance/sentloc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: userData.phone,
          coords,
        }),
      });

      const locData = await locRes.json();

      if (!locData.success) {
        throw new Error(locData.error || "Failed to send location");
      }

      alert("📍 Location sent successfully!");
    } catch (err: any) {
      console.error("Send location error:", err);
      alert("❌ Failed to send location: " + err.message);
    }
  };

  if (!isLoaded)
    return (
      <div className="h-[70vh] flex justify-center items-center">
        Loading Google Map...
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-20 md:py-25 space-y-3">
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl text-center font-bold  text-black ">
          Office Check-In
        </h1>

        {/* User Profile Card */}
        {userData && (
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg ">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-md text-gray-700">
              <p>
                <span className="text-lg font-semibold">Name: </span>{" "}
                {userData.name}
              </p>
              <p>
                <span className="text-lg font-semibold">Phone: </span>{" "}
                {userData.phone}
              </p>
              {userData.role && (
                <p>
                  <span className="text-lg font-semibold">Role: </span>{" "}
                  {userData.role}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Map Card */}
        <Card className="rounded-3xl shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle
              className="text-lg
         "
            >
              Live Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[300px] sm:h-[400px]">
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
                <Marker position={OFFICE_CENTER} label="Indore Office" />

                <Circle
                  center={BHOPAL_OFFICE_CENTER}
                  radius={OFFICE_RADIUS_METERS}
                  options={{
                    strokeColor: "#10b981",
                    fillColor: "#6ee7b7",
                    fillOpacity: 0.2,
                  }}
                />
                <Marker position={BHOPAL_OFFICE_CENTER} label="Bhopal Office" />

                {coords && <Marker position={coords} label="You" />}

                {path.length > 1 && (
                  <Polyline
                    path={path.map(([lat, lng]) => ({ lat, lng }))}
                    options={{ strokeColor: "#16a34a", strokeWeight: 4 }}
                  />
                )}
              </GoogleMap>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
            {(() => {
              const now = new Date();
              const hour = now.getHours();
              const withinTime =
                hour >= WORK_START_HOUR && hour < WORK_END_HOUR;

              if (!withinTime) {
                return (
                  <button
                    disabled
                    className="px-6 py-3  text-gray-700 rounded-full text-sm cursor-not-allowed"
                  >
                    Attendance Closed (9:00 AM – 6:00 PM)
                  </button>
                );
              }

              if (!checkedIn) {
                return (
                  <button
                    onClick={handleCheckIn}
                    disabled={!canCheckIn}
                    className={`px-6 py-3 rounded-full text-sm font-medium text-white transition ${
                      canCheckIn
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Check In
                  </button>
                );
              }
              // if (checkedIn) {
              //   return (
              //     <button
              //       onClick={handleCheckOut}
              //       disabled={!inside}
              //       className={`px-6 py-3 rounded-full text-sm font-medium text-white transition ${
              //         inside
              //           ? "bg-red-600 hover:bg-red-700"
              //           : "bg-gray-400 cursor-not-allowed"
              //       }`}
              //     >
              //       Check Out
              //     </button>
              //   );
              // }
            })()}

            {checkedIn && (
              <button
                onClick={handleCheckOut}
                disabled={!inside}
                className={`px-6 py-3 rounded-full text-sm font-medium text-white transition ${
                  inside
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Check Out
              </button>
            )}

            {(() => {
              const now = new Date();
              const hour = now.getHours();
              const withinTime =
                hour >= WORK_START_HOUR && hour < WORK_END_HOUR;

              // if (!withinTime) return null;

              return (
                show && (
                  <button
                    onClick={handleSendLocation}
                    className="px-6 py-3 rounded-full text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition"
                  >
                    Send Location
                  </button>
                )
              );
            })()}
          </div>
        </div>

        {/* Status Messages */}
        <div className="text-center text-sm">
          {(() => {
            const now = new Date();
            const hour = now.getHours();
            const withinTime = hour >= WORK_START_HOUR && hour < WORK_END_HOUR;

            if (!withinTime) {
              return (
                <p className="text-red-500">
                  Attendance available only between{" "}
                  <strong>9:00 AM and 6:00 PM</strong>.
                </p>
              );
            }

            if (!inside) {
              return (
                <p className="text-red-500">You are outside office radius.</p>
              );
            }

            if (inside && !checkedIn) {
              return (
                <p className="text-green-600">
                  You are inside office radius. You can check in.
                </p>
              );
            }

            if (checkedIn) {
              return (
                <p className="text-blue-600">
                  Checked in successfully. Location tracking active.
                </p>
              );
            }

            return null;
          })()}
        </div>
      </div>
    </main>
  );
}

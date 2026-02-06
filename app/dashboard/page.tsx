"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Circle,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { Geolocation } from "@capacitor/geolocation";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  phone: string;
  role?: string;
};

export default function DashboardPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [inside, setInside] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<Array<[number, number]>>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [show, setShow] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ New Loading States
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const WORK_START_HOUR = 9; // 9:00 AM
  const WORK_END_HOUR = 18; // 6:00 PM

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // This will trigger every time checkedIn actually changes
  useEffect(() => {
    console.log("Verified State Change - checkedIn is now:", checkedIn);
    console.log("Verified State change - show is now :", show);
  }, [checkedIn, show]);

  // ✅ Fetch user info and attendance status on mount/refresh
  useEffect(() => {
    const fetchUserAndStatus = async () => {
      try {
        // setLoading(true); // Uncomment if you have this state defined

        // 1️⃣ Get User Data
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();

        if (!data.loggedIn) throw new Error("Not logged in");

        setUserData({
          id: data.user._id,
          name: data.user.name,
          phone: data.user.phone,
          role: data.user.role,
        });

   

        // 3️⃣ Persistent Check-In State
        const checkinStatusRes = await fetch("/api/attendance/ischeckin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: data.user.phone }),
        });
        const statusData = await checkinStatusRes.json();

        if (statusData.success) {
          setCheckedIn(statusData.checkedIn);
        }

        // 4️⃣ NEW: Persistent Check-Out State
        // Checks if the employee has already finished their shift for today
        const checkoutStatusRes = await fetch("/api/attendance/isCheckout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: data.user.phone }),
        });
        const checkoutData = await checkoutStatusRes.json();

        if (checkoutData.success) {
          // If checkoutData.checkedOut is true, it means they are done.
          // We set setShow(false) to hide the action buttons.
          setShow(!checkoutData.checkedOut);
          console.log("Is already checked out:", checkoutData.checkedOut);
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to load user data");
      } finally {
        // setLoading(false);
      }
    };

    fetchUserAndStatus();
  }, []);

  // ✅ Universal Location Watcher
  useEffect(() => {
    let watchId: string | null = null;

    const startTracking = async () => {
      try {
        const perm = await Geolocation.requestPermissions();
        if (perm.location !== "granted") {
          setError("Location permission not granted");
          return;
        }

        const currentPos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        if (currentPos) {
          updateLocationState(
            currentPos.coords.latitude,
            currentPos.coords.longitude,
          );
        }

        watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 3000,
          },
          (position, err) => {
            if (err) {
              console.error("Watcher Error:", err);
              return;
            }
            if (position) {
              updateLocationState(
                position.coords.latitude,
                position.coords.longitude,
              );
            }
          },
        );
      } catch (err) {
        console.error("Tracking failed:", err);
        setError("Failed to start tracking");
      }
    };

    const updateLocationState = (lat: number, lng: number) => {
      const c = { lat, lng };
      setCoords(c);

      const insideIndore =
        haversineMeters(c, OFFICE_CENTER) <= OFFICE_RADIUS_METERS;
      const insideBhopal =
        haversineMeters(c, BHOPAL_OFFICE_CENTER) <= OFFICE_RADIUS_METERS;
      setInside(insideIndore || insideBhopal);

      if (checkedIn) {
        setPath((p) => [...p, [lat, lng]]);
      }

      if (mapRef.current) {
        mapRef.current.panTo(c);
      }
    };

    startTracking();

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [checkedIn]);

  const canCheckIn = useMemo(() => inside && !checkedIn, [inside, checkedIn]);

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

  // ✅ Updated: Handle Send Location with Loading State
  const handleSendLocation = async () => {
    if (!coords || !userData?.phone) {
      alert("Location or user missing");
      return;
    }

    setIsSendingLocation(true); // Start loading

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

        if (
          !checkinData.success &&
          !checkinData.error?.toLowerCase().includes("already")
        ) {
          throw new Error(checkinData.error || "Auto check-in failed");
        }
      }
      // 3️⃣ Send location
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
    } finally {
      setIsSendingLocation(false); // Stop loading
    }
  };

  // ✅ Updated: Force Request Location with Loading State
  const forceRequestLocation = () => {
    if (!("geolocation" in navigator)) {
      setPermissionError("Browser does not support geolocation.");
      return;
    }

    setIsRequestingPermission(true); // Start loading

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Success!", pos);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPermissionError(null);
        setIsRequestingPermission(false); // Stop loading success
      },
      (err) => {
        console.error(err);
        if (err.code === 1)
          setPermissionError(
            "You denied location access. Please reset it in browser settings.",
          );
        if (err.code === 2) setPermissionError("Position unavailable.");
        if (err.code === 3) setPermissionError("Timed out.");
        setIsRequestingPermission(false); // Stop loading error
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
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
        <h1 className="text-2xl md:text-3xl text-center font-bold text-black ">
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
            <CardTitle className="text-lg">Live Location</CardTitle>
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
                    className="px-6 py-3 text-gray-700 rounded-full text-sm cursor-not-allowed"
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
            })()}

            {checkedIn && (
              <button
                onClick={handleCheckOut}
                disabled={!checkedIn}
                className={`px-6 py-3 rounded-full text-sm font-medium text-white transition ${
                  checkedIn
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
              if (!withinTime) return null;
              return (
                show && (
                  // ✅ Updated Send Location Button
                  <button
                    onClick={handleSendLocation}
                    disabled={isSendingLocation} // Disabled when loading
                    className={`px-6 py-3 rounded-full text-sm font-medium text-white transition ${
                      isSendingLocation
                        ? "bg-green-400 cursor-wait"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {isSendingLocation ? "Sending..." : "Send Location"}
                  </button>
                )
              );
            })()}

            {/* ✅ Updated Grant Permission Button */}
          {/*  <button
              onClick={forceRequestLocation}
              disabled={isRequestingPermission} // Disabled when loading
              className={`px-6 py-3 rounded-full text-sm font-medium text-white mt-4 mb-4 transition ${
                isRequestingPermission
                  ? "bg-blue-400 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isRequestingPermission
                ? "Locating..."
                : "📍 Grant Location Permission"}
            </button> */}
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

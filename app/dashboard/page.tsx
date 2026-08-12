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
  const [employeeStats, setEmployeeStats] = useState<{ totalKm: number; totalLocations: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ✅ New Loading States
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const [isSendingHaltLocation, setIsSendingHaltLocation] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // ✅ NEW: Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const WORK_START_HOUR = 8; // 8:00 AM
  const WORK_END_HOUR = 19.30; // 7:30 PM

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  console.log("map key :", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

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

        // Fetch employee stats (total KM + total locations sent)
        setStatsLoading(true);
        try {
          const statsRes = await fetch(`/api/employee/stats?phone=${encodeURIComponent(data.user.phone)}`, {
            cache: "no-store",
          });
          const statsData = await statsRes.json();
          if (statsData.success) {
            setEmployeeStats(statsData.data);
          }
        } catch (statsErr) {
          console.error("Failed to fetch employee stats:", statsErr);
        } finally {
          setStatsLoading(false);
        }

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
          // ✅ FIX: Only hide buttons if truly checked out AND NOT currently checked in.
          // This prevents a prior day's checkout from hiding today's Check-In button.
          const alreadyCheckedOut =
            checkoutData.checkedOut && !statusData.checkedIn;
          setShow(!alreadyCheckedOut);
          console.log("Is already checked out for today:", alreadyCheckedOut);
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to load user data");
      } finally {
        // setLoading(false);
      }
    };
    forceRequestLocation();
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
    setIsCheckingIn(true);
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
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!coords || !userData?.phone) return alert("Location or user missing");
    setIsCheckingOut(true);
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
      alert("✅ Checked out successfully!");
    } catch (err: any) {
      alert("❌ Check-out failed: " + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ✅ Robust location fetcher handling both Capacitor and Web native APIs
  const getFreshLocation = async (): Promise<{ lat: number; lng: number }> => {
    try {
      try {
        const perm = await Geolocation.requestPermissions();
        if (perm.location !== "granted" && perm.location !== "prompt") {
           throw new Error("Permission denied");
        }
      } catch (permErr: any) {
        console.warn("Permission request error (likely web fallback):", permErr);
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (err: any) {
      console.error("Capacitor geolocation failed, trying native web:", err);
      return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (webErr) => reject(webErr),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }
  };

  // ✅ Updated: Handle Send Location with Loading State
  const handleSendLocation = async () => {
    if (!userData?.phone) {
      alert("User data missing");
      return;
    }

    setIsSendingLocation(true); // Start loading

    try {
      // 🔒 Always fetch a FRESH location to ensure device location is currently on
      let freshCoords: { lat: number; lng: number };
      try {
        freshCoords = await getFreshLocation();
        setCoords(freshCoords);
      } catch (locErr: any) {
        console.error("Fresh location fetch failed:", locErr);
        alert(
          "📍 Unable to get your current location. Please make sure location services are turned ON and location permission is granted, then try again."
        );
        return;
      }

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
            coords: freshCoords,
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
          coords: freshCoords,
        }),
      });

      const locData = await locRes.json();

      if (!locData.success) {
        throw new Error(locData.error || "Failed to send location");
      }

      // ✅ Update local state so button text updates automatically
      setCheckedIn(true);
      setShow(true);

      alert("📍 Location sent successfully!");
    } catch (err: any) {
      console.error("Send location error:", err);
      alert("❌ Failed to send location: " + err.message);
    } finally {
      setIsSendingLocation(false); // Stop loading
    }
  };

  // ✅ Handle Halt Location  (Halt Location) with Loading State
  const handleSendHaltLocation = async () => {
    if (!userData?.phone) {
      alert("User data missing");
      return;
    }

    setIsSendingHaltLocation(true); // Start loading

    try {
      // 🔒 Always fetch a FRESH location to ensure device location is currently on
      let freshCoords: { lat: number; lng: number };
      try {
        freshCoords = await getFreshLocation();
        setCoords(freshCoords);
      } catch (locErr: any) {
        console.error("Fresh location fetch failed:", locErr);
        alert(
          "📍 Unable to get your current location. Please make sure location services are turned ON and location permission is granted, then try again."
        );
        return;
      }

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
            coords: freshCoords,
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
      // 3️⃣ Send location with hashalt flag
      const locRes = await fetch("/api/attendance/sentloc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: userData.phone,
          coords: freshCoords,
          hashalt: true,
        }),
      });

      const locData = await locRes.json();

      if (!locData.success) {
        throw new Error(locData.error || "Failed to send location");
      }

      // ✅ Update local state so button text updates automatically
      setCheckedIn(true);
      setShow(true);

      alert("📍 Location sent successfully!");
    } catch (err: any) {
      console.error("Send location error:", err);
      alert("❌ Failed to send location: " + err.message);
    } finally {
      setIsSendingHaltLocation(false); // Stop loading
    }
  };

  // ✅ Updated: Force Request Location with Loading State
  const forceRequestLocation = () => {
    if (!("geolocation" in navigator)) {
      setPermissionError("Browser does not support geolocation.");
      return;
    }

    setIsRequestingPermission(true); // Start loading

    // AFTER (fixed - also calculates and sets `inside`)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Success!", pos);
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);

        // ✅ FIX: Calculate inside here too, not just in the Capacitor watcher
        const insideIndore = haversineMeters(c, OFFICE_CENTER) <= OFFICE_RADIUS_METERS;
        const insideBhopal = haversineMeters(c, BHOPAL_OFFICE_CENTER) <= OFFICE_RADIUS_METERS;
        setInside(insideIndore || insideBhopal);

        setPermissionError(null);
        setIsRequestingPermission(false);
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

  // ✅ NEW: Confirm Checkout
  const confirmCheckOut = async () => {
    setShowCheckoutModal(false);
    await handleCheckOut();
  };

  const now = new Date();
  const hour = now.getHours();
  const withinTime = hour >= WORK_START_HOUR && hour < WORK_END_HOUR;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-20 md:py-25 space-y-5">
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl text-center font-semibold text-gray-800">
          Office Check-In
        </h1>

        {/* User Profile Card */}
        {userData && (
          <Card className="rounded-2xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Name:</span>
                <span>{userData.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Phone:</span>
                <span>{userData.phone}</span>
              </div>
              {userData.role && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Role:</span>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                    {userData.role}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Map Card */}
        <Card className="rounded-2xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-800">Live Location</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[300px] sm:h-[400px]">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={coords || OFFICE_CENTER}
                zoom={17}
                mapTypeId="satellite"
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
        <Card className="rounded-2xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-sm">
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
              {(() => {
                if (!withinTime) {
                  return (
                    <span className="px-5 py-2.5 text-gray-500 bg-gray-100 rounded-full text-sm cursor-not-allowed border border-gray-200">
                      Attendance Closed (8:00 AM – 7:30 PM)
                    </span>
                  );
                }

                // ✅ FIX: Show Check In button whenever inside office & not yet checked in.
                // Removed '&& show' guard — show=false must NOT block the ability to check in.
                if (canCheckIn) {
                  return (
                    <button
                      onClick={handleCheckIn}
                      disabled={!canCheckIn || isCheckingIn}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all flex items-center gap-2 shadow-md ${isCheckingIn
                          ? "bg-blue-400 cursor-wait"
                          : canCheckIn
                            ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                      {isCheckingIn && (
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {isCheckingIn ? "Checking In..." : "Check In"}
                    </button>
                  );
                }
              })()}

              {(() => {
                const now = new Date();
                const hour = now.getHours();
                const withinTime =
                  hour >= WORK_START_HOUR && hour < WORK_END_HOUR;
                if (!withinTime) return null;
                return (
                  show && (
                    <button
                      onClick={() => setShowCheckoutModal(true)}
                      disabled={!checkedIn || isCheckingOut}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all flex items-center gap-2 shadow-md ${isCheckingOut
                          ? "bg-red-400 cursor-wait"
                          : checkedIn
                            ? "bg-red-500 hover:bg-red-600 hover:shadow-lg"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                      {isCheckingOut && (
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {isCheckingOut ? "Checking Out..." : "Check Out"}
                    </button>
                  )
                );
              })()}

              {(() => {
                const now = new Date();
                const hour = now.getHours();
                const withinTime =
                  hour >= WORK_START_HOUR && hour < WORK_END_HOUR;
                if (!withinTime) return null;
                return (
                  show && (
                    <>
                      {/* ✅ Updated Send Location Button with Dynamic Text */}
                      <button
                        onClick={handleSendLocation}
                        disabled={isSendingLocation || isSendingHaltLocation}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all shadow-md ${isSendingLocation
                          ? "bg-green-400 cursor-wait"
                          : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                          }`}
                      >
                        {isSendingLocation
                          ? "Sending..."
                          : (checkedIn ? "Send Location" : "Check-in/Start")
                        }
                      </button>

                      {/* ✅ Halt Location Button */}
                      <button
                        onClick={handleSendHaltLocation}
                        disabled={isSendingHaltLocation || isSendingLocation}
                        className={`px-6 py-2.5 rounded-full text-sm font-medium text-slate-800 transition-all shadow-md ${isSendingHaltLocation
                          ? "bg-yellow-300 cursor-wait opacity-70"
                          : "bg-yellow-400 hover:bg-yellow-500 hover:shadow-lg"
                          }`}
                      >
                        {isSendingHaltLocation ? "Sending..." : "Halt Location"}
                      </button>
                    </>
                  )
                );
              })()}

              {/* ✅ Updated Grant Permission Button */}
              {/*<button
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
          </CardContent>
        </Card>

        {/* Checkout Confirmation Modal */}
        {showCheckoutModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-6 w-[90%] max-w-sm text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Confirm Check Out</h2>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to check out for today?
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmCheckOut}
                  className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all shadow-md"
                >
                  Yes, Check Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        <Card className="rounded-2xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="text-center text-sm">
              {(() => {
                const now = new Date();
                const hour = now.getHours();
                const withinTime = hour >= WORK_START_HOUR && hour < WORK_END_HOUR;

                if (!withinTime) {
                  return (
                    <p className="text-red-500 font-medium">
                      Attendance available only between{" "}
                      <strong>8:00 AM and 7:30 PM</strong>.
                    </p>
                  );
                }

                if (!inside) {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-200">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      You are outside office radius.
                    </span>
                  );
                }

                if (inside && !checkedIn) {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      You are inside office radius. You can check in.
                    </span>
                  );
                }

                if (checkedIn) {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      Checked in successfully. Location tracking active.
                    </span>
                  );
                }

                return null;
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Employee Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total KM Card */}
          <Card className="rounded-2xl shadow-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="py-5 flex flex-col items-center justify-center gap-1 text-center">
              <div className="text-3xl">
                🛣️
              </div>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mt-1">Today's Distance</p>
              {statsLoading ? (
                <span className="inline-block h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mt-1" />
              ) : (
                <p className="text-2xl font-bold text-blue-700">
                  {employeeStats ? `${employeeStats.totalKm} km` : "—"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Locations Sent Card */}
          <Card className="rounded-2xl shadow-xl border border-green-100 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="py-5 flex flex-col items-center justify-center gap-1 text-center">
              <div className="text-3xl">
                📍
              </div>
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mt-1">Today's Pings</p>
              {statsLoading ? (
                <span className="inline-block h-5 w-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin mt-1" />
              ) : (
                <p className="text-2xl font-bold text-green-700">
                  {employeeStats ? employeeStats.totalLocations : "—"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import {
//   useJsApiLoader,
//   GoogleMap,
//   Marker,
//   Circle,
//   Polyline,
// } from "@react-google-maps/api";
// import Navbar from "@/components/Navbar";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import AttendanceList from "@/components/dashboard/attendance-list";
// const OFFICE_CENTER = { lat: 23.1575299, lng: 75.79963555 };
// const OFFICE_RADIUS_METERS = 200; // 200 meters
// const haversineMeters = (
//   coords1: { lat: number; lng: number },
//   coords2: { lat: number; lng: number }
// ) => {
//   const R = 6371000;
//   const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
//   const dLng = ((coords2.lng - coords1.lng) * Math.PI) / 180;
//   const lat1 = (coords1.lat * Math.PI) / 180;
//   const lat2 = (coords2.lat * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// type AttendanceRecord = {
//   date: string;
//   checkInTime?: number;
//   checkInLocation?: { lat: number; lng: number };
//   checkOutTime?: number;
//   checkOutLocation?: { lat: number; lng: number };
//   status?: "on-time" | "late";
//   lateApproved?: boolean;
// };

// export default function DashboardPage() {
//   const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
//     null
//   );
//   const [inside, setInside] = useState(false);
//   const [checkedIn, setCheckedIn] = useState(false);
//   const [path, setPath] = useState<Array<[number, number]>>([]);
//   const [userData, setUserData] = useState<any>(null);
//   const [auth, setAuth] = useState<any>(null); // Store logged-in user info
//   const [authPhone, setAuthPhone] = useState<string | null>(null);
//   const [attRec, setAttRec] = useState<AttendanceRecord | null>(null);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   const mapRef = useRef<google.maps.Map | null>(null);
//   // ✅ Fetch employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const res = await fetch("/api/employees");
//         const data = await res.json();
//         if (!data.success) throw new Error(data.error);
//         setEmployees(data.employees);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // ✅ Load Google Maps API
//   const { isLoaded } = useJsApiLoader({
//     id: "google-map-script",
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//     libraries: ["places"],
//   });

//   const canCheckIn = useMemo(() => inside && !checkedIn, [inside, checkedIn]);

//   // Load user data from backend or localStorage
//   useEffect(() => {
//     const auth = JSON.parse(localStorage.getItem("auth") || "null");
//     if (!auth) return;
//     setUserData(auth); // assuming auth has { name, phone, email, role }
//   }, []);

//   // Track user location
//   // useEffect(() => {
//   //   if (!navigator.geolocation) return;
//   //   const watchId = navigator.geolocation.watchPosition(
//   //     (p) => {
//   //       const c = { lat: p.coords.latitude, lng: p.coords.longitude };
//   //       setCoords(c);
//   //       const insideRadius =
//   //         haversineMeters(c, OFFICE_CENTER) <= OFFICE_RADIUS_METERS;
//   //       setInside(insideRadius);
//   //       if (checkedIn) setPath((prev) => [...prev, [c.lat, c.lng]]);
//   //       console.log("Coords:", c, "Inside:", insideRadius);
//   //     },
//   //     (err) => console.error(err),
//   //     { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
//   //   );
//   //   return () => navigator.geolocation.clearWatch(watchId);
//   // }, [checkedIn]);

//   // ✅ Track live user location
//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError("Geolocation is not supported by this browser.");
//       return;
//     }

//     const watchId = navigator.geolocation.watchPosition(
//       (pos) => {
//         const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
//         setCoords(c);
//         const insideRadius =
//           haversineMeters(c, OFFICE_CENTER) <= OFFICE_RADIUS_METERS;
//         setInside(insideRadius);
//         if (checkedIn) setPath((prev) => [...prev, [c.lat, c.lng]]);
//         if (mapRef.current) mapRef.current.panTo(c);
//       },
//       (err) => {
//         console.error("Geolocation error:", err.message);
//         setError(err.message);
//       },
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//     );

//     return () => navigator.geolocation.clearWatch(watchId);
//   }, [checkedIn]);

//   // ✅ Check-In handler
//   const handleCheckIn = async () => {
//     if (!coords || !userData?.phone) return;
//     try {
//       const res = await fetch("/api/attendance/checkin", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone: userData.phone, coords }),
//       });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.error);
//       setCheckedIn(true);
//       setPath([]);
//       alert("Checked in successfully!");
//     } catch (err: any) {
//       alert("Check-in failed: " + err.message);
//     }
//   };

//   // ✅ Check-Out handler
//   const handleCheckOut = async () => {
//     if (!coords || !userData?.phone) return;
//     try {
//       const res = await fetch("/api/attendance/checkout", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone: userData.phone, coords }),
//       });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.error);
//       setCheckedIn(false);
//       setPath([]);
//       alert("Checked out successfully!");
//     } catch (err: any) {
//       alert("Check-out failed: " + err.message);
//     }
//   };

//   // ✅ Recenter map manually
//   const handleRecenter = () => {
//     if (coords && mapRef.current) mapRef.current.panTo(coords);
//   };

//   if (!isLoaded) {
//     return (
//       <div className="h-[70vh] flex justify-center items-center">
//         Loading Google Map...
//       </div>
//     );
//   }

//   if (!isLoaded)
//     return (
//       <div className="h-[70vh] flex justify-center items-center">
//         Loading map...
//       </div>
//     );

//   return (
//     <main>
//       <Navbar />
//       <div className="p-4 max-w-3xl mx-auto space-y-4">
//         <h1 className="text-2xl font-bold text-center">Office Check-In</h1>

//         {/* User Info */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Employee List</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {employees.length > 0 ? (
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="border-b">
//                     <th className="py-2">Name</th>
//                     <th className="py-2">Phone</th>
//                     <th className="py-2">Email</th>
//                     <th className="py-2">Role</th>
//                     <th className="py-2">Department</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employees.map((emp) => (
//                     <tr key={emp._id} className="border-b hover:bg-gray-50">
//                       <td className="py-2">{emp.name}</td>
//                       <td className="py-2">{emp.phone}</td>
//                       <td className="py-2">{emp.email}</td>
//                       <td className="py-2">{emp.role}</td>
//                       <td className="py-2">{emp.department}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <p>No employees found.</p>
//             )}
//           </CardContent>
//         </Card>

//         {/* Google Map */}
//         <div style={{ width: "100%", height: "400px" }}>
//           <GoogleMap
//             mapContainerStyle={{ width: "100%", height: "100%" }}
//             center={coords || OFFICE_CENTER}
//             zoom={17}
//           >
//             <Circle
//               center={OFFICE_CENTER}
//               radius={OFFICE_RADIUS_METERS}
//               options={{
//                 strokeColor: "#3b82f6",
//                 fillColor: "#93c5fd",
//                 fillOpacity: 0.2,
//               }}
//             />
//             {coords && <Marker position={coords} label="You" />}
//             <Marker position={OFFICE_CENTER} label="Office" />
//             {path.length > 1 && (
//               <Polyline
//                 path={path.map(([lat, lng]) => ({ lat, lng }))}
//                 options={{ strokeColor: "#16a34a", strokeWeight: 4 }}
//               />
//             )}
//           </GoogleMap>
//         </div>

//         {/* Check-In / Check-Out Buttons */}
//         <div className="text-center space-x-4">
//           <button
//             onClick={handleCheckIn}
//             disabled={!canCheckIn}
//             className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//           >
//             Check In
//           </button>
//           <button
//             onClick={handleCheckOut}
//             disabled={!checkedIn}
//             className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
//           >
//             Check Out
//           </button>
//         </div>

//         {/* Status */}
//         {!inside && (
//           <p className="text-red-500 mt-2 text-center">
//             You are outside office radius.
//           </p>
//         )}
//         {inside && !checkedIn && (
//           <p className="text-green-600 mt-2 text-center">
//             You are inside office radius. You can check in.
//           </p>
//         )}
//         {checkedIn && (
//           <p className="text-blue-600 mt-2 text-center">
//             Checked in successfully.
//           </p>
//         )}
//       </div>
//     </main>
//   );
// }

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Circle,
  Polyline,
} from "@react-google-maps/api";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttendanceList from "@/components/dashboard/attendance-list";

const OFFICE_CENTER = { lat: 23.1575299, lng: 75.79963555 };
const OFFICE_RADIUS_METERS = 200; // 200 meters
const haversineMeters = (
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
) => {
  const R = 6371000;
  const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
  const dLng = ((coords2.lng - coords1.lng) * Math.PI) / 180;
  const lat1 = (coords1.lat * Math.PI) / 180;
  const lat2 = (coords2.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

type AttendanceRecord = {
  date: string;
  checkInTime?: number;
  checkInLocation?: { lat: number; lng: number };
  checkOutTime?: number;
  checkOutLocation?: { lat: number; lng: number };
  status?: "on-time" | "late";
  lateApproved?: boolean;
};

export default function DashboardPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [inside, setInside] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [path, setPath] = useState<Array<[number, number]>>([]);
  const [userData, setUserData] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null); // Store logged-in user info
  const [authPhone, setAuthPhone] = useState<string | null>(null);
  const [attRec, setAttRec] = useState<AttendanceRecord | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef<google.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // ✅ Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        console.log("[employees] fetching /api/employees");
        const res = await fetch("/api/employees");
        const data = await res.json();
        console.log("[employees] response", data);
        if (!data.success) throw new Error(data.error);
        setEmployees(data.employees);
      } catch (err: any) {
        console.error("[employees] error", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // ✅ Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const canCheckIn = useMemo(() => inside && !checkedIn, [inside, checkedIn]);

  // Load user data from backend or localStorage
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "null");
      console.log("[auth] loaded from localStorage:", auth);
      if (!auth) return;
      setUserData(auth); // assuming auth has { name, phone, email, role }
    } catch (e) {
      console.warn("[auth] failed parse localStorage auth", e);
    }
  }, []);

  // Diagnostics: log env & origin once
  useEffect(() => {
    console.log("[diagnostic] location origin:", location.origin);
    console.log(
      "[diagnostic] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY present:",
      Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
    );
    if ("permissions" in navigator) {
      try {
        (navigator as any).permissions
          .query({ name: "geolocation" })
          .then((p: PermissionStatus) => {
            console.log("[diagnostic] permissions.geolocation state:", p.state);
            p.addEventListener?.("change", () =>
              console.log("[diagnostic] permission changed:", p.state)
            );
          })
          .catch((e: any) =>
            console.warn("[diagnostic] permissions.query failed:", e)
          );
      } catch (e) {
        console.warn("[diagnostic] permissions API error:", e);
      }
    } else {
      console.log("[diagnostic] Permissions API not supported");
    }
  }, []);

  // Track live user location (with detailed logs)
  useEffect(() => {
    console.log("[geo] effect start, checkedIn:", checkedIn);

    if (!("geolocation" in navigator)) {
      console.error("[geo] navigator.geolocation not available");
      setError("Geolocation is not supported by this browser.");
      return;
    }

    try {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          console.log("[geo] position received:", c, {
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
          });
          setCoords(c);
          const insideRadius =
            haversineMeters(c, OFFICE_CENTER) <= OFFICE_RADIUS_METERS;
          console.log("[geo] insideRadius:", insideRadius);
          setInside(insideRadius);
          if (checkedIn) {
            setPath((prev) => [...prev, [c.lat, c.lng]]);
            console.log(
              "[geo] appended to path, path length:",
              path.length + 1
            );
          }
          if (mapRef.current) {
            try {
              console.log("[geo] panTo on mapRef");
              mapRef.current.panTo(c);
            } catch (mapErr) {
              console.warn("[geo] map panTo failed:", mapErr);
            }
          } else {
            console.log("[geo] mapRef is null (map not loaded yet)");
          }
        },
        (err) => {
          // err.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
          console.error("[geo] watchPosition error:", err.code, err.message);
          setError(err.message ?? String(err));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      watchIdRef.current = watchId;
      console.log("[geo] watchPosition started id=", watchId);
      return () => {
        if (watchIdRef.current != null) {
          try {
            navigator.geolocation.clearWatch(watchIdRef.current);
            console.log("[geo] cleared watchPosition id=", watchIdRef.current);
          } catch (e) {
            console.warn("[geo] clearWatch failed", e);
          }
          watchIdRef.current = null;
        }
      };
    } catch (e) {
      console.error("[geo] watchPosition threw:", e);
      setError(String(e));
    }
  }, [checkedIn]); // same dependency as before to preserve behaviour

  // Log coords changes for debugging
  useEffect(() => {
    console.log("[state] coords changed:", coords);
  }, [coords]);

  // ✅ Check-In handler
  const handleCheckIn = async () => {
    if (!coords || !userData?.phone) {
      console.warn("[checkin] missing coords or userData.phone", {
        coords,
        userData,
      });
      return;
    }
    try {
      console.log("[checkin] sending checkin for", userData.phone, coords);
      const res = await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userData.phone, coords }),
      });
      const data = await res.json();
      console.log("[checkin] response", data);
      if (!data.success) throw new Error(data.error);
      setCheckedIn(true);
      setPath([]);
      alert("Checked in successfully!");
    } catch (err: any) {
      console.error("[checkin] failed", err);
      alert("Check-in failed: " + err.message);
    }
  };

  // ✅ Check-Out handler
  const handleCheckOut = async () => {
    if (!coords || !userData?.phone) {
      console.warn("[checkout] missing coords or userData.phone", {
        coords,
        userData,
      });
      return;
    }
    try {
      console.log("[checkout] sending checkout for", userData.phone, coords);
      const res = await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userData.phone, coords }),
      });
      const data = await res.json();
      console.log("[checkout] response", data);
      if (!data.success) throw new Error(data.error);
      setCheckedIn(false);
      setPath([]);
      alert("Checked out successfully!");
    } catch (err: any) {
      console.error("[checkout] failed", err);
      alert("Check-out failed: " + err.message);
    }
  };

  // ✅ Recenter map manually
  const handleRecenter = () => {
    if (coords && mapRef.current) {
      console.log("[recenter] panning to", coords);
      mapRef.current.panTo(coords);
    } else {
      console.log("[recenter] cannot recenter, coords or mapRef missing", {
        coords,
        mapRef: !!mapRef.current,
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-[70vh] flex justify-center items-center">
        Loading Google Map...
      </div>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Office Check-In</h1>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Name</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{emp.name}</td>
                      <td className="py-2">{emp.phone}</td>
                      <td className="py-2">{emp.email}</td>
                      <td className="py-2">{emp.role}</td>
                      <td className="py-2">{emp.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No employees found.</p>
            )}
          </CardContent>
        </Card>

        {/* Google Map */}
        <div style={{ width: "100%", height: "400px" }}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={coords || OFFICE_CENTER}
            zoom={17}
            onLoad={(map) => {
              console.log("[map] onLoad, map object received");
              mapRef.current = map;
              if (coords) {
                try {
                  mapRef.current.setCenter(coords);
                  console.log("[map] setCenter to coords on load");
                } catch (e) {
                  console.warn("[map] setCenter failed on load", e);
                }
              }
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
            {coords && (
              <Marker
                position={coords}
                label="You"
                // keep default icon; you can set custom icon if desired
              />
            )}
            <Marker position={OFFICE_CENTER} label="Office" />
            {path.length > 1 && (
              <Polyline
                path={path.map(([lat, lng]) => ({ lat, lng }))}
                options={{ strokeColor: "#16a34a", strokeWeight: 4 }}
              />
            )}
          </GoogleMap>
        </div>

        {/* Check-In / Check-Out Buttons */}
        <div className="text-center space-x-4">
          <button
            onClick={handleCheckIn}
            disabled={!canCheckIn}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!checkedIn}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
          >
            Check Out
          </button>
          <button
            onClick={handleRecenter}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Recenter
          </button>
        </div>

        {/* Status */}
        {!inside && (
          <p className="text-red-500 mt-2 text-center">
            You are outside office radius.
          </p>
        )}
        {inside && !checkedIn && (
          <p className="text-green-600 mt-2 text-center">
            You are inside office radius. You can check in.
          </p>
        )}
        {checkedIn && (
          <p className="text-blue-600 mt-2 text-center">
            Checked in successfully.
          </p>
        )}
      </div>
    </main>
  );
}

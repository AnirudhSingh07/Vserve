// "use client";

// import { useState, useEffect, useRef } from "react";
// import {
//   GoogleMap,
//   Marker,
//   Circle,
//   useJsApiLoader,
// } from "@react-google-maps/api";

// // ------------------ CONFIG ------------------
// const OFFICE_CENTER = { lat: 22.723541, lng: 75.884507 }; //lat: 23.1575, lng: 75.7997 
// const OFFICE_RADIUS_METERS = 200; // 200 meters radius
// const containerStyle = { width: "100%", height: "400px" };
// // --------------------------------------------

// // ✅ Utility: Haversine formula for distance in meters
// function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
//   const R = 6371000;
//   const dLat = ((b.lat - a.lat) * Math.PI) / 180;
//   const dLng = ((b.lng - a.lng) * Math.PI) / 180;
//   const lat1 = (a.lat * Math.PI) / 180;
//   const lat2 = (b.lat * Math.PI) / 180;
//   const h =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
// }

// // ✅ MapTracker Component
// function MapTracker({
//   enabled,
//   phone,
//   onInsideRadius,
//   onCoords,
// }: {
//   enabled: boolean;
//   phone: string;
//   onInsideRadius?: (inside: boolean) => void;
//   onCoords?: (coords: { lat: number; lng: number }) => void;
// }) {
//   const { isLoaded } = useJsApiLoader({
//     id: "google-map-script",
//     googleMapsApiKey: "AIzaSyDJIW2o84fQf8hMV9Qu2-zxb2nFM_v0db0", // replace
//   });

//   const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
//   const watchId = useRef<number | null>(null);

//   useEffect(() => {
//     if (!enabled || !navigator.geolocation) return;

//     console.log("🟢 Tracking started...");

//     watchId.current = navigator.geolocation.watchPosition(
//       (p) => {
//         const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
//         console.log("📍 Position:", coords);

//         setPos(coords);
//         onCoords?.(coords);

//         const distance = haversineMeters(coords, OFFICE_CENTER);
//         const inside = distance <= OFFICE_RADIUS_METERS;
//         console.log("📏 Distance:", distance, "Inside:", inside);
//         onInsideRadius?.(inside);
//       },
//       (err) => {
//         console.error("❌ Geolocation error:", err);
//         onInsideRadius?.(false);
//       },
//       { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
//     );

//     return () => {
//       if (watchId.current) {
//         navigator.geolocation.clearWatch(watchId.current);
//       }
//     };
//   }, [enabled, onInsideRadius, onCoords]);

//   if (!isLoaded) return <p>Loading map...</p>;

//   return (
//     <div className="h-[400px] w-full rounded-md overflow-hidden border mt-4">
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={pos || OFFICE_CENTER}
//         zoom={18}
//       >
//         <Circle
//           center={OFFICE_CENTER}
//           radius={OFFICE_RADIUS_METERS}
//           options={{
//             strokeColor: "#3b82f6",
//             fillColor: "#93c5fd",
//             fillOpacity: 0.2,
//           }}
//         />
//         {pos && <Marker position={pos} />}
//       </GoogleMap>
//     </div>
//   );
// }

// // ✅ Parent Component (with Check-in button)
// export default function Page() {
//   const [enabled, setEnabled] = useState(true);
//   const [insideOffice, setInsideOffice] = useState(false);
//   const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

//   return (
//     <div className="p-4 space-y-3">
//       <h2 className="text-xl font-semibold">Employee Attendance Tracker</h2>

//       <button
//         className={`px-4 py-2 rounded ${
//           insideOffice ? "bg-green-600" : "bg-gray-400"
//         } text-white`}
//         disabled={!insideOffice}
//         onClick={() => alert("✅ Checked In Successfully!")}
//       >
//         {insideOffice ? "Check In (Enabled)" : "Check In (Disabled)"}
//       </button>

//       <div className="text-sm">
//         <p>Inside Office: {insideOffice ? "✅ Yes" : "❌ No"}</p>
//         <p>
//           Coordinates:{" "}
//           {coords
//             ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
//             : "Waiting..."}
//         </p>
//       </div>

//       <MapTracker
//         enabled={enabled}
//         phone="9999999999"
//         onInsideRadius={(inside) => setInsideOffice(inside)}
//         onCoords={(c) => setCoords(c)}
//       />
//     </div>
//   );
// }


"use client";

import { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
} from "@react-google-maps/api";

// ------------------ CONFIG ------------------
const OFFICE_CENTER = { lat: 22.723541, lng: 75.884507 };
const OFFICE_RADIUS_METERS = 200; 
const containerStyle = { width: "100%", height: "400px" };
// --------------------------------------------

// ⭐ ADDED: Distance formula for change detection
function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// ------------------ Map Component ------------------
function MapTracker({
  enabled,
  phone,
  onInsideRadius,
  onCoords,
}: {
  enabled: boolean;
  phone: string;
  onInsideRadius?: (inside: boolean) => void;
  onCoords?: (coords: { lat: number; lng: number }) => void;
}) {

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const watchId = useRef<number | null>(null);

  // ⭐ ADDED
  const lastSentRef = useRef<number>(0);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // ⭐ ADDED — Function to send location
  async function sendLocationToServer(coords: { lat: number; lng: number }) {
    try {
      await fetch("/api/track-loc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: phone,
          lat: coords.lat,
          lng: coords.lng,
        }),
      });
      console.log("📨 Sent to server:", coords);
    } catch (e) {
      console.log("❌ Failed sending data", e);
    }
  }

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;

    console.log("🟢 Tracking started...");

    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
        console.log("📍 Position:", coords);

        setPos(coords);
        onCoords?.(coords);

        // Existing radius logic — unchanged
        const distance = haversineMeters(coords, OFFICE_CENTER);
        const inside = distance <= OFFICE_RADIUS_METERS;
        console.log("📏 Distance:", distance, "Inside:", inside);
        onInsideRadius?.(inside);

        // ⭐ ADDED — send to backend only if movement > 10m and 10 sec passed
        const now = Date.now();

        if (lastCoordsRef.current) {
          const movedMeters = haversineMeters(coords, lastCoordsRef.current);
          const timeGap = now - lastSentRef.current;

          if (movedMeters < 10) {
            console.log("⏳ Not sending — moved < 10 meters");
            return;
          }
          if (timeGap < 10000) {
            console.log("⏳ Not sending — < 10 sec passed");
            return;
          }
        }

        // Update refs
        lastCoordsRef.current = coords;
        lastSentRef.current = now;

        // Send to server
        sendLocationToServer(coords);
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        onInsideRadius?.(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [enabled, onInsideRadius, onCoords]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="h-[400px] w-full rounded-md overflow-hidden border mt-4">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={pos || OFFICE_CENTER}
        zoom={18}
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
        {pos && <Marker position={pos} />}
      </GoogleMap>
    </div>
  );
}

// ------------------ Parent Component ------------------
export default function Page() {
  const [enabled, setEnabled] = useState(true);
  const [insideOffice, setInsideOffice] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-semibold">Employee Attendance Tracker</h2>

      <button
        className={`px-4 py-2 rounded ${
          insideOffice ? "bg-green-600" : "bg-gray-400"
        } text-white`}
        disabled={!insideOffice}
        onClick={() => alert("✅ Checked In Successfully!")}
      >
        {insideOffice ? "Check In (Enabled)" : "Check In (Disabled)"}
      </button>

      <div className="text-sm">
        <p>Inside Office: {insideOffice ? "✅ Yes" : "❌ No"}</p>
        <p>
          Coordinates:{" "}
          {coords
            ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
            : "Waiting..."}
        </p>
      </div>

      <MapTracker
        enabled={enabled}
        phone="9999999999"
        onInsideRadius={(inside) => setInsideOffice(inside)}
        onCoords={(c) => setCoords(c)}
      />
    </div>
  );
}

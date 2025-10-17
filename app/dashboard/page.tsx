"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import AttendanceList from "@/components/dashboard/attendance-list"
import {
  OFFICE_CENTER,
  OFFICE_RADIUS_METERS,
  isWithinCheckinWindow,
  haversineMeters,
  todayKey,
} from "@/lib/constants"
import { GoogleMap, Marker, Circle, Polyline, useJsApiLoader } from "@react-google-maps/api"
import { Loader2 } from "lucide-react"

type TrackPoint = { lat: number; lng: number; ts: number }
type AttendanceRecord = {
  date: string
  checkInTime?: number
  checkInLocation?: { lat: number; lng: number }
  track?: TrackPoint[]
  checkOutTime?: number
  checkOutLocation?: { lat: number; lng: number }
  status?: "on-time" | "late"
  lateApproved?: boolean
}

const mapContainerStyle = { width: "100%", height: "320px" }

export default function DashboardPage() {
  const router = useRouter()

  // --- All hooks declared at the top ---
  const [authPhone, setAuthPhone] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [inside, setInside] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [attRec, setAttRec] = useState<AttendanceRecord | null>(null)
  const [path, setPath] = useState<Array<[number, number]>>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  // --- Fetch employees ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees")
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        setEmployees(data.employees)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [])

  // --- Load auth and today's record ---
  useEffect(() => {
    const a = JSON.parse(localStorage.getItem("auth") || "null")
    if (!a || a.role !== "executive") {
      router.replace("/login")
      return
    }
    setAuthPhone(a.phone)

    const k = `attendance:${a.phone}`
    const all = JSON.parse(localStorage.getItem(k) || "{}")
    const rec: AttendanceRecord = all[todayKey()] || null
    setAttRec(rec || null)
    setCheckedIn(!!rec?.checkInTime && !rec?.checkOutTime)

    // geolocate once
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const c = { lat: p.coords.latitude, lng: p.coords.longitude }
          setCoords(c)
          const d = haversineMeters(c, OFFICE_CENTER)
          setInside(d <= OFFICE_RADIUS_METERS)
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 },
      )
    }

    // Load today's path
    const recs = JSON.parse(localStorage.getItem(`attendance:${a.phone}`) || "{}")
    const today = recs[todayKey()]
    if (today?.track?.length) {
      setPath(today.track.map((p: any) => [p.lat, p.lng]))
    }
  }, [router])

  // --- Memo for check-in availability ---
  const canCheckIn = useMemo(() => {
    return isWithinCheckinWindow(new Date()) && inside && !checkedIn
  }, [inside, checkedIn])

  // --- Attendance actions ---
  const markAttendance = () => {
    if (!authPhone || !coords) return
    const k = `attendance:${authPhone}`
    const all = JSON.parse(localStorage.getItem(k) || "{}")
    const now = Date.now()
    const status: AttendanceRecord["status"] = isWithinCheckinWindow(new Date(now)) ? "on-time" : "late"
    const rec: AttendanceRecord = {
      date: todayKey(),
      checkInTime: now,
      checkInLocation: coords,
      track: [],
      status,
    }
    all[todayKey()] = rec
    localStorage.setItem(k, JSON.stringify(all))
    setAttRec(rec)
    setCheckedIn(true)
  }

  const dayOut = () => {
    if (!authPhone) return
    const k = `attendance:${authPhone}`
    const all = JSON.parse(localStorage.getItem(k) || "{}")
    const rec: AttendanceRecord = all[todayKey()]
    if (!rec) return
    const now = Date.now()
    const outLoc = coords || rec.checkInLocation
    all[todayKey()] = { ...rec, checkOutTime: now, checkOutLocation: outLoc }
    localStorage.setItem(k, JSON.stringify(all))
    setAttRec(all[todayKey()])
    setCheckedIn(false)
  }

  const requestLateApproval = () => {
    if (!authPhone || !attRec) return
    const pool = JSON.parse(localStorage.getItem("lateRequests") || "[]")
    const exists = pool.find((r: any) => r.phone === authPhone && r.date === attRec.date)
    if (exists) return
    pool.push({
      id: `LR${Math.floor(Math.random() * 100000)}`,
      phone: authPhone,
      date: attRec.date,
      reason: "Traffic/Unavoidable circumstances",
      status: "pending",
      remarks: "",
      createdAt: Date.now(),
    })
    localStorage.setItem("lateRequests", JSON.stringify(pool))
    alert("Late request submitted for manager approval.")
  }

  const logout = () => {
    localStorage.removeItem("auth")
    router.replace("/login")
  }

  // --- Real-time GPS tracking ---
  useEffect(() => {
    if (!checkedIn || !navigator.geolocation || !authPhone) return
    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        const c = { lat: p.coords.latitude, lng: p.coords.longitude }
        setCoords(c)
        const inside = haversineMeters(c, OFFICE_CENTER) <= OFFICE_RADIUS_METERS
        setInside(inside)

        // Save to localStorage
        const storeKey = `attendance:${authPhone}`
        const all = JSON.parse(localStorage.getItem(storeKey) || "{}")
        const rec = all[todayKey()] || { track: [] }
        rec.track = [...rec.track, { lat: c.lat, lng: c.lng, ts: Date.now() }]
        all[todayKey()] = rec
        localStorage.setItem(storeKey, JSON.stringify(all))
        setPath((prev) => [...prev, [c.lat, c.lng]])
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [checkedIn, authPhone])

  // --- Conditional returns after all hooks ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>
  }

  return (
    <div>
      <Navbar />
      <main className="p-4 max-w-5xl mx-auto space-y-6 mt-[20vw]">
        {/* Employee List */}
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

        {/* Attendance List */}
        <AttendanceList phone={authPhone || ""} />

        {/* Google Map */}
        <Card>
          <CardHeader>
            <CardTitle>Live GPS Map</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoaded && (
              <GoogleMap mapContainerStyle={mapContainerStyle} center={coords || OFFICE_CENTER} zoom={17}>
                <Circle
                  center={OFFICE_CENTER}
                  radius={OFFICE_RADIUS_METERS}
                  options={{ strokeColor: "#3b82f6", fillColor: "#93c5fd", fillOpacity: 0.2 }}
                />
                {coords && <Marker position={coords} />}
                {path.length > 1 && (
                  <Polyline
                    path={path.map(([lat, lng]) => ({ lat, lng }))}
                    options={{ strokeColor: "#16a34a", strokeWeight: 4 }}
                  />
                )}
              </GoogleMap>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

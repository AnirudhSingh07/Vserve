"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AttendanceRecord = {
  date: string
  checkInTime?: number
  checkOutTime?: number
  status?: "on-time" | "late"
  lateApproved?: boolean
}

export default function AttendanceList({ phone }: { phone: string }) {
  const [rows, setRows] = useState<AttendanceRecord[]>([])
  const [atLocation, setAtLocation] = useState(false)
  const [checkIn, setCheckedIn] =useState(false)

  const handleCheckIn = () =>{
    if (!atLocation){
      alert(" You must be at the location to Check-In")
      return
    }
    alert("Checked in successfully")
    setCheckedIn(true)
  }
  
  const handleDayOut = ()=>{
    if (!checkIn){
      alert("You can only Day-out after checking in!")
      return
    }
    alert("Day-out Successfully")
    setCheckedIn(false)
  }

  // useEffect(() => {
  //   if (!phone) return
  //   const all = JSON.parse(localStorage.getItem(`attendance:${phone}`) || "{}")
  //   const list: AttendanceRecord[] = Object.values(all)
  //     .sort((a: any, b: any) => (a.date < b.date ? 1 : -1))
  //     .slice(0, 30)
  //   setRows(list)
  // }, [phone])

  return (
    <div>
              <button
              type="button"
              onClick={handleCheckIn}
              className={`w-24 h-12 rounded-2xl text-white m-2 ${
                atLocation ? "bg-black hover:bg-gray-900" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!atLocation}
            >
              Check-In
            </button>
              <button
              type="button"
              onClick={handleDayOut}
              className={`w-24 h-12 rounded-2xl m-2 text-white ${
                checkIn ? "bg-gray-700 hover:bg-gray-900" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!checkIn}
            >
              Day-Out
            </button>
            
            {/* <tbody> */}
              {/* {rows.length === 0 && (
                <tr>
                  <td className="py-3" colSpan={4}>
                    No records yet.
                  </td>
                </tr>
              )} */}
              {/* {rows.map((r) => (
                <tr key={r.date} className="border-t">
                  <td className="py-2 pr-4">{r.date}</td>
                  <td className="py-2 pr-4">{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "—"}</td>
                  <td className="py-2 pr-4">{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "—"}</td>
                  <td className="py-2 pr-4">
                    {r.status === "on-time"
                      ? "On-time"
                      : r.status === "late"
                        ? r.lateApproved
                          ? "Late (Approved)"
                          : "Late"
                        : "—"}
                  </td>
                </tr>
              ))} */}
            {/* </tbody> */}
          {/* </table> */}
            </div>
      
  )
}

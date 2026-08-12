"use client";

import React, { useEffect, useState } from "react";
// In your actual Next.js app, change this import to: import { useSearchParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NavBar from "@/components/Navbar";
import {
  MapPin,
  Calendar,
  Phone,
  User,
  Briefcase,
  Clock,
  Navigation,
  Loader2,
  AlertCircle,
  Hash,
} from "lucide-react";

type SentLocationType = {
  _id: string;
  employeeId: string;
  date: string;
  hashalt?: boolean;
  isCheckIn?: boolean;
  isCheckOut?: boolean;
  coords: {
    lat: number;
    lng: number;
  };
};

type Employee = {
  name: string;
  fatherName: string;
  phone: string;
  role: string;
  dateOfJoining: string;
};

const OFFICE_CENTER = { lat: 22.723541, lng: 75.884507 }; // Indore
const BHOPAL_OFFICE_CENTER = { lat: 23.2349541, lng: 77.4354195 }; // Bhopal
const OFFICE_RADIUS_METERS = 200;

const haversineMeters = (loc1: {lat: number, lng: number}, loc2: {lat: number, lng: number}) => {
  const R = 6371e3; // metres
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const SentLocation = ({ params }: { params: { empphone: string } }) => {
  const searchParams = useSearchParams();
  const emphone = params.empphone;
  const date = searchParams.get("date");
  const [data, setData] = useState<SentLocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDistanceTavel, setTotalDistanceTravel] = useState(0);
  const [locations, setLocations] = useState<SentLocationType[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSentLocations = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/attendance/sentloc?phone=${emphone}&date=${date}`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch sent locations");
      }

      const result = await res.json();
      console.log("Fetched Sent Locations:", result);
      setLocations(result.data || []);
      setTotalDistanceTravel(result.totalDistanceKm || 0);
      setEmployee({
        name: result.employee.name,
        fatherName: result.employee.fatherName,
        phone: result.employee.phone,
        role: result.employee.role,
        dateOfJoining: result.employee.dateOfJoining,
      });
      if (result.success) {
        setData(result.data);
      } else {
        setError("No data found");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, emphone]); // Added dependencies to re-fetch if URL changes

  const getFirstVisit = () => {
    if (!locations || locations.length === 0) return null;
    return locations.find((loc) => {
      if (!loc.coords || typeof loc.coords.lat !== 'number' || typeof loc.coords.lng !== 'number') return false;
      if (loc.coords.lat === 0 && loc.coords.lng === 0) return false;
      
      const dIndore = haversineMeters(loc.coords, OFFICE_CENTER);
      const dBhopal = haversineMeters(loc.coords, BHOPAL_OFFICE_CENTER);
      
      // Outside office radius
      return dIndore > OFFICE_RADIUS_METERS && dBhopal > OFFICE_RADIUS_METERS;
    });
  };

  const getLastVisit = () => {
    if (!locations || locations.length === 0) return null;
    for (let i = locations.length - 1; i >= 0; i--) {
      const loc = locations[i];
      if (!loc.coords) continue;
      // Skip the 0,0 location which is default for auto checkout
      if (loc.coords.lat === 0 && loc.coords.lng === 0) continue;
      
      return loc;
    }
    return null;
  };

  const firstVisit = getFirstVisit();
  const lastVisit = getLastVisit();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 p-8">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-100"></div>
          <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900">Retrieving Data</p>
          <p className="text-sm text-slate-500">Fetching location history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-red-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">
            Unable to Load Data
          </h3>
          <p className="mb-6 text-slate-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <NavBar />
      <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 pt-20 pb-10">

        {/* Top Navigation Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" className="flex items-center gap-2 shadow-sm bg-white hover:bg-gray-50 border-gray-200">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Panel
            </Button>
          </Link>
          <Link href={`/admin/employee/${emphone}/report`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md w-full sm:w-auto">
              View Monthly Report
            </Button>
          </Link>
        </div>

        {/* Title Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center sm:text-left">
            Location History
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 text-center sm:text-left">
            Tracking report for{" "}
            <span className="font-semibold text-gray-800">
              {date ? new Date(date).toLocaleDateString("en-GB") : "Today"}
            </span>
          </p>
        </div>

        {/* Snapshot Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Distance</p>
            <p className="text-2xl font-bold text-gray-800 mt-1.5">{totalDistanceTavel.toFixed(2)} Km</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-green-100 shadow-sm">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">First Visit</p>
            {firstVisit ? (
              <div className="mt-1.5">
                <a
                  href={`https://www.google.com/maps?q=${firstVisit.coords.lat},${firstVisit.coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {firstVisit.coords.lat.toFixed(4)}, {firstVisit.coords.lng.toFixed(4)}
                </a>
                <span className="text-xs text-slate-500 block mt-0.5">
                  ({new Date(firstVisit.date).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })})
                </span>
              </div>
            ) : (
              <p className="text-sm font-semibold text-gray-400 mt-1.5">—</p>
            )}
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-red-100 shadow-sm">
            <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Last Visit</p>
            {lastVisit ? (
              <div className="mt-1.5">
                <a
                  href={`https://www.google.com/maps?q=${lastVisit.coords.lat},${lastVisit.coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {lastVisit.coords.lat.toFixed(4)}, {lastVisit.coords.lng.toFixed(4)}
                </a>
                <span className="text-xs text-slate-500 block mt-0.5">
                  ({new Date(lastVisit.date).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })})
                </span>
              </div>
            ) : (
              <p className="text-sm font-semibold text-gray-400 mt-1.5">—</p>
            )}
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Locations Found</p>
            <p className="text-2xl font-bold text-blue-600 mt-1.5 flex items-center gap-2">
              {locations.length}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </p>
          </div>
        </div>

        {/* Employee Profile Card */}
        {employee && (
          <div className="mb-8 overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-sm">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm flex-shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{employee.name}</h2>
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-600">{employee.role}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Father's Name</p>
                  <p className="text-sm font-semibold text-slate-700">{employee.fatherName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-700">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Designation</p>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{employee.role}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Joined Date</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(employee.dateOfJoining).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Locations List */}
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 backdrop-blur-sm py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200">
              <MapPin className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No Locations Recorded</h3>
            <p className="text-slate-500">No tracking data available for this date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...locations].reverse().map((item, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg border ${
                  item.isCheckIn
                    ? "bg-green-50/90 border-green-200"
                    : item.isCheckOut
                    ? "bg-red-50/90 border-red-200"
                    : item.hashalt
                    ? "bg-yellow-50/90 border-yellow-200"
                    : "bg-white/90 border-gray-200 backdrop-blur-sm"
                }`}
              >
                {/* Card Top Gradient on Hover */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100 ${
                    item.isCheckIn
                      ? "from-green-400 to-emerald-500"
                      : item.isCheckOut
                      ? "from-red-400 to-rose-500"
                      : item.hashalt
                      ? "from-yellow-400 to-orange-400"
                      : "from-blue-500 to-indigo-500"
                  }`}
                />
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-between gap-4 p-5 min-w-max">
                    {/* Left: Time & Badges */}
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 flex-shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-900 whitespace-nowrap flex items-center gap-2">
                          {new Date(item.date).toLocaleTimeString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {item.isCheckIn && (
                            <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 ring-1 ring-inset ring-green-600/20">
                              Check In
                            </span>
                          )}
                          {item.isCheckOut && (
                            <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 ring-1 ring-inset ring-red-600/20">
                              Check Out
                            </span>
                          )}
                          {item.hashalt && !item.isCheckIn && !item.isCheckOut && (
                            <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                              Halt
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Coordinates */}
                    <div className="flex items-center gap-6 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100 flex-shrink-0">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 mb-1">Latitude</span>
                        <span className="font-mono text-sm font-semibold text-slate-700">{item.coords.lat.toFixed(6)}</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 mb-1">Longitude</span>
                        <span className="font-mono text-sm font-semibold text-slate-700">{item.coords.lng.toFixed(6)}</span>
                      </div>
                    </div>

                    {/* Right: Map Button */}
                    <a
                      href={`https://www.google.com/maps?q=${item.coords.lat},${item.coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm border border-gray-200 transition-all hover:bg-slate-800 hover:text-white active:scale-95 whitespace-nowrap flex-shrink-0"
                    >
                      <Navigation className="h-4 w-4" />
                      View on Map
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SentLocation;


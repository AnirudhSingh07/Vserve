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
import { set } from "mongoose";

type SentLocationType = {
  _id: string;
  employeeId: string;
  date: string;
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
    <>
      <NavBar />
      <div className="min-h-screen bg-slate-50/50 pb-12 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <div className="flex flex-wrap justify-between items-center mb-8">
           <div className="px-4 sm:px-6 py-5">
            {/* Back Button */}
            <Link href="/admin">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Panel
              </Button>
            </Link>
          </div>
         <div className="mr-5">
           <Link href={`/admin/employee/${emphone}/report`}>
            <Button className="bg-blue-600">View Monthly Report</Button>
          </Link>
         </div>
         </div>
        
          {/* Header Section */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold font-sans tracking-tight text-[#ba4c83]">
                Location History
              </h1>
              <p className="mt-2 text-slate-500">
                Tracking report for{" "}
                <span className="font-medium text-slate-900">
                  {date ? new Date(date).toLocaleDateString("en-GB") : "Today"}
                </span>
              </p>
              <p className="mt-2 text-slate-500">
                Total Distance Travel {" "}
                <span className="font-medium text-slate-900">
                  {totalDistanceTavel.toFixed(2)}Km
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-sm font-medium text-slate-600">
                {locations.length} Locations Found
              </span>
            </div>
          </div>

          {/* Employee Profile Card */}
          {employee && (
            <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {employee.name}
                    </h2>
                    <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                      {employee.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Father's Name
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {employee.fatherName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Phone Number
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {employee.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Designation
                    </p>
                    <p className="text-sm font-semibold text-slate-700 capitalize">
                      {employee.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Joined Date
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(employee.dateOfJoining).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Locations List */}
          {locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                <MapPin className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No Locations Recorded
              </h3>
              <p className="text-slate-500">
                No tracking data available for this date.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {locations.map((item, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg ring-1 ring-slate-200 hover:ring-blue-100"
                >
                  {/* Card Header Gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="overflow-x-auto">
                    <div className="flex items-center justify-between gap-4 p-5 min-w-max">
                      {/* Left Section - Index & Time */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 flex-shrink-0">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-slate-900 whitespace-nowrap">
                              {new Date(item.date).toLocaleTimeString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Middle Section - Coordinates */}
                      <div className="flex items-center gap-6 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 flex-shrink-0">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-500 mb-1">
                            Latitude
                          </span>
                          <span className="font-mono text-sm font-semibold text-slate-700">
                            {item.coords.lat.toFixed(6)}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-500 mb-1">
                            Longitude
                          </span>
                          <span className="font-mono text-sm font-semibold text-slate-700">
                            {item.coords.lng.toFixed(6)}
                          </span>
                        </div>
                      </div>

                      {/* Right Section - Button */}
                      <a
                        href={`https://www.google.com/maps?q=${item.coords.lat},${item.coords.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-800 hover:text-white hover:ring-slate-800 active:scale-95 whitespace-nowrap flex-shrink-0"
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
        </div>
      </div>
    </>
  );
};

export default SentLocation;

"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  Briefcase,
  CreditCard,
  Building2,
  Calendar,
  LocateIcon,
  BadgeCheckIcon,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (res.ok) setUser(data.user || data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-gray-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p
          className="text-xl font-semibold
          bg-gradient-to-r from-[#BA4C83] to-[#ba4c83cf] bg-clip-text text-transparent"
        >
          No profile data found
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-100">
      <Navbar />

       <div className="px-4 sm:px-6 py-5">
              {/* Back Button */}
                  <Link href="/admin">
                    <Button variant="ghost" className="mb-4">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Admin Panel
                    </Button>
                  </Link>
           </div>

      <div className="flex justify-center px-4 py-6 md:py-10">
        <div
          className="w-full max-w-xl text-xl font-bold
          bg-white rounded-3xl shadow-sm p-5 md:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold border-1 border-black text-slate-700">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <h1 className="text-4xl font-bold  text-gray-900 ">{user.name}</h1>

            <p className="flex items-center gap-1 text-slate-600 text-sm">
              <Briefcase className="w-4 h-4" />
              {user.role || "Employee"}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <ProfileItem
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={user.phone}
            />

            <ProfileItem
              icon={<User className="w-4 h-4" />}
              label="Father’s Name"
              value={user.fatherName}
            />

            <ProfileItem
              icon={<CreditCard className="w-4 h-4" />}
              label="PAN Card"
              value={user.panCard}
            />

            <ProfileItem
              icon={<Building2 className="w-4 h-4" />}
              label="Bank Account"
              value={user.bankAccountNumber}
              mono
            />

            <ProfileItem
              icon={<Calendar className="w-4 h-4" />}
              label="Date of Joining"
              value={
                user.dateOfJoining
                  ? new Date(user.dateOfJoining).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"
              }
            />
            {user.role === "executive" && (
              <ProfileItem
                icon={<LocateIcon className="w-4 h-4" />}
                label="Location"
                value={user.location ? user.location : "N/A"}
              />
            )}
            {user.role === "executive" && (
              <ProfileItem
                icon={<BadgeCheckIcon className="w-4 h-4" />}
                label="Department"
                value={user.department ? user.department : "N/A"}
              />
            )}
            {user.role === "executive" && (
              <ProfileItem
                icon={<BadgeCheckIcon className="w-4 h-4" />}
                label="Address :"
                value={user.addressProof ? user.addressProof : "N/A"}
              />
            )}
          </div>

          {user.role === "executive" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                console.log("Updating location...");
                const location = formData.get("location");
                console.log("Location:", location);
                if (location) {
                  const res = await fetch("/api/update-location", {
                    method: "POST",
                    body: JSON.stringify({ location, id: user._id }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                  if (res.ok) {
                    const data = await res.json();
                    console.log("Location updated:", data);
                    alert("Location updated successfully!");
                  } else {
                    console.error("Failed to update location:", res.statusText);
                  }
                }
              }}
              className="mt-4 flex flex-wrap items-center gap-4"
            >
              <select
                name="location"
                id="location"
                className="w-48 px-3 py-2 text-sm font-normal border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Indore">Indore</option>
                <option value="Bhopal">Bhopal</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                Update Location
              </button>
            </form>
          )}

          {user.role === "executive" && (
            <div className=" mt-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const department = formData.get("department");
                  if (department) {
                    const res = await fetch("/api/update-department", {
                      method: "POST",
                      body: JSON.stringify({ department, id: user._id }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });
                    if (res.ok) {
                      alert("Department updated successfully!");
                      console.log("Department updated");
                    } else {
                      console.error(
                        "Failed to update department:",
                        res.statusText,
                      );
                    }
                  }
                }}
                className="flex flex-wrap text-lg font-light items-center gap-4"
              >
                <label
                  htmlFor="department"
                  className="w-48 px-3 py-2 text-sm font-norma  border border-gray-300 rounded-lg bg-white text-gray-70l"
                >
                  Department
                </label>
                <input type="text" name="department" id="department" />

                <button
                  type="submit"
                  className="px-12 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  Submit
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
      <div className="bg-white p-2 rounded-full shadow-sm text-slate-700">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 uppercase">{label}</span>
        <span
          className={`text-sm font-medium text-gray-900 ${
            mono ? "font-mono" : ""
          }`}
        >
          {value || "N/A"}
        </span>
      </div>
    </div>
  );
}

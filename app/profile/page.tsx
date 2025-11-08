"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Phone,
  Briefcase,
  CreditCard,
  Building2,
  Calendar,
  FileText,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (res.ok) setUser(data.user || data); // handle both { user: {...} } and {...}
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold">No profile data found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-lg bg-white border-t-4 border-indigo-500">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-2xl mx-auto shadow-md mb-3">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            {user.name}
          </CardTitle>
          <p className="text-gray-500 flex items-center justify-center mt-1">
            <Briefcase className="w-4 h-4 mr-1" /> {user.role || "Employee"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center text-gray-700">
            <Phone className="w-5 h-5 text-indigo-600 mr-2" />
            <span>{user.phone || "N/A"}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <User className="w-5 h-5 text-indigo-600 mr-2" />
            <span>Father’s Name: {user.fatherName || "N/A"}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <CreditCard className="w-5 h-5 text-indigo-600 mr-2" />
            <span>PAN: {user.panCard || "N/A"}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <Building2 className="w-5 h-5 text-indigo-600 mr-2" />
            <span>Bank A/C: {user.bankAccountNumber || "N/A"}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
            <span>
              Joined on:{" "}
              {user.dateOfJoining
                ? new Date(user.dateOfJoining).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </span>
          </div>

          {user.addressProof && (
            <div className="flex items-center text-gray-700">
              <FileText className="w-5 h-5 text-indigo-600 mr-2" />
              <a
                href={user.addressProof}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                View Address Proof
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

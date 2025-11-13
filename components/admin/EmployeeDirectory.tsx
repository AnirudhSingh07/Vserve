"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Briefcase,
  User,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

type UserType = {
  _id: string;
  id?: string;
  phone: string;
  role: string;
  name?: string;
  profileCompleted?: boolean;
};

export default function EmployeeDirectory({ users }: { users: UserType[] }) {
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
  const router = useRouter();

  const toggleEmployeeExpand = (id: string) => {
    setExpandedEmployeeId((prev) => (prev === id ? null : id));
  };

  const openUserProfile = (id: string) => {
    router.push(`/profile/employee/${id}`);
  };

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl">Employee Directory</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{users.length} employees found</p>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            No employees found.
          </p>
        ) : (
          users.map((u, idx) => {
            const uid = u.id || u._id || `user-${idx}`;
            return (
              <Card
                key={uid}
                className="overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-blue-500 rounded-xl"
              >
                {/* Collapsed Row */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 cursor-pointer hover:bg-blue-50/50 transition-colors"
                  onClick={() => toggleEmployeeExpand(uid)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-semibold text-lg shadow-md flex-shrink-0">
                      {(u.name || "U").charAt(0).toUpperCase()}
                    </div>

                    {/* Employee Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {u.name || "Unnamed Employee"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {u.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {u.phone}
                        </span>

                        {u.profileCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] sm:text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="flex items-center justify-end text-gray-400 flex-shrink-0">
                    {expandedEmployeeId === uid ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Expanded Row */}
                {expandedEmployeeId === uid && (
                  <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 animate-in slide-in-from-top duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      {/* Left Column */}
                      <div className="space-y-3 sm:space-y-4">
                        <EmployeeDetail icon={User} label="Employee ID" value={u.id || uid} />
                        <EmployeeDetail icon={User} label="Full Name" value={u.name || "—"} />
                        <EmployeeDetail icon={Phone} label="Phone Number" value={u.phone} />
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3 sm:space-y-4">
                        <EmployeeDetail icon={Briefcase} label="Role" value={u.role} />
                        <EmployeeDetail
                          icon={CheckCircle}
                          label="Profile Status"
                          value={
                            u.profileCompleted
                              ? "Completed"
                              : "Incomplete - Pending Details"
                          }
                        />
                      </div>
                    </div>

                    {/* Pending Status Box */}
                    {!u.profileCompleted && (
                      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-900">
                              Profile Incomplete
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              This employee needs to complete their profile information.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function EmployeeDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">
          {label}
        </p>
        <p className="text-sm sm:text-base text-gray-900 font-medium mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

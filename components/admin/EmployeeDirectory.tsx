"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Briefcase,
  User,
  ChevronDown,
  ChevronUp,
  Search, // ✅ Added for search icon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"; // ✅ Added Input for search bar

type UserType = {
  _id: string;
  id?: string;
  phone: string;
  role: string;
  name?: string;
  profileCompleted?: boolean;
};

export default function EmployeeDirectory({ users }: { users: UserType[] }) {
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(
    null
  );
  const router = useRouter();

  // ✅ Added new state for search
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Filtered users list (non-destructive)
  const filteredUsers = users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEmployeeExpand = (id: string) => {
    setExpandedEmployeeId((prev) => (prev === id ? null : id));
  };

  const openUserProfile = (id: string) => {
    router.push(`/profile/employee/${id}`);
  };

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Employee Directory</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {filteredUsers.length} employees found
              </p>
            </div>
          </div>

          {/* ✅ Search Field */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, phone or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No employees found.</p>
        ) : (
          filteredUsers.map((u, idx) => {
            const uid = u.id || u._id || `user-${idx}`;
            return (
              <Card
                key={uid}
                className="overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-blue-500"
              >
                {/* Collapsed */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/50 transition-colors"
                  onClick={() => toggleEmployeeExpand(uid)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-semibold text-lg shadow-md">
                      {(u.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {u.name || "Unnamed Employee"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {u.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {u.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openUserProfile(u._id);
                      }}
                    >
                      View Profile
                    </Button>
                    <div className="text-gray-400">
                      {expandedEmployeeId === uid ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {expandedEmployeeId === uid && (
                  <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 p-6 animate-in slide-in-from-top duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <EmployeeDetail
                          icon={User}
                          label="Employee ID"
                          value={u.id || uid}
                        />
                        <EmployeeDetail
                          icon={User}
                          label="Full Name"
                          value={u.name || "—"}
                        />
                        <EmployeeDetail
                          icon={Phone}
                          label="Phone Number"
                          value={u.phone}
                        />
                      </div>
                      {/* Right Column */}
                      <div className="space-y-4">
                        <EmployeeDetail
                          icon={Briefcase}
                          label="Role"
                          value={u.role}
                        />
                      </div>
                    </div>
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
      <div className="bg-blue-100 p-2 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
        <p className="text-gray-900 font-medium mt-1">{value}</p>
      </div>
    </div>
  );
}

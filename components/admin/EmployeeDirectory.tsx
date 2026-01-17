// "use client";

// import { useState } from "react";
// import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Phone,
//   Briefcase,
//   User,
//   ChevronDown,
//   ChevronUp,
//   Trash2,
// } from "lucide-react";

// type UserType = {
//   _id: string;
//   idCard?: string;
//   phone: string;
//   role: string;
//   name?: string;
//   idCardNumber?: string;
// };

// export default function EmployeeDirectory({ users }: { users: UserType[] }) {
//   const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(
//     null,
//   );
//   const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const toggleEmployeeExpand = (id: string) => {
//     setExpandedEmployeeId((prev) => (prev === id ? null : id));
//   };

//   const handleDeleteEmployee = async () => {
//     if (!deleteTargetId) return;

//     try {
//       setIsDeleting(true);

//       await fetch("/api/delete-employee", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ id: deleteTargetId }),
//       });
//       alert("Employee deleted successfully!");

//       setDeleteTargetId(null);
//     } catch (error) {
//       console.error("Failed to delete employee:", error);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <Card className="border-0 rounded-2xl shadow-xl bg-white overflow-hidden">
//       {/* Header */}
//       <CardHeader className="px-4 sm:px-6 py-5 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b">
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow">
//             <User className="w-6 h-6 text-white" />
//           </div>

//           <div>
//             <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
//               Employee Directory
//             </CardTitle>
//             <p className="text-sm text-gray-600 mt-0.5">
//               {users.length} employees found
//             </p>
//           </div>
//         </div>
//       </CardHeader>

//       {/* Content */}
//       <CardContent className="p-3 sm:p-5 space-y-4">
//         {users.length === 0 ? (
//           <div className="py-12 text-center text-gray-500 text-sm sm:text-base">
//             No employees found.
//           </div>
//         ) : (
//           users.map((u, idx) => {
//             const uid = u.idCard || u._id || `user-${idx}`;

//             return (
//               <Card
//                 key={uid}
//                 className="rounded-xl border border-gray-200/60 hover:border-blue-300 transition-all duration-300 overflow-hidden"
//               >
//                 {/* Collapsed */}
//                 <div
//                   onClick={() => toggleEmployeeExpand(uid)}
//                   className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 cursor-pointer bg-white hover:bg-blue-50/40 transition"
//                 >
//                   {/* Avatar */}
//                   <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
//                     {(u.name || "U").charAt(0).toUpperCase()}
//                   </div>

//                   {/* Info */}
//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
//                       {u.name || "Unnamed Employee"}
//                     </h3>

//                     <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
//                       <span className="flex items-center gap-1">
//                         <Briefcase className="w-4 h-4" />
//                         {u.role}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <Phone className="w-4 h-4" />
//                         {u.phone}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Toggle */}
//                   <div className="ml-auto text-gray-400">
//                     {expandedEmployeeId === uid ? (
//                       <ChevronUp className="w-5 h-5" />
//                     ) : (
//                       <ChevronDown className="w-5 h-5" />
//                     )}
//                   </div>
//                 </div>

//                 {/* Expanded */}
//                 {expandedEmployeeId === uid && (
//                   <div className="border-t bg-gradient-to-br from-slate-50 to-blue-50 px-4 sm:px-6 py-5 animate-in slide-in-from-top duration-300">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                       <div className="space-y-4">
//                         <EmployeeDetail
//                           label="Employee ID"
//                           value={u.idCardNumber || uid}
//                           icon={User}
//                         />
//                         <EmployeeDetail
//                           label="Full Name"
//                           value={u.name || "—"}
//                           icon={User}
//                         />
//                         <EmployeeDetail
//                           label="Phone Number"
//                           value={u.phone}
//                           icon={Phone}
//                         />
//                       </div>

//                       <div className="space-y-4">
//                         <EmployeeDetail
//                           label="Role"
//                           value={u.role}
//                           icon={Briefcase}
//                         />
//                       </div>
//                     </div>

//                     {/* Delete Button */}
//                     <div className="mt-6 flex justify-end">
//                       <Button
//                         variant="destructive"
//                         className="flex items-center gap-2"
//                         onClick={() => setDeleteTargetId(u._id)}
//                       >
//                         <Trash2 className="w-4 h-4" />
//                         Delete Employee
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </Card>
//             );
//           })
//         )}
//       </CardContent>

//       {/* Delete Confirmation Modal */}
//       {deleteTargetId && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Confirm Deletion
//             </h3>
//             <p className="text-sm text-gray-600 mt-2">
//               Are you sure you want to delete this employee? This action cannot
//               be undone.
//             </p>

//             <div className="mt-6 flex justify-end gap-3">
//               <Button
//                 variant="outline"
//                 onClick={() => setDeleteTargetId(null)}
//                 disabled={isDeleting}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="destructive"
//                 onClick={handleDeleteEmployee}
//                 disabled={isDeleting}
//               >
//                 {isDeleting ? "Deleting..." : "Confirm Delete"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </Card>
//   );
// }

// function EmployeeDetail({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: any;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex items-start gap-3">
//       <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
//         <Icon className="w-4 h-4 text-blue-600" />
//       </div>

//       <div className="min-w-0">
//         <p className="text-[11px] font-semibold uppercase text-gray-500 tracking-wide">
//           {label}
//         </p>
//         <p className="text-sm sm:text-base text-gray-900 font-medium mt-0.5 break-words">
//           {value}
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Briefcase,
  User,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  Search,
} from "lucide-react";

type UserType = {
  _id: string;
  idCard?: string;
  phone: string;
  role: string;
  name?: string;
  idCardNumber?: string;
};

export default function EmployeeDirectory({ users }: { users: UserType[] }) {
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(
    null,
  );

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [employees, setEmployees] = useState<UserType[]>(users);
  const [updateTargetId, setUpdateTargetId] = useState<string | null>(null);
  const [newIdCardNumber, setNewIdCardNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔹 NEW: search state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setEmployees(users);
  }, [users]);

  const toggleEmployeeExpand = (id: string) => {
    setExpandedEmployeeId((prev) => (prev === id ? null : id));
  };
  const router = useRouter();

  // 🔹 NEW: filtered employees
  const filteredUsers = employees.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.idCardNumber?.toLowerCase().includes(q)
    );
  });

  const handleDeleteEmployee = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await fetch("/api/delete-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTargetId }),
      });
      alert("Employee deleted successfully!");
      setDeleteTargetId(null);
      // ✅ THIS IS THE KEY LINE
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateIdCard = async () => {
    if (!updateTargetId || !newIdCardNumber) return;
    try {
      setIsUpdating(true);
      await fetch("/api/update-idemployee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updateTargetId,
          idCardNumber: newIdCardNumber,
        }),
      });
      alert("ID Card Number updated successfully!");
      // ✅ UPDATE LOCAL STATE (THIS IS THE ANSWER)
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === updateTargetId
            ? { ...emp, idCardNumber: newIdCardNumber }
            : emp,
        ),
      );
      setUpdateTargetId(null);
      setNewIdCardNumber("");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border-0 rounded-2xl shadow-xl bg-white overflow-hidden">
      <CardHeader className="px-4 sm:px-6 py-5 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex  items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                Employee Directory
              </CardTitle>
              <p className="text-sm text-gray-600 mt-0.5">
                {filteredUsers.length} employees found
              </p>
            </div>
          </div>

          {/* 🔹 NEW: Search Bar */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee..."
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-5 space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No matching employees found.
          </div>
        ) : (
          filteredUsers.map((u, idx) => {
            const uid = u.idCard || u._id || `user-${idx}`;

            return (
              <Card
                key={uid}
                className="rounded-xl border border-gray-200/60 overflow-hidden"
              >
                <div
                  onClick={() => toggleEmployeeExpand(uid)}
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-blue-50/40"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    {(u.name || "U")[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {u.name || "Unnamed Employee"}
                    </h3>
                    <p className="text-sm text-gray-600">{u.role}</p>
                  </div>
                  {expandedEmployeeId === uid ? <ChevronUp /> : <ChevronDown />}
                </div>

                {expandedEmployeeId === uid && (
                  <div className="border-t bg-slate-50 px-4 py-5">
                    <EmployeeDetail
                      label="Employee ID"
                      value={u.idCardNumber || "—"}
                      icon={User}
                    />
                    <EmployeeDetail
                      label="Phone"
                      value={u.phone}
                      icon={Phone}
                    />
                    <EmployeeDetail
                      label="Role"
                      value={u.role}
                      icon={Briefcase}
                    />

                    <div className="mt-6 flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUpdateTargetId(u._id);
                          setNewIdCardNumber(u.idCardNumber || "");
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Update ID
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => setDeleteTargetId(u._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </CardContent>

      {/* Update ID Modal */}
      {updateTargetId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold">Update ID Card Number</h3>
            <input
              value={newIdCardNumber}
              onChange={(e) => setNewIdCardNumber(e.target.value)}
              className="mt-4 w-full border rounded-md px-3 py-2"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setUpdateTargetId(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateIdCard} disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEmployee}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
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
    <div className="flex gap-3 mt-2">
      <Icon className="w-4 h-4 text-blue-600" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

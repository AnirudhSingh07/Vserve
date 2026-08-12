// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Phone,
//   Briefcase,
//   User,
//   ChevronDown,
//   ChevronUp,
//   Trash2,
//   Edit,
//   Search,
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
//   const [employees, setEmployees] = useState<UserType[]>(users);
//   const [updateTargetId, setUpdateTargetId] = useState<string | null>(null);
//   const [newIdCardNumber, setNewIdCardNumber] = useState("");
//   const [isUpdating, setIsUpdating] = useState(false);

//   // 🔹 NEW: search state
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     setEmployees(users);
//   }, [users]);

//   const toggleEmployeeExpand = (id: string) => {
//     setExpandedEmployeeId((prev) => (prev === id ? null : id));
//   };
//   const router = useRouter();

//   // 🔹 NEW: filtered employees
//   const filteredUsers = employees.filter((u) => {
//     const q = searchTerm.toLowerCase();
//     return (
//       u.name?.toLowerCase().includes(q) ||
//       u.phone?.includes(q) ||
//       u.role?.toLowerCase().includes(q) ||
//       u.idCardNumber?.toLowerCase().includes(q)
//     );
//   });

//   const handleDeleteEmployee = async () => {
//     if (!deleteTargetId) return;
//     try {
//       setIsDeleting(true);
//       await fetch("/api/delete-employee", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: deleteTargetId }),
//       });
//       alert("Employee deleted successfully!");
//       setDeleteTargetId(null);
//       // ✅ THIS IS THE KEY LINE
//       router.refresh();
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleUpdateIdCard = async () => {
//     if (!updateTargetId || !newIdCardNumber) return;
//     try {
//       setIsUpdating(true);
//       await fetch("/api/update-idemployee", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id: updateTargetId,
//           idCardNumber: newIdCardNumber,
//         }),
//       });
//       alert("ID Card Number updated successfully!");
//       // ✅ UPDATE LOCAL STATE (THIS IS THE ANSWER)
//       setEmployees((prev) =>
//         prev.map((emp) =>
//           emp._id === updateTargetId
//             ? { ...emp, idCardNumber: newIdCardNumber }
//             : emp,
//         ),
//       );
//       setUpdateTargetId(null);
//       setNewIdCardNumber("");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   return (
//     <Card className="border-0 rounded-2xl shadow-xl bg-white overflow-hidden">
//       <CardHeader className="px-4 sm:px-6 py-5 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div className="flex  items-center gap-4">
//             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow">
//               <User className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
//                 Employee Directory
//               </CardTitle>
//               <p className="text-sm text-gray-600 mt-0.5">
//                 {filteredUsers.length} employees found
//               </p>
//             </div>
//           </div>

//           {/* 🔹 NEW: Search Bar */}
//           <div className="relative w-64">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search employee..."
//               className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="p-3 sm:p-5 space-y-4">
//         {filteredUsers.length === 0 ? (
//           <div className="py-12 text-center text-gray-500">
//             No matching employees found.
//           </div>
//         ) : (
//           filteredUsers.map((u, idx) => {
//             const uid = u.idCard || u._id || `user-${idx}`;

//             return (
//               <Card
//                 key={uid}
//                 className="rounded-xl border border-gray-200/60 overflow-hidden"
//               >
//                 <div
//                   onClick={() => toggleEmployeeExpand(uid)}
//                   className="flex items-center gap-4 p-4 cursor-pointer hover:bg-blue-50/40"
//                 >
//                   <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
//                     {(u.name || "U")[0]}
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="font-semibold">
//                       {u.name || "Unnamed Employee"}
//                     </h3>
//                     <p className="text-sm text-gray-600">{u.role}</p>
//                   </div>
//                   {expandedEmployeeId === uid ? <ChevronUp /> : <ChevronDown />}
//                 </div>

//                 {expandedEmployeeId === uid && (
//                   <div className="border-t bg-slate-50 px-4 py-5">
//                     <EmployeeDetail
//                       label="Employee ID"
//                       value={u.idCardNumber || "—"}
//                       icon={User}
//                     />
//                     <EmployeeDetail
//                       label="Phone"
//                       value={u.phone}
//                       icon={Phone}
//                     />
//                     <EmployeeDetail
//                       label="Role"
//                       value={u.role}
//                       icon={Briefcase}
//                     />

//                     <div className="mt-6 flex gap-3 justify-end">
//                       <Button
//                         variant="outline"
//                         onClick={() => {
//                           setUpdateTargetId(u._id);
//                           setNewIdCardNumber(u.idCardNumber || "");
//                         }}
//                       >
//                         <Edit className="w-4 h-4 mr-1" />
//                         Update ID
//                       </Button>

//                       <Button
//                         variant="destructive"
//                         onClick={() => setDeleteTargetId(u._id)}
//                       >
//                         <Trash2 className="w-4 h-4 mr-1" />
//                         Delete
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </Card>
//             );
//           })
//         )}
//       </CardContent>

//       {/* Update ID Modal */}
//       {updateTargetId && (
//         <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
//           <div className="bg-white rounded-xl p-6 w-full max-w-sm">
//             <h3 className="text-lg font-semibold">Update ID Card Number</h3>
//             <input
//               value={newIdCardNumber}
//               onChange={(e) => setNewIdCardNumber(e.target.value)}
//               className="mt-4 w-full border rounded-md px-3 py-2"
//             />
//             <div className="mt-6 flex justify-end gap-3">
//               <Button variant="outline" onClick={() => setUpdateTargetId(null)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleUpdateIdCard} disabled={isUpdating}>
//                 {isUpdating ? "Updating..." : "Confirm"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {deleteTargetId && (
//         <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
//           <div className="bg-white rounded-xl p-6 w-full max-w-sm">
//             <h3 className="text-lg font-semibold">Confirm Deletion</h3>
//             <p className="text-sm text-gray-600 mt-2">
//               This action cannot be undone.
//             </p>
//             <div className="mt-6 flex justify-end gap-3">
//               <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
//                 Cancel
//               </Button>
//               <Button
//                 variant="destructive"
//                 onClick={handleDeleteEmployee}
//                 disabled={isDeleting}
//               >
//                 {isDeleting ? "Deleting..." : "Delete"}
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
//     <div className="flex gap-3 mt-2">
//       <Icon className="w-4 h-4 text-blue-600" />
//       <div>
//         <p className="text-xs text-gray-500">{label}</p>
//         <p className="text-sm font-medium">{value}</p>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NavBar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const DEPARTMENTS = [
  "Sales",
  "IT",
  "Marketing",
  "HR",
  "Operations",
  "Finance",
  "Design",
  "Support",
  "Manager",
  "Team Leader",
  "Telecaller",
  "Field Executive",
  "Backend Executive",
];

const LOCATIONS = [
  "Indore",
  "Bhopal",
  "Sehore",
  "Pithampur",
  "Hoshangabad"
];

type UserType = {
  _id: string;
  idCard?: string;
  phone: string;
  role: string;
  name?: string;
  idCardNumber?: string;
  fatherName?: string;
  panCard?: string;
  bankAccountNumber?: string;
  dateOfJoining?: string;
  addressProof?: string;
  department?: string;
  location?: string;
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

  const [selectedLocation, setSelectedLocation] = useState("");
  const [otherLocation, setOtherLocation] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [otherDepartment, setOtherDepartment] = useState("");

  // 🔹 NEW: Edit modal state
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    fatherName: "",
    phone: "",
    role: "executive",
    panCard: "",
    bankAccountNumber: "",
    dateOfJoining: "",
    addressProof: "",
    department: "",
    location: "",
    idCardNumber: "",
    password: "", // Optional field for password update
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    setEmployees(users);
  }, [users]);

  const toggleEmployeeExpand = (id: string) => {
    setExpandedEmployeeId((prev) => {
      if (prev !== id) {
        setSelectedLocation("");
        setOtherLocation("");
        setSelectedDepartment("");
        setOtherDepartment("");
        return id;
      }
      return null;
    });
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

  // 🔹 NEW: Open edit modal and pre-fill data
  const handleOpenEditModal = (employee: UserType) => {
    setEditTargetId(employee._id);

    // Format date for input field (YYYY-MM-DD)
    let formattedDate = "";
    if (employee.dateOfJoining) {
      const date = new Date(employee.dateOfJoining);
      formattedDate = date.toISOString().split("T")[0];
    }

    const initialDept = employee.department || "";
    const isDeptOther = initialDept && !DEPARTMENTS.includes(initialDept);
    
    const initialLoc = employee.location || "";
    const isLocOther = initialLoc && !LOCATIONS.includes(initialLoc);

    setOtherDepartment(isDeptOther ? initialDept : "");
    setOtherLocation(isLocOther ? initialLoc : "");

    setEditFormData({
      name: employee.name || "",
      fatherName: employee.fatherName || "",
      phone: employee.phone || "",
      role: employee.role || "executive",
      panCard: employee.panCard || "",
      bankAccountNumber: employee.bankAccountNumber || "",
      dateOfJoining: formattedDate,
      addressProof: employee.addressProof || "",
      department: isDeptOther ? "Other" : initialDept,
      location: isLocOther ? "Other" : initialLoc,
      idCardNumber: employee.idCardNumber || "",
      password: "", // Leave empty by default
    });
    setIsEditModalOpen(true);
    setEditError(null);
    setEditSuccess(null);
  };

  // 🔹 NEW: Handle edit form field changes
  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 🔹 NEW: Submit edit form
  const handleSubmitEdit = async () => {
    setEditError(null);
    setEditSuccess(null);

    // Validation
    if (!/^\d{10}$/.test(editFormData.phone)) {
      setEditError("Enter a valid 10-digit mobile number");
      return;
    }

    if (
      !editFormData.name ||
      !editFormData.fatherName ||
      !editFormData.phone ||
      !editFormData.role ||
      !editFormData.panCard ||
      !editFormData.bankAccountNumber ||
      !editFormData.dateOfJoining ||
      !editFormData.addressProof ||
      !editFormData.department ||
      !editFormData.location
    ) {
      setEditError("All fields except password and ID Card are required");
      return;
    }

    if (editFormData.password && editFormData.password.length < 4) {
      setEditError("Password must be at least 4 characters if provided");
      return;
    }

    setIsEditSubmitting(true);

    try {
      // Prepare update payload
      const finalDepartment = editFormData.department === "Other" ? otherDepartment : editFormData.department;
      const finalLocation = editFormData.location === "Other" ? otherLocation : editFormData.location;

      const updatePayload: any = {
        employeeId: editTargetId,
        name: editFormData.name,
        fatherName: editFormData.fatherName,
        phone: editFormData.phone,
        role: editFormData.role,
        panCard: editFormData.panCard,
        bankAccountNumber: editFormData.bankAccountNumber,
        dateOfJoining: editFormData.dateOfJoining,
        addressProof: editFormData.addressProof,
        department: finalDepartment,
        location: finalLocation,
        idCardNumber: editFormData.idCardNumber,
      };

      // Only include password if it's provided
      if (editFormData.password) {
        updatePayload.password = editFormData.password;
      }

      const res = await fetch("/api/employee/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update employee");
      }

      setEditSuccess("Employee updated successfully!");

      // ✅ REAL-TIME UI UPDATE: Update local state immediately
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === editTargetId
            ? {
              ...emp,
              name: editFormData.name,
              fatherName: editFormData.fatherName,
              phone: editFormData.phone,
              role: editFormData.role,
              panCard: editFormData.panCard,
              bankAccountNumber: editFormData.bankAccountNumber,
              dateOfJoining: editFormData.dateOfJoining,
              addressProof: editFormData.addressProof,
              department: finalDepartment,
              location: finalLocation,
              idCardNumber: editFormData.idCardNumber,
            }
            : emp,
        ),
      );

      // Close modal after a short delay
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditTargetId(null);
        setEditSuccess(null);
      }, 1500);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // 🔹 NEW: Close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditTargetId(null);
    setEditError(null);
    setEditSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <NavBar />
      {/* Page Content Wrapper */}
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 pt-20 pb-10">

        {/* Top Nav Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" className="flex items-center gap-2 shadow-sm bg-white hover:bg-gray-50 border-gray-200">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Panel
            </Button>
          </Link>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-sm">

          {/* Card Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Employee Directory</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{filteredUsers.length} employees found</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, phone, role..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Employee List */}
          <div className="p-4 sm:p-5 space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                  <User className="h-8 w-8 text-blue-300" />
                </div>
                <p className="text-lg font-semibold text-slate-700">No Employees Found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search query.</p>
              </div>
            ) : (
              filteredUsers.map((u, idx) => {
                const uid = u.idCard || u._id || `user-${idx}`;
                const isExpanded = expandedEmployeeId === uid;
                const initials = (u.name || "U").slice(0, 2).toUpperCase();

                return (
                  <div
                    key={uid}
                    className={`group rounded-xl border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? "border-blue-200 shadow-md bg-blue-50/40"
                        : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm"
                    }`}
                  >
                    <div
                      onClick={() => toggleEmployeeExpand(uid)}
                      className="flex items-center gap-4 p-4 cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{u.name || "Unnamed Employee"}</p>
                        <p className="text-xs text-slate-500 capitalize">{u.role} {u.department ? `· ${u.department}` : ""}</p>
                      </div>
                      <div className={`flex-shrink-0 transition-transform duration-200 text-slate-400 ${isExpanded ? "rotate-180" : ""}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-blue-100 px-4 pt-4 pb-5 bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                          <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-400">Employee ID</p>
                              <p className="text-sm font-semibold text-slate-700">{u.idCardNumber || "—"}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                              <Phone className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-400">Phone</p>
                              <p className="text-sm font-semibold text-slate-700">{u.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                              <Briefcase className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-400">Role</p>
                              <p className="text-sm font-semibold text-slate-700 capitalize">{u.role}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleOpenEditModal(u)}
                          >
                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                            Edit Employee
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:bg-gray-50"
                            onClick={() => {
                              setUpdateTargetId(u._id);
                              setNewIdCardNumber(u.idCardNumber || "");
                            }}
                          >
                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                            Update ID
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTargetId(u._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Delete
                          </Button>
                          <Link href={`/admin/employee/${u.phone}/report`}>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                              View Report
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          EDIT EMPLOYEE MODAL
      ───────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl border border-gray-100 overflow-hidden">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-6 py-5 flex items-center gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Edit Employee Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Update the information for this employee.</p>
              </div>
              <button
                onClick={handleCloseEditModal}
                disabled={isEditSubmitting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Section: Personal Info */}
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Personal Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name" className="text-xs font-medium text-slate-600">Full Name *</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => handleEditFormChange("name", e.target.value)}
                      placeholder="Enter full name"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-fatherName" className="text-xs font-medium text-slate-600">Father's Name *</Label>
                    <Input
                      id="edit-fatherName"
                      value={editFormData.fatherName}
                      onChange={(e) => handleEditFormChange("fatherName", e.target.value)}
                      placeholder="Enter father's name"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone" className="text-xs font-medium text-slate-600">Mobile Number *</Label>
                    <Input
                      id="edit-phone"
                      inputMode="numeric"
                      maxLength={10}
                      value={editFormData.phone}
                      onChange={(e) => handleEditFormChange("phone", e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 10-digit number"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-role" className="text-xs font-medium text-slate-600">Role *</Label>
                    <Select
                      value={editFormData.role}
                      onValueChange={(value) => handleEditFormChange("role", value)}
                    >
                      <SelectTrigger className="rounded-xl border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Section: Work Details */}
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Work Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-department" className="text-xs font-medium text-slate-600">Department *</Label>
                    <Select
                      value={editFormData.department}
                      onValueChange={(value) => handleEditFormChange("department", value)}
                    >
                      <SelectTrigger id="edit-department" className="rounded-xl border-gray-200">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {editFormData.department === "Other" && (
                      <Input
                        id="edit-otherDepartment"
                        placeholder="Enter your department"
                        value={otherDepartment}
                        onChange={(e) => setOtherDepartment(e.target.value)}
                        className="rounded-xl border-gray-200 mt-2"
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-location" className="text-xs font-medium text-slate-600">Location *</Label>
                    <Select
                      value={editFormData.location}
                      onValueChange={(value) => handleEditFormChange("location", value)}
                    >
                      <SelectTrigger id="edit-location" className="rounded-xl border-gray-200">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {editFormData.location === "Other" && (
                      <Input
                        id="edit-otherLocation"
                        placeholder="Enter your location"
                        value={otherLocation}
                        onChange={(e) => setOtherLocation(e.target.value)}
                        className="rounded-xl border-gray-200 mt-2"
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-dateOfJoining" className="text-xs font-medium text-slate-600">Date of Joining *</Label>
                    <Input
                      id="edit-dateOfJoining"
                      type="date"
                      value={editFormData.dateOfJoining}
                      onChange={(e) => handleEditFormChange("dateOfJoining", e.target.value)}
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-idCardNumber" className="text-xs font-medium text-slate-600">ID Card Number</Label>
                    <Input
                      id="edit-idCardNumber"
                      value={editFormData.idCardNumber}
                      onChange={(e) => handleEditFormChange("idCardNumber", e.target.value)}
                      placeholder="Enter ID Card Number"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Section: Financial & Documents */}
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Financial &amp; Documents</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-panCard" className="text-xs font-medium text-slate-600">PAN Card Number *</Label>
                    <Input
                      id="edit-panCard"
                      value={editFormData.panCard}
                      onChange={(e) => handleEditFormChange("panCard", e.target.value)}
                      placeholder="Enter PAN Card"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-bankAccount" className="text-xs font-medium text-slate-600">Bank Account Number *</Label>
                    <Input
                      id="edit-bankAccount"
                      value={editFormData.bankAccountNumber}
                      onChange={(e) => handleEditFormChange("bankAccountNumber", e.target.value)}
                      placeholder="Enter Bank Account"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="edit-addressProof" className="text-xs font-medium text-slate-600">Address Proof (URL) *</Label>
                    <Input
                      id="edit-addressProof"
                      value={editFormData.addressProof}
                      onChange={(e) => handleEditFormChange("addressProof", e.target.value)}
                      placeholder="Enter address proof URL"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Section: Security */}
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Security</p>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-password" className="text-xs font-medium text-slate-600">
                    Password <span className="text-slate-400 font-normal">(leave empty to keep current)</span>
                  </Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => handleEditFormChange("password", e.target.value)}
                    placeholder="Enter new password (optional)"
                    className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Error / Success banners */}
              {editError && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <span className="text-red-500 mt-0.5">⚠</span>
                  <p className="text-sm text-red-700 font-medium">{editError}</p>
                </div>
              )}
              {editSuccess && (
                <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <p className="text-sm text-green-700 font-medium">{editSuccess}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCloseEditModal}
                disabled={isEditSubmitting}
                className="rounded-xl border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitEdit}
                disabled={isEditSubmitting}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6"
              >
                {isEditSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Updating...
                  </span>
                ) : "Update Employee"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────
          UPDATE ID CARD MODAL
      ───────────────────────────────────────── */}
      {updateTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-6 py-5 flex items-center gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                <Edit className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Update ID Card Number</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter the new ID card number for this employee.</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">ID Card Number</label>
              <input
                value={newIdCardNumber}
                onChange={(e) => setNewIdCardNumber(e.target.value)}
                placeholder="e.g. EMP-2024-001"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setUpdateTargetId(null)}
                className="rounded-xl border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateIdCard}
                disabled={isUpdating}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Updating...
                  </span>
                ) : "Confirm Update"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────
          DELETE CONFIRMATION MODAL
      ───────────────────────────────────────── */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden">

            {/* Danger Header */}
            <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 ring-4 ring-red-50">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-red-900">Confirm Deletion</h3>
                <p className="text-xs text-red-600 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-800 font-medium">⚠ Permanent Deletion Warning</p>
                <p className="text-xs text-red-600 mt-1">
                  The employee record, including all associated data, will be permanently removed from the system and cannot be recovered.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteTargetId(null)}
                className="rounded-xl border-gray-200 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEmployee}
                disabled={isDeleting}
                className="rounded-xl shadow-sm"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Deleting...
                  </span>
                ) : "Delete Employee"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
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

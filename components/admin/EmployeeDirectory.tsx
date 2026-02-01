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
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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

  // 🔹 NEW: Open edit modal and pre-fill data
  const handleOpenEditModal = (employee: UserType) => {
    setEditTargetId(employee._id);

    // Format date for input field (YYYY-MM-DD)
    let formattedDate = "";
    if (employee.dateOfJoining) {
      const date = new Date(employee.dateOfJoining);
      formattedDate = date.toISOString().split("T")[0];
    }

    setEditFormData({
      name: employee.name || "",
      fatherName: employee.fatherName || "",
      phone: employee.phone || "",
      role: employee.role || "executive",
      panCard: employee.panCard || "",
      bankAccountNumber: employee.bankAccountNumber || "",
      dateOfJoining: formattedDate,
      addressProof: employee.addressProof || "",
      department: employee.department || "",
      location: employee.location || "",
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
        department: editFormData.department,
        location: editFormData.location,
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
                department: editFormData.department,
                location: editFormData.location,
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
    <Card className="border-0  rounded-2xl shadow-xl bg-white overflow-hidden">
      <div className="px-4 sm:px-6 py-5">
        {/* Back Button */}
        <Link href="/admin">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Button>
        </Link>
      </div>

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

                    <div className="mt-6 flex flex-wrap gap-3 justify-end">
                      {/* 🔹 NEW: Edit Employee Button */}
                      <Button
                        variant="default"
                        onClick={() => handleOpenEditModal(u)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Employee
                      </Button>

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

                      <Link href={`/admin/employee/${u.phone}/report`}>
                        <Button className="bg-blue-600">
                          View Monthly Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </CardContent>

      {/* 🔹 NEW: Edit Employee Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Edit Employee Details</h3>

            <div className="space-y-4">
              {/* Row 1: Name and Father's Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) =>
                      handleEditFormChange("name", e.target.value)
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fatherName">Father's Name *</Label>
                  <Input
                    id="edit-fatherName"
                    value={editFormData.fatherName}
                    onChange={(e) =>
                      handleEditFormChange("fatherName", e.target.value)
                    }
                    placeholder="Enter father's name"
                  />
                </div>
              </div>

              {/* Row 2: Phone and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-phone">Mobile Number *</Label>
                  <Input
                    id="edit-phone"
                    inputMode="numeric"
                    maxLength={10}
                    value={editFormData.phone}
                    onChange={(e) =>
                      handleEditFormChange(
                        "phone",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    placeholder="Enter 10-digit number"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value) =>
                      handleEditFormChange("role", value)
                    }
                  >
                    <SelectTrigger>
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

              {/* Row 3: Department and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-department">Department *</Label>
                  <Input
                    id="edit-department"
                    value={editFormData.department}
                    onChange={(e) =>
                      handleEditFormChange("department", e.target.value)
                    }
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">Location *</Label>
                  <Select
                    value={editFormData.location}
                    onValueChange={(value) =>
                      handleEditFormChange("location", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indore">Indore</SelectItem>
                      <SelectItem value="Bhopal">Bhopal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: PAN Card and Bank Account */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-panCard">PAN Card Number *</Label>
                  <Input
                    id="edit-panCard"
                    value={editFormData.panCard}
                    onChange={(e) =>
                      handleEditFormChange("panCard", e.target.value)
                    }
                    placeholder="Enter PAN Card"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-bankAccount">
                    Bank Account Number *
                  </Label>
                  <Input
                    id="edit-bankAccount"
                    value={editFormData.bankAccountNumber}
                    onChange={(e) =>
                      handleEditFormChange("bankAccountNumber", e.target.value)
                    }
                    placeholder="Enter Bank Account"
                  />
                </div>
              </div>

              {/* Row 5: Date of Joining and ID Card Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-dateOfJoining">Date of Joining *</Label>
                  <Input
                    id="edit-dateOfJoining"
                    type="date"
                    value={editFormData.dateOfJoining}
                    onChange={(e) =>
                      handleEditFormChange("dateOfJoining", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-idCardNumber">ID Card Number</Label>
                  <Input
                    id="edit-idCardNumber"
                    value={editFormData.idCardNumber}
                    onChange={(e) =>
                      handleEditFormChange("idCardNumber", e.target.value)
                    }
                    placeholder="Enter ID Card Number"
                  />
                </div>
              </div>

              {/* Row 6: Address Proof */}
              <div>
                <Label htmlFor="edit-addressProof">Address Proof (URL) *</Label>
                <Input
                  id="edit-addressProof"
                  value={editFormData.addressProof}
                  onChange={(e) =>
                    handleEditFormChange("addressProof", e.target.value)
                  }
                  placeholder="Enter address proof URL"
                />
              </div>

              {/* Row 7: Password (Optional) */}
              <div>
                <Label htmlFor="edit-password">
                  Password (leave empty to keep current)
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) =>
                    handleEditFormChange("password", e.target.value)
                  }
                  placeholder="Enter new password (optional)"
                />
              </div>

              {/* Error and Success Messages */}
              {editError && (
                <p className="text-sm text-destructive">{editError}</p>
              )}
              {editSuccess && (
                <p className="text-sm text-green-600">{editSuccess}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCloseEditModal}
                disabled={isEditSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit} disabled={isEditSubmitting}>
                {isEditSubmitting ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </div>
        </div>
      )}

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

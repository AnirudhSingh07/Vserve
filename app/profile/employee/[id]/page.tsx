// // app/profile/employee/[id]/page.tsx
// import { Metadata } from "next";
// import Link from "next/link";
// import {
//   User,
//   Phone,
//   Briefcase,
//   CheckCircle,
//   Clock,
//   MapPin,
//   IdCard,
//   Calendar,
//   Banknote,
//   FileText,
//   UserSquare2,
// } from "lucide-react";

// type Employee = {
//   id: string;
//   name?: string;
//   fatherName?: string;
//   phone?: string;
//   role?: string;
//   panCard?: string;
//   bankAccountNumber?: string;
//   dateOfJoining?: string;
//   addressProof?: string;
//   idCardNumber?: string;
// };

// export async function generateMetadata({
//   params,
// }: {
//   params: { id: string };
// }): Promise<Metadata> {
//   return {
//     title: `Employee ${params.id} • Profile`,
//   };
// }

// async function fetchEmployeeById(id: string): Promise<Employee | null> {
//   if (!id) return null;

//   try {
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
//     const res = await fetch(
//       `${baseUrl}/api/viewEmployee?id=${encodeURIComponent(id)}`,
//       {
//         cache: "no-store",
//       }
//     );

//     if (res.ok) {
//       const data = await res.json();
//       return data.employee ?? null;
//     }

//     console.warn(`Employee with ID ${id} not found`);
//     return null;
//   } catch (err) {
//     console.error("Error fetching employee:", err);
//     return null;
//   }
// }

// export default async function Page({ params }: { params: { id: string } }) {
//   const id = params.id;
//   const employee = await fetchEmployeeById(id);

//   if (!employee) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-6">
//         <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow">
//           <h2 className="text-2xl font-semibold mb-4">Employee not found</h2>
//           <p className="text-sm text-gray-600 mb-6">
//             No employee found for id: <strong>{id}</strong>
//           </p>
//           <Link
//             href="/admin"
//             className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             Back to Admin
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
//       <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
//         {/* Header */}
//         <div className="flex items-center gap-4">
//           <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-16 h-16 flex items-center justify-center text-xl font-semibold">
//             {(employee.name || "U").charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold">
//               {employee.name ?? "Unnamed Employee"}
//             </h1>
//             <p className="text-sm text-gray-600">
//               ID: #{employee.idCardNumber}
//             </p>
//             <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
//               <span className="inline-flex items-center gap-1">
//                 <Briefcase className="w-4 h-4" />
//                 {employee.role ?? "—"}
//               </span>
//               <span className="inline-flex items-center gap-1">
//                 <Phone className="w-4 h-4" />
//                 {employee.phone ?? "—"}
//               </span>
//             </div>
//           </div>
//           <div className="ml-auto">
//             <Link href="/admin">
//               <button className="text-sm px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">
//                 Back
//               </button>
//             </Link>
//           </div>
//         </div>

//         {/* Main details */}
//         <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             {/* Father Name */}
//             <div className="flex items-start gap-3">
//               <div className="bg-blue-50 p-2 rounded">
//                 <UserSquare2 className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-500 uppercase">
//                   Father’s Name
//                 </p>
//                 <p className="text-gray-900 mt-1">
//                   {employee.fatherName ?? "—"}
//                 </p>
//               </div>
//             </div>

//             {/* PAN Card */}
//             <div className="flex items-start gap-3">
//               <div className="bg-blue-50 p-2 rounded">
//                 <IdCard className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-500 uppercase">
//                   PAN Card
//                 </p>
//                 <p className="text-gray-900 mt-1">{employee.panCard ?? "—"}</p>
//               </div>
//             </div>

//             {/* Bank Account */}
//             <div className="flex items-start gap-3">
//               <div className="bg-blue-50 p-2 rounded">
//                 <Banknote className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-500 uppercase">
//                   Bank Account No.
//                 </p>
//                 <p className="text-gray-900 mt-1">
//                   {employee.bankAccountNumber ?? "—"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Second column */}
//           <div className="space-y-4">
//             {/* Date of Joining */}
//             <div className="flex items-start gap-3">
//               <div className="bg-blue-50 p-2 rounded">
//                 <Calendar className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-500 uppercase">
//                   Date of Joining
//                 </p>
//                 <p className="text-gray-900 mt-1">
//                   {employee.dateOfJoining
//                     ? new Date(employee.dateOfJoining).toLocaleDateString()
//                     : "—"}
//                 </p>
//               </div>
//             </div>

//             {/* Address Proof */}
//             <div className="flex items-start gap-3">
//               <div className="bg-blue-50 p-2 rounded">
//                 <FileText className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-500 uppercase">
//                   Address Proof
//                 </p>
//                 <p className="text-gray-900 mt-1">
//                   {employee.addressProof ?? "—"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// app/profile/employee/[id]/page.tsx
import { Metadata } from "next";
import CheckInOutButtons from "./CheckInOutButtons";
import Link from "next/link";
import {
  User,
  Phone,
  Briefcase,
  CheckCircle,
  Clock,
  IdCard,
  Calendar,
  Banknote,
  FileText,
  UserSquare2,
} from "lucide-react";

type Employee = {
  id: string;
  name?: string;
  fatherName?: string;
  phone?: string;
  role?: string;
  panCard?: string;
  bankAccountNumber?: string;
  dateOfJoining?: string;
  addressProof?: string;
  idCardNumber?: string;
};

type AttendanceResponse = {
  data: Attendance[];
  totalPresent?: number;
  totalAbsent?: number;
};

type Attendance = {
  date: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  lateApproved?: boolean;
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: `Employee ${params.id} • Profile`,
  };
}

async function fetchEmployeeById(id: string): Promise<Employee | null> {
  if (!id) return null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/viewEmployee?id=${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = await res.json();
      return data.employee ?? null;
    }

    console.warn(`Employee with ID ${id} not found`);
    return null;
  } catch (err) {
    console.error("Error fetching employee:", err);
    return null;
  }
}

// 🧩 Fetch attendance by phone (with monthly stats)
async function fetchAttendanceByPhone(
  phone?: string
): Promise<AttendanceResponse> {
  if (!phone) return { data: [] };

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/attendance/allattendance?phone=${encodeURIComponent(
        phone
      )}`,
      {
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = await res.json();
      return {
        data: data?.data ?? [],
        totalPresent: data?.totalPresent ?? 0,
        totalAbsent: data?.totalAbsent ?? 0,
      };
    }

    console.warn(`No attendance data found for phone: ${phone}`);
    return { data: [], totalPresent: 0, totalAbsent: 0 };
  } catch (err) {
    console.error("Error fetching attendance:", err);
    return { data: [], totalPresent: 0, totalAbsent: 0 };
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const employee = await fetchEmployeeById(id);

  // 🧩 Fetch attendance with stats
  const {
    data: attendanceList,
    totalPresent,
    totalAbsent,
  } = employee?.phone
    ? await fetchAttendanceByPhone(employee.phone)
    : { data: [], totalPresent: 0, totalAbsent: 0 };

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-4">Employee not found</h2>
          <p className="text-sm text-gray-600 mb-6">
            No employee found for id: <strong>{id}</strong>
          </p>
          <Link
            href="/admin"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-16 h-16 flex items-center justify-center text-xl font-semibold">
            {(employee.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {employee.name ?? "Unnamed Employee"}
            </h1>
            <p className="text-sm text-gray-600">
              ID: #{employee.idCardNumber}
            </p>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {employee.role ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {employee.phone ?? "—"}
              </span>
            </div>

            {/* ✅ Present/Absent Summary */}
            <div className="mt-3 flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Present: {totalPresent}
              </span>
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <Clock className="w-4 h-4" />
                Absent: {totalAbsent}
              </span>
            </div>

            {/* ✅ Admin Manual Check-In / Check-Out */}
            <CheckInOutButtons phone={employee.phone} />
          </div>
          <div className="ml-auto">
            <Link href="/admin">
              <button className="text-sm px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">
                Back
              </button>
            </Link>
          </div>
        </div>

        {/* Main details (unchanged) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Father Name */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <UserSquare2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Father’s Name
                </p>
                <p className="text-gray-900 mt-1">
                  {employee.fatherName ?? "—"}
                </p>
              </div>
            </div>

            {/* PAN Card */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <IdCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  PAN Card
                </p>
                <p className="text-gray-900 mt-1">{employee.panCard ?? "—"}</p>
              </div>
            </div>

            {/* Bank Account */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Bank Account No.
                </p>
                <p className="text-gray-900 mt-1">
                  {employee.bankAccountNumber ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Second column */}
          <div className="space-y-4">
            {/* Date of Joining */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Date of Joining
                </p>
                <p className="text-gray-900 mt-1">
                  {employee.dateOfJoining
                    ? new Date(employee.dateOfJoining).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>

            {/* Address Proof */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Address Proof
                </p>
                <p className="text-gray-900 mt-1">
                  {employee.addressProof ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🧾 Attendance Table */}
        {attendanceList.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Attendance Records
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 border">Date</th>
                    <th className="px-3 py-2 border">Status</th>
                    <th className="px-3 py-2 border">Check In</th>
                    <th className="px-3 py-2 border">Check Out</th>
                    <th className="px-3 py-2 border">Late Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map((a, i) => (
                    <tr key={i} className="text-center border-t">
                      <td className="px-3 py-2">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td
                        className={`px-3 py-2 font-medium ${
                          a.status === "Present"
                            ? "text-green-600"
                            : a.status === "Absent"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {a.status}
                      </td>
                      <td className="px-3 py-2">{a.checkInTime ?? "—"}</td>
                      <td className="px-3 py-2">{a.checkOutTime ?? "—"}</td>
                      <td className="px-3 py-2">
                        {a.lateApproved ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="mt-8 text-gray-500 text-sm text-center">
            No attendance records found.
          </p>
        )}
      </div>
    </div>
  );
}

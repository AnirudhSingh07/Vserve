// // "use client";

// // import React, { useEffect, useState } from "react";
// // import { useSearchParams } from "next/navigation";

// // type SentLocationType = {
// //   _id: string;
// //   employeeId: string;
// //   date: string;
// //   coords: {
// //     lat: number;
// //     lng: number;
// //   };
// // };

// // type Employee = {
// //   name: string;
// //   fatherName: string;
// //   phone: string;
// //   role: string;
// //   dateOfJoining: string;
// // };

// // const SentLocation = ({ params }: { params: { empphone: string } }) => {
// //   const searchParams = useSearchParams();
// //   const emphone = params.empphone;
// //   const date = searchParams.get("date"); // ✅ from query
// //   const [data, setData] = useState<SentLocationType[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [locations, setLocations] = useState<SentLocationType[]>([]);
// //   const [employee, setEmployee] = useState<Employee | null>(null);

// //   const [error, setError] = useState<string | null>(null);

// //   const fetchSentLocations = async () => {
// //     try {
// //       setLoading(true);

// //       const res = await fetch(
// //         `/api/attendance/sentloc?phone=${emphone}&date=${date}`
// //       );

// //       if (!res.ok) {
// //         throw new Error("Failed to fetch sent locations");
// //       }

// //       const result = await res.json();
// //       console.log("Fetched Sent Locations:", result);
// //       setLocations(result.data || []);
// //       setEmployee({
// //         name: result.employee.name,
// //         fatherName: result.employee.fatherName,
// //         phone: result.employee.phone,
// //         role: result.employee.role,
// //         dateOfJoining: result.employee.dateOfJoining,
// //       });
// //       if (result.success) {
// //         setData(result.data);
// //       } else {
// //         setError("No data found");
// //       }
// //     } catch (err: any) {
// //       setError(err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchSentLocations();
// //   }, []);

// //   if (loading) {
// //     return <div className="p-6">Loading sent locations...</div>;
// //   }

// //   if (error) {
// //     return <div className="p-6 text-red-500">{error}</div>;
// //   }

// //   return (
// //     <div className="p-6">
// //       {employee && (
// //         <div className="mb-6 rounded-lg border p-4 bg-slate-50">
// //           <h2 className="text-lg font-semibold mb-3">Employee Details</h2>

// //           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
// //             <div>
// //               <p className="text-gray-500">Name</p>
// //               <p className="font-medium">{employee.name}</p>
// //             </div>

// //             <div>
// //               <p className="text-gray-500">Father Name</p>
// //               <p className="font-medium">{employee.fatherName}</p>
// //             </div>

// //             <div>
// //               <p className="text-gray-500">Phone</p>
// //               <p className="font-medium">{employee.phone}</p>
// //             </div>

// //             <div>
// //               <p className="text-gray-500">Role</p>
// //               <p className="font-medium capitalize">{employee.role}</p>
// //             </div>

// //             <div>
// //               <p className="text-gray-500">Date of Joining</p>
// //               <p className="font-medium">
// //                 {new Date(employee.dateOfJoining).toDateString()}
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
// //         {locations.map((item, index) => (
// //           <div key={index} className="border rounded-lg p-4 shadow-sm">
// //             <p className="text-sm text-gray-500">Date</p>
// //             <p className="font-medium">{new Date(item.date).toDateString()}</p>
// //             <p className="font-medium">
// //               {new Date(item.date).toLocaleTimeString()}
// //             </p>
// //             <div className="mt-2">
// //               <p className="text-sm text-gray-500">Latitude</p>
// //               <p>{item.coords.lat}</p>
// //             </div>

// //             <div className="mt-1">
// //               <p className="text-sm text-gray-500">Longitude</p>
// //               <p>{item.coords.lng}</p>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default SentLocation;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { MapPin, Calendar, Phone, User, Briefcase, Clock } from "lucide-react";

// type SentLocationType = {
//   _id: string;
//   employeeId: string;
//   date: string;
//   coords: {
//     lat: number;
//     lng: number;
//   };
// };

// type Employee = {
//   name: string;
//   fatherName: string;
//   phone: string;
//   role: string;
//   dateOfJoining: string;
// };

// const SentLocation = ({ params }: { params: { empphone: string } }) => {
//   const searchParams = useSearchParams();
//   const emphone = params.empphone;
//   const date = searchParams.get("date");
//   const [data, setData] = useState<SentLocationType[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [locations, setLocations] = useState<SentLocationType[]>([]);
//   const [employee, setEmployee] = useState<Employee | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const fetchSentLocations = async () => {
//     try {
//       setLoading(true);

//       const res = await fetch(
//         `/api/attendance/sentloc?phone=${emphone}&date=${date}`
//       );

//       if (!res.ok) {
//         throw new Error("Failed to fetch sent locations");
//       }

//       const result = await res.json();
//       console.log("Fetched Sent Locations:", result);
//       setLocations(result.data || []);
//       setEmployee({
//         name: result.employee.name,
//         fatherName: result.employee.fatherName,
//         phone: result.employee.phone,
//         role: result.employee.role,
//         dateOfJoining: result.employee.dateOfJoining,
//       });
//       if (result.success) {
//         setData(result.data);
//       } else {
//         setError("No data found");
//       }
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSentLocations();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
//           <div className="flex flex-col items-center space-y-4">
//             <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-lg font-semibold text-gray-800">
//               Loading sent locations...
//             </p>
//             <p className="text-sm text-gray-500">
//               Please wait while we fetch the data
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border-l-4 border-red-500">
//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0">
//               <svg
//                 className="w-6 h-6 text-red-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-1">
//                 Error
//               </h3>
//               <p className="text-gray-700">{error}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
//             Location History
//           </h1>
//           <p className="text-gray-600">View employee location tracking data</p>
//         </div>

//         {/* Employee Details Card */}
//         {employee && (
//           <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-5">
//               <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
//                 <User className="w-6 h-6" />
//                 Employee Details
//               </h2>
//             </div>

//             <div className="p-6 sm:p-8">
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
//                   <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <User className="w-5 h-5 text-blue-600" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
//                       Name
//                     </p>
//                     <p className="text-base font-semibold text-gray-900 truncate">
//                       {employee.name}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
//                   <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
//                     <User className="w-5 h-5 text-purple-600" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
//                       Father's Name
//                     </p>
//                     <p className="text-base font-semibold text-gray-900 truncate">
//                       {employee.fatherName}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
//                   <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
//                     <Phone className="w-5 h-5 text-green-600" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
//                       Phone
//                     </p>
//                     <p className="text-base font-semibold text-gray-900">
//                       {employee.phone}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
//                   <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
//                     <Briefcase className="w-5 h-5 text-orange-600" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
//                       Role
//                     </p>
//                     <p className="text-base font-semibold text-gray-900 capitalize">
//                       {employee.role}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors sm:col-span-2 lg:col-span-1">
//                   <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
//                     <Calendar className="w-5 h-5 text-indigo-600" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
//                       Date of Joining
//                     </p>
//                     <p className="text-base font-semibold text-gray-900">
//                       {new Date(employee.dateOfJoining).toLocaleDateString(
//                         "en-US",
//                         {
//                           year: "numeric",
//                           month: "short",
//                           day: "numeric",
//                         }
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Locations Section */}
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <MapPin className="w-6 h-6 text-blue-600" />
//               Location Records
//             </h2>
//             <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
//               {locations.length} {locations.length === 1 ? "Record" : "Records"}
//             </span>
//           </div>
//         </div>

//         {/* Locations Grid */}
//         {locations.length === 0 ? (
//           <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
//             <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">
//               No Locations Found
//             </h3>
//             <p className="text-gray-500">
//               There are no location records for the selected date.
//             </p>
//           </div>
//         ) : (
//           <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//             {locations.map((item, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 group"
//               >
//                 <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
//                   <div className="flex items-center justify-between">
//                     <span className="text-white font-semibold text-sm">
//                       Location #{index + 1}
//                     </span>
//                     <MapPin className="w-5 h-5 text-white" />
//                   </div>
//                 </div>

//                 <div className="p-5 space-y-4">
//                   <div className="flex items-start space-x-3">
//                     <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
//                       <Calendar className="w-4 h-4 text-blue-600" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
//                         Date
//                       </p>
//                       <p className="font-semibold text-gray-900 text-sm">
//                         {new Date(item.date).toLocaleDateString("en-US", {
//                           year: "numeric",
//                           month: "short",
//                           day: "numeric",
//                         })}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start space-x-3">
//                     <div className="flex-shrink-0 w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
//                       <Clock className="w-4 h-4 text-purple-600" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
//                         Time
//                       </p>
//                       <p className="font-semibold text-gray-900 text-sm">
//                         {new Date(item.date).toLocaleTimeString("en-US", {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                           second: "2-digit",
//                         })}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="pt-3 border-t border-gray-100">
//                     <div className="bg-gray-50 rounded-lg p-3 space-y-2">
//                       <div className="flex justify-between items-center">
//                         <span className="text-xs font-medium text-gray-500 uppercase">
//                           Latitude
//                         </span>
//                         <span className="text-sm font-semibold text-gray-900 font-mono">
//                           {item.coords.lat.toFixed(6)}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="text-xs font-medium text-gray-500 uppercase">
//                           Longitude
//                         </span>
//                         <span className="text-sm font-semibold text-gray-900 font-mono">
//                           {item.coords.lng.toFixed(6)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <a
//                     href={`https://www.google.com/maps?q=${item.coords.lat},${item.coords.lng}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
//                   >
//                     View on Map
//                   </a>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SentLocation;

"use client";

import React, { useEffect, useState } from "react";
// In your actual Next.js app, change this import to: import { useSearchParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
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
  totalDistanceKm: number;
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
  const [locations, setLocations] = useState<SentLocationType[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSentLocations = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/attendance/sentloc?phone=${emphone}&date=${date}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch sent locations");
      }

      const result = await res.json();
      console.log("Fetched Sent Locations:", result);
      setLocations(result.data || []);
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
          {/* Header Section */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold font-sans tracking-tight text-[#ba4c83]">
                Location History
              </h1>
              <p className="mt-2 text-slate-500">
                Tracking report for{" "}
                <span className="font-medium text-slate-900">
                  {date ? new Date(date).toLocaleDateString() : "Today"}
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
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Locations Grid */}
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {locations.map((item, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ring-1 ring-slate-200 hover:ring-blue-100"
                >
                  {/* Card Header Gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <Hash className="mr-1 h-3 w-3" />
                        {index + 1}
                      </span>
                      <span className="flex items-center text-xs font-medium text-slate-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mb-6 text-center">
                      <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Clock className="h-6 w-6" />
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {new Date(item.date).toLocaleTimeString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Timestamp
                      </p>
                    </div>

                    <div className="space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          Lat
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {item.coords.lat.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          Lng
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {item.coords.lng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                    <a
                      href={`https://www.google.com/maps?q=${item.coords.lat},${item.coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-800 hover:text-white hover:ring-slate-800 active:scale-95"
                    >
                      <Navigation className="h-4 w-4" />
                      View on Map
                    </a>
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

// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Clock,
//   Download,
//   Phone,
//   Calendar,
//   CheckCircle,
//   AlertCircle,
//   Search,
// } from "lucide-react";

// type AttendanceRow = {
//   phone: string;
//   date: string;
//   name: string;
//   status: string;
//   checkIn?: string;
//   checkOut?: string;
// };

// interface AttendanceLogsProps {
//   attRows: AttendanceRow[];
//   downloadCSV: () => void;
// }

// export default function AttendanceLogs({
//   attRows,
//   downloadCSV,
// }: AttendanceLogsProps) {
//   const router = useRouter();
//   const [search, setSearch] = useState("");
//   const [isOnTime, setIsOnTime] = useState<boolean | null>(null);

//   function extractDate(input: string) {
//     const date = new Date(input);
//     if (isNaN(date.getTime())) return input;

//     const day = String(date.getUTCDate()).padStart(2, "0");
//     const month = String(date.getUTCMonth() + 1).padStart(2, "0");
//     const year = date.getUTCFullYear();
//     return `${day}/${month}/${year}`;
//   }

//   const handleRowClick = (phone: string, date: string) => {
//     const formattedDate = new Date(date).toISOString().split("T")[0];
//     router.push(`/admin/sentlocation/${phone}?date=${formattedDate}`);
//   };

//   // 🔍 Real-time search filtering
//   const filteredRows = attRows.filter((row) => {
//     const query = search.toLowerCase();
//     return (
//       row.name.toLowerCase().includes(query) ||
//       row.phone.includes(query) ||
//       extractDate(row.date).includes(query) ||
//       (row.checkIn || "").includes(query) ||
//       (row.checkOut || "").includes(query)
//     );
//   });

//   return (
//     <Card className="shadow-lg border-0 overflow-hidden w-full">
//       {/* Header */}
//       <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b px-4 sm:px-6 py-4">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
//               <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
//             </div>
//             <div>
//               <CardTitle className="text-lg sm:text-2xl font-semibold">
//                 Attendance Logs
//               </CardTitle>
//               <p className="text-xs sm:text-sm text-gray-600 mt-1">
//                 {filteredRows.length} records
//               </p>
//             </div>
//           </div>

//           {/* 🔍 Search bar */}
//           <div className="relative w-full sm:w-64">
//             <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search name, phone, date..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//           </div>

//           <Button
//             onClick={downloadCSV}
//             className="bg-purple-600 hover:bg-purple-700 text-white shadow-md w-full sm:w-auto text-sm sm:text-base"
//           >
//             <Download className="w-4 h-4 mr-2" />
//             Download CSV
//           </Button>
//         </div>
//       </CardHeader>

//       {/* Table */}
//       <CardContent className="p-0 overflow-x-auto">
//         <div className="w-full overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
//                   Name
//                 </th>
//                 <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
//                   <Phone className="inline w-4 h-4 mr-1" /> Phone
//                 </th>
//                 <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
//                   <Calendar className="inline w-4 h-4 mr-1" /> Date
//                 </th>
//                 <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
//                   Status
//                 </th>
//                 <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
//                   Check-in
//                 </th>
//                 <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
//                   Check-out
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredRows.map((row, index) => (
//                 <tr
//                   key={index}
//                   onClick={() => handleRowClick(row.phone, row.date)}
//                   className="hover:bg-gray-50 transition-colors cursor-pointer"
//                 >
//                   <td className="px-3 sm:px-4 py-2 text-gray-700">
//                     {row.name}
//                   </td>
//                   <td className="px-3 sm:px-4 py-2 text-gray-700">
//                     {row.phone}
//                   </td>
//                   <td className="px-3 sm:px-4 py-2 text-gray-700">
//                     {extractDate(row.date)}
//                   </td>

//                   <td className="px-3 sm:px-4 py-2">
//                     {(() => {
//                       if (!row.checkIn) {
//                         return <span className="text-gray-400">--</span>;
//                       }

//                       // Parse check-in time
//                       const [hours, minutes] = row.checkIn
//                         .split(":")
//                         .map(Number);
//                       const checkInMinutes = hours * 60 + minutes;

//                       const nineAM = 9 * 60; // 540
//                       const tenAM = 10 * 60; // 600

//                       let status:  "On-time" | "Late";

//                       if (checkInMinutes < nineAM) {
//                         status = "Late";
//                       } else if (checkInMinutes <= tenAM) {
//                         status = "On-time";
//                       } else {
//                         status = "Late";
//                       }

//                       return status === "On-time" ? (
//                         <span className="flex items-center text-green-600 font-medium">
//                           <CheckCircle className="w-4 h-4 mr-1" /> On-time
//                         </span>
//                       ) : status === "Late" ? (
//                         <span className="flex items-center text-orange-600 font-medium">
//                           <AlertCircle className="w-4 h-4 mr-1" /> Late
//                         </span>
//                       ) : (
//                         <span className="text-blue-600 font-medium">Off time</span>
//                       );
//                     })()}
//                   </td>

//                   <td className="px-3 sm:px-4 py-2 text-gray-700">
//                     {row.checkIn || "—"}
//                   </td>
//                   <td className="px-3 sm:px-4 py-2 text-gray-700">
//                     {row.checkOut || "—"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Download,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowRight,
} from "lucide-react";

type AttendanceRow = {
  phone: string;
  date: string;
  name: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  location?: string;
  department?: string;
};

interface AttendanceLogsProps {
  attRows: AttendanceRow[];
  downloadCSV: () => void;
}

// ✅ Updated Type to include "range"
type DateFilterType = "today" | "yesterday" | "date" | "range" | "all";

export default function AttendanceLogs({
  attRows,
  downloadCSV,
}: AttendanceLogsProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isOnTime, setIsOnTime] = useState<boolean | null>(null);

  // ✅ Date filter state
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("today");

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // ✅ New States for Range Filter
  const [fromDate, setFromDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  function extractDate(input: string) {
    const date = new Date(input);
    if (isNaN(date.getTime())) return input;

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  function normalizeDate(input: string) {
    const date = new Date(input);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  }

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  function getYesterdayDate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }

  const handleRowClick = (phone: string, date: string) => {
    const formattedDate = date.split("T")[0].split(" ")[0];
    router.push(`/admin/sentlocation/${phone}?date=${formattedDate}`);
  };

  // 🔍 Date filter + existing search filter
  const filteredRows = attRows
    .filter((row) => {
      const rowDate = normalizeDate(row.date);

      if (dateFilterType === "all") return true;
      if (dateFilterType === "today") return rowDate === getTodayDate();
      if (dateFilterType === "yesterday") return rowDate === getYesterdayDate();
      if (dateFilterType === "date") return rowDate === selectedDate;
      
      // ✅ Range Logic
      if (dateFilterType === "range") {
        return rowDate >= fromDate && rowDate <= toDate;
      }

      return true;
    })
    .filter((row) => {
      const query = search.toLowerCase();
      return (
        row.name.toLowerCase().includes(query) ||
        row.phone.includes(query) ||
        extractDate(row.date).includes(query) ||
        (row.checkIn || "").includes(query) ||
        (row.checkOut || "").includes(query)
      );
    });
  
  // console.log(filteredRows);

  return (
    <Card className="shadow-lg border-0 overflow-hidden w-full">
      {/* Header */}
      <CardHeader className=" bg-gradient-to-r from-slate-50 to-purple-50 border-b px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-2xl font-semibold">
                Attendance Logs
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {filteredRows.length} records
              </p>
            </div>
          </div>

          {/* 🔍 Search + Date Filters */}
          <div className="flex flex-col xl:flex-row gap-2 w-full xl:w-auto">
            <div className="relative w-full xl:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, phone, date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={dateFilterType}
                onChange={(e) =>
                  setDateFilterType(e.target.value as DateFilterType)
                }
                className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="date">Specific Date</option>
                <option value="range">Date Range</option> {/* ✅ Added Option */}
                <option value="all">All Time</option>
              </select>

              {/* Specific Date Input */}
              {dateFilterType === "date" && (
                <div className="relative w-full sm:w-40">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* ✅ Range Inputs */}
              {dateFilterType === "range" && (
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-36">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      title="From Date"
                    />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                  <div className="relative w-full sm:w-36">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      min={fromDate} // Optional: Prevent selecting end date before start date
                      className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      title="To Date"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={downloadCSV}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md w-full lg:w-auto text-sm sm:text-base"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </CardHeader>

      {/* Table */}
      <CardContent className="p-0 overflow-x-auto">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  <Phone className="inline w-4 h-4 mr-1" /> Phone
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  <Calendar className="inline w-4 h-4 mr-1" /> Date
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Check-in
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Check-Out
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Department
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRows.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(row.phone, row.date)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.name}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.phone}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {extractDate(row.date)}
                  </td>

                  <td className="px-3 sm:px-4 py-2">
                    {(() => {
                      if (!row.checkIn) {
                        return <span className="text-gray-400">--</span>;
                      }

                      const [hours, minutes] = row.checkIn
                        .split(":")
                        .map(Number);
                      const checkInMinutes = hours * 60 + minutes;

                      const nineAM = 9 * 60;
                      const tenAM = 10 * 60;

                      let status: "On-time" | "Late";

                      if (checkInMinutes < nineAM) {
                        status = "Late";
                      } else if (checkInMinutes <= tenAM) {
                        status = "On-time";
                      } else {
                        status = "Late";
                      }

                      return status === "On-time" ? (
                        <span className="flex items-center text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" /> On-time
                        </span>
                      ) : (
                        <span className="flex items-center text-orange-600 font-medium">
                          <AlertCircle className="w-4 h-4 mr-1" /> Late
                        </span>
                      );
                    })()}
                  </td>

                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.checkIn || "—"}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.checkOut || "—"}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.location || "—"}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700">
                    {row.department || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Calendar,
//   User,
//   Briefcase,
//   Phone,
//   MapPin,
//   Route,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   Loader2,
//   Download,
//   Filter,
//   DatabaseIcon,
//   PlaneIcon,
//   MapIcon,
//   AreaChartIcon,
//   IdCard,
//   IdCardIcon,
//   PersonStandingIcon,
//   WorkflowIcon,
//   PiggyBankIcon,
//   BackpackIcon,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import NavBar from "@/components/Navbar";
// import * as XLSX from "xlsx";

// type ReportData = {
//   success: boolean;
//   meta: {
//     range: { start: string; end: string };
//     sundayExcluded: boolean;
//   };
//   employee: {
//     name: string;
//     fatherName: string;
//     role: string;
//     department: string;
//     location: string;
//     panCard: string;
//     addressProof: string;
//     idCardNumber: string;
//     dateOfJoining: string;
//     bankAccountNumber: string;
//   };
//   report: {
//     attendance: {
//       presentDays: number;
//       status: { onTime: number; late: number };
//     };
//     travel: { totalDistanceKm: number };
//     activity: { distinctLocationsVisited: number };
//   };
// };

// type FilterMode = "current" | "single" | "range";

// const EmployeeReportPage = ({ params }: { params: { empphone: string } }) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const empphone = params.empphone;

//   // State for filters
//   const [filterMode, setFilterMode] = useState<FilterMode>("current");
//   const [startMonth, setStartMonth] = useState(
//     searchParams.get("startMonth") || new Date().toISOString().slice(0, 7),
//   );
//   const [endMonth, setEndMonth] = useState(
//     searchParams.get("endMonth") || new Date().toISOString().slice(0, 7),
//   );
//   const [singleMonth, setSingleMonth] = useState(
//     new Date().toISOString().slice(0, 7),
//   );

//   const [data, setData] = useState<ReportData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [exporting, setExporting] = useState(false);

//   const fetchReport = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       let queryStartMonth = startMonth;
//       let queryEndMonth = endMonth;

//       if (filterMode === "current") {
//         const currentMonth = new Date().toISOString().slice(0, 7);
//         queryStartMonth = currentMonth;
//         queryEndMonth = currentMonth;
//       } else if (filterMode === "single") {
//         queryStartMonth = singleMonth;
//         queryEndMonth = singleMonth;
//       }

//       const res = await fetch(
//         `/api/reports/employee-activity?phone=${empphone}&startMonth=${queryStartMonth}&endMonth=${queryEndMonth}`,
//       );
//       const result = await res.json();

//       if (!res.ok) throw new Error(result.error || "Failed to fetch report");
//       setData(result);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [empphone, startMonth, endMonth, singleMonth, filterMode]);

//   useEffect(() => {
//     fetchReport();
//   }, [fetchReport]);

//   const handleFilterUpdate = () => {
//     if (filterMode === "current") {
//       const currentMonth = new Date().toISOString().slice(0, 7);
//       router.push(`?startMonth=${currentMonth}&endMonth=${currentMonth}`);
//     } else if (filterMode === "single") {
//       router.push(`?startMonth=${singleMonth}&endMonth=${singleMonth}`);
//     } else {
//       router.push(`?startMonth=${startMonth}&endMonth=${endMonth}`);
//     }
//     fetchReport();
//   };

//   const handleExportExcel = () => {
//     if (!data) return;

//     setExporting(true);
//     try {
//       // Create workbook
//       const wb = XLSX.utils.book_new();

//       // Calculate metrics
//       const lateRate =
//         data.report.attendance.presentDays > 0
//           ? (
//               (data.report.attendance.status.late /
//                 data.report.attendance.presentDays) *
//               100
//             ).toFixed(1)
//           : "0";

//       const avgDistance =
//         data.report.attendance.presentDays > 0
//           ? (
//               data.report.travel.totalDistanceKm /
//               data.report.attendance.presentDays
//             ).toFixed(2)
//           : "0";

//       const punctualityScore =
//         data.report.attendance.presentDays > 0
//           ? (
//               (data.report.attendance.status.onTime /
//                 data.report.attendance.presentDays) *
//               100
//             ).toFixed(1)
//           : "0";

//       // Employee Information Sheet
//       const employeeData = [
//         ["EMPLOYEE ACTIVITY REPORT"],
//         [""],
//         ["Employee Information"],
//         ["Name", data.employee.name],
//         ["Role", data.employee.role],
//         ["Father's Name", data.employee.fatherName],
//         ["Department", data.employee.department],
//         ["Phone", empphone],
//         ["location", data.employee.location],
//         ["PAN Card", data.employee.panCard],
//         ["Address Proof", data.employee.addressProof],
//         ["ID Card Number", data.employee.idCardNumber],
//         ["Date of Joining", data.employee.dateOfJoining],
//         ["Bank Account Number", data.employee.bankAccountNumber],
//         [""],
//         ["Report Period"],
//         ["Start Date", new Date(data.meta.range.start).toLocaleDateString()],
//         ["End Date", new Date(data.meta.range.end).toLocaleDateString()],
//         ["Sundays Excluded", data.meta.sundayExcluded ? "Yes" : "No"],
//       ];

//       // Attendance Summary Sheet
//       const attendanceData = [
//         ["ATTENDANCE SUMMARY"],
//         [""],
//         ["Metric", "Value"],
//         ["Total Days Present", data.report.attendance.presentDays],
//         ["On-Time Days", data.report.attendance.status.onTime],
//         ["Late Days", data.report.attendance.status.late],
//         ["Late Attendance Rate (%)", lateRate],
//         ["Punctuality Score (%)", punctualityScore],
//       ];

//       // Travel Summary Sheet
//       const travelData = [
//         ["TRAVEL SUMMARY"],
//         [""],
//         ["Metric", "Value"],
//         ["Total Distance (km)", data.report.travel.totalDistanceKm],
//         ["Average Distance per Day (km)", avgDistance],
//         ["Distinct Locations Visited", data.report.activity.distinctLocationsVisited],
//       ];

//       // Complete Summary Sheet
//       const summaryData = [
//         ["COMPLETE EMPLOYEE ACTIVITY REPORT"],
//         [""],
//         ["Report Generated", new Date().toLocaleString()],
//         [""],
//         ["EMPLOYEE DETAILS"],
//         ["Name", data.employee.name],
//         ["Father's Name", data.employee.fatherName],
//         ["Role", data.employee.role],
//         ["Department", data.employee.department],
//         ["Date of Joining", data.employee.dateOfJoining],
//         ["ID Card Number", data.employee.idCardNumber],
//         ["Location", data.employee.location],
//         ["PAN Card", data.employee.panCard],
//         ["Bank Account Number", data.employee.bankAccountNumber],
//         ["Address Proof", data.employee.addressProof],
//         ["Contact", empphone],
//         [""],
//         ["REPORT PERIOD"],
//         ["Start Date", new Date(data.meta.range.start).toLocaleDateString()],
//         ["End Date", new Date(data.meta.range.end).toLocaleDateString()],
//         ["Sundays Excluded", data.meta.sundayExcluded ? "Yes" : "No"],
//         [""],
//         ["ATTENDANCE METRICS"],
//         ["Total Days Present", data.report.attendance.presentDays],
//         ["On-Time Attendance", data.report.attendance.status.onTime],
//         ["Late Attendance", data.report.attendance.status.late],
//         ["Late Attendance Rate", `${lateRate}%`],
//         ["Punctuality Score", `${punctualityScore}%`],
//         [""],
//         ["TRAVEL METRICS"],
//         ["Total Distance Traveled", `${data.report.travel.totalDistanceKm} km`],
//         ["Average Distance per Day", `${avgDistance} km`],
//         [""],
//         ["ACTIVITY METRICS"],
//         ["Distinct Locations Visited", data.report.activity.distinctLocationsVisited],
//       ];

//       // Create sheets
//       const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
//       const ws2 = XLSX.utils.aoa_to_sheet(employeeData);
//       const ws3 = XLSX.utils.aoa_to_sheet(attendanceData);
//       const ws4 = XLSX.utils.aoa_to_sheet(travelData);

//       // Set column widths
//       const wscols = [{ wch: 30 }, { wch: 30 }];
//       ws1["!cols"] = wscols;
//       ws2["!cols"] = wscols;
//       ws3["!cols"] = wscols;
//       ws4["!cols"] = wscols;

//       // Add sheets to workbook
//       XLSX.utils.book_append_sheet(wb, ws1, "Complete Summary");
//       XLSX.utils.book_append_sheet(wb, ws2, "Employee Info");
//       XLSX.utils.book_append_sheet(wb, ws3, "Attendance");
//       XLSX.utils.book_append_sheet(wb, ws4, "Travel & Activity");

//       // Generate filename
//       const filename = `${data.employee.name.replace(/\s+/g, "_")}_Report_${data.meta.range.start}_to_${data.meta.range.end}.xlsx`;

//       // Download
//       XLSX.writeFile(wb, filename);
//     } catch (error) {
//       console.error("Excel export failed:", error);
//       alert("Failed to export Excel. Please try again.");
//     } finally {
//       setExporting(false);
//     }
//   };

//   return (
//     <>
//       <NavBar />
//       <div className="min-h-screen bg-slate-50/50 pb-12 pt-20">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           {/* Top Navigation */}
//           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//             <Link href={`/admin`}>
//               <Button
//                 variant="ghost"
//                 className="hover:bg-white shadow-sm ring-1 ring-slate-200"
//               >
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 Back to Tracking
//               </Button>
//             </Link>

//             {/* Filter Panel */}
//             <div className="bg-white p-3 rounded-xl shadow-sm ring-1 ring-slate-200">
//               <div className="flex items-center gap-2 mb-3">
//                 <Filter className="w-4 h-4 text-slate-400" />
//                 <span className="text-sm font-medium text-slate-600">
//                   Report Period:
//                 </span>
//               </div>

//               {/* Filter Mode Buttons */}
//               <div className="flex gap-2 mb-3">
//                 <button
//                   onClick={() => setFilterMode("current")}
//                   className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
//                     filterMode === "current"
//                       ? "bg-slate-900 text-white"
//                       : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                   }`}
//                 >
//                   Current Month
//                 </button>
//                 <button
//                   onClick={() => setFilterMode("single")}
//                   className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
//                     filterMode === "single"
//                       ? "bg-slate-900 text-white"
//                       : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                   }`}
//                 >
//                   Select Month
//                 </button>
//                 <button
//                   onClick={() => setFilterMode("range")}
//                   className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
//                     filterMode === "range"
//                       ? "bg-slate-900 text-white"
//                       : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                   }`}
//                 >
//                   Date Range
//                 </button>
//               </div>

//               {/* Filter Inputs */}
//               {filterMode === "single" && (
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="month"
//                     value={singleMonth}
//                     onChange={(e) => setSingleMonth(e.target.value)}
//                     className="text-sm px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
//                   />
//                   {/* <Button
//                     onClick={handleFilterUpdate}
//                     size="sm"
//                     className="bg-slate-900 text-white"
//                   >
//                     Apply
//                   </Button> */}
//                 </div>
//               )}

//               {filterMode === "range" && (
//                 <div className="flex flex-wrap items-center gap-2">
//                   <input
//                     type="month"
//                     value={startMonth}
//                     onChange={(e) => setStartMonth(e.target.value)}
//                     className="text-sm px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
//                   />
//                   <span className="text-slate-300">to</span>
//                   <input
//                     type="month"
//                     value={endMonth}
//                     onChange={(e) => setEndMonth(e.target.value)}
//                     className="text-sm px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
//                   />
//                   {/* <Button
//                     onClick={handleFilterUpdate}
//                     size="sm"
//                     className="bg-slate-900 text-white"
//                   >
//                     Apply
//                   </Button> */}
//                 </div>
//               )}

//               {filterMode === "current" && (
//                 <p className="text-xs text-slate-500">
//                   Showing data for current month
//                 </p>
//               )}
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex h-64 items-center justify-center">
//               <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//             </div>
//           ) : error ? (
//             <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
//               <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//               <p className="text-red-800 font-medium">{error}</p>
//             </div>
//           ) : (
//             data && (
//               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                 {/* Employee Details Card */}
//                 <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white mb-6">
//                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//                     <div className="flex items-center gap-4">
//                       <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
//                         <User className="w-8 h-8" />
//                       </div>
//                       <div>
//                         <h1 className="text-2xl font-bold mb-1">
//                           {data.employee.name}
//                         </h1>
//                         <p className="text-sm text-slate-400 uppercase tracking-widest">
//                           {data.employee.role}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div className="flex items-center gap-3">
//                       <WorkflowIcon className="w-4 h-4 text-slate-400" />
//                       <div>
//                         <p className="text-xs text-slate-400">Father Name</p>
//                         <p className="text-sm font-medium">
//                           {data.employee.fatherName}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <Briefcase className="w-4 h-4 text-slate-400" />
//                       <div>
//                         <p className="text-xs text-slate-400">Department</p>
//                         <p className="text-sm font-medium">
//                           {data.employee.department}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <IdCardIcon className="w-4 h-4 text-slate-400" />
//                       <div>
//                         <p className="text-xs text-slate-400">idCard Number</p>
//                         <p className="text-sm font-medium">
//                           {data.employee.idCardNumber}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <MapIcon className="w-4 h-4 text-slate-400" />
//                       <div>
//                         <p className="text-xs text-slate-400">Location</p>
//                         <p className="text-sm font-medium">
//                           {data.employee.location}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <AreaChartIcon className="w-4 h-4 text-slate-400" />
//                       <div>
//                         <p className="text-xs text-slate-400">Address Proof</p>
//                         <p className="text-sm font-medium">
//                           {data.employee.addressProof}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <DatabaseIcon className="w-4 h-4 text-slate-400" />
//                       <div>
//                         <p className="text-xs text-slate-400">Date of Joining</p>
//                         <p className="text-sm font-medium">
//                             {(() => {
//                                 const d = new Date(data.employee.dateOfJoining);
//                                 const day = String(d.getDate()).padStart(2, "0");
//                                 const month = String(d.getMonth() + 1).padStart(2, "0");
//                                 const year = d.getFullYear();
//                                 return `${day}/${month}/${year}`;
//                             })()}
//                         </p>  </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <BackpackIcon className="w-4 h-4 text-slate-400" />
//                       <div>
//                         <p className="text-xs text-slate-400">Bank Account Number</p>
//                         <p className="text-sm font-medium">
//                           {data.employee.bankAccountNumber}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <Phone className="w-4 h-4 text-slate-400" />
//                       <div>
//                         <p className="text-xs text-slate-400">Contact</p>
//                         <p className="text-sm font-medium">{empphone}</p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                       <Calendar className="w-4 h-4 text-slate-400" />
//                       <div>
//                         <p className="text-xs text-slate-400">Report Period</p>
//                         <p className="text-sm font-medium">
//                           {(() => {
//                             const d = new Date(data.meta.range.start);
//                             const day = String(d.getDate()).padStart(2, "0");
//                             const month = String(d.getMonth() + 1).padStart(2, "0");
//                             const year = d.getFullYear();
//                             return `${day}-${month}-${year}`;
//                         })()}{" "}
//                           - {(() => {
//                             const d = new Date(data.meta.range.end);
//                             const day = String(d.getDate()).padStart(2, "0");
//                             const month = String(d.getMonth() + 1).padStart(2, "0");
//                             const year = d.getFullYear();
//                             return `${day}-${month}-${year}`;
//                         })()}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Header */}
//                 <div className="mb-6">
//                   <h2 className="text-2xl font-bold text-slate-900">
//                     Activity Report
//                   </h2>
//                   <p className="text-slate-500 mt-1">
//                     Comprehensive performance summary
//                   </p>
//                   <div className="flex flex-wrap justify-between items-center mt-4">
//                     <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 uppercase tracking-wider">
//                     <Calendar className="w-3 h-3" />
//                     Sundays Excluded
//                   </div>
//                      <Button
//                       onClick={handleExportExcel}
//                       disabled={exporting}
//                       className="bg-blue-500 text-white hover:bg-blue-600"
//                     >
//                       {exporting ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Exporting...
//                         </>
//                       ) : (
//                         <>
//                           <Download className="w-4 h-4 mr-2" />
//                           Export to Excel
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                   {/* Attendance */}
//                   <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
//                         <CheckCircle className="w-5 h-5" />
//                       </div>
//                       <span className="text-xs font-medium text-slate-400">
//                         Attendance
//                       </span>
//                     </div>
//                     <div className="text-3xl font-bold text-slate-900">
//                       {data.report.attendance.presentDays}
//                     </div>
//                     <p className="text-sm text-slate-500">Days Present</p>
//                     <div className="mt-4 flex gap-2">
//                       <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-md font-bold">
//                         {data.report.attendance.status.onTime} ON-TIME
//                       </span>
//                       <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 rounded-md font-bold">
//                         {data.report.attendance.status.late} LATE
//                       </span>
//                     </div>
//                   </div>

//                   {/* Travel */}
//                   <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
//                         <Route className="w-5 h-5" />
//                       </div>
//                       <span className="text-xs font-medium text-slate-400">
//                         Travel
//                       </span>
//                     </div>
//                     <div className="text-3xl font-bold text-slate-900">
//                       {data.report.travel.totalDistanceKm}
//                     </div>
//                     <p className="text-sm text-slate-500">Total Kilometers</p>
//                     <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-purple-500"
//                         style={{ width: "70%" }}
//                       ></div>
//                     </div>
//                   </div>

//                   {/* Locations */}
//                   <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
//                         <MapPin className="w-5 h-5" />
//                       </div>
//                       <span className="text-xs font-medium text-slate-400">
//                         Activity
//                       </span>
//                     </div>
//                     <div className="text-3xl font-bold text-slate-900">
//                       {data.report.activity.distinctLocationsVisited}
//                     </div>
//                     <p className="text-sm text-slate-500">Distinct Locations</p>
//                   </div>
//                 </div>

//                 {/* Detailed Summary */}
//                 <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
//                   <div className="px-6 py-4 border-b border-slate-100">
//                     <h3 className="font-bold text-slate-900">
//                       Detailed Summary
//                     </h3>
//                   </div>
//                   <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
//                     <div className="space-y-4">
//                       <div className="flex justify-between items-center py-2 border-b border-slate-200">
//                         <span className="text-sm text-slate-500">
//                           Report Start Date
//                         </span>
//                         <span className="text-sm font-semibold">
//                         {(() => {
//                             const d = new Date(data.meta.range.start);
//                             const day = String(d.getDate()).padStart(2, "0");
//                             const month = String(d.getMonth() + 1).padStart(2, "0");
//                             const year = d.getFullYear();
//                             return `${day}-${month}-${year}`;
//                         })()}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center py-2 border-b border-slate-200">
//                         <span className="text-sm text-slate-500">
//                           Report End Date
//                         </span>
//                         <span className="text-sm font-semibold">
//                          {(() => {
//                             const d = new Date(data.meta.range.end);
//                             const day = String(d.getDate()).padStart(2, "0");
//                             const month = String(d.getMonth() + 1).padStart(2, "0");
//                             const year = d.getFullYear();
//                             return `${day}-${month}-${year}`;
//                         })()}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center py-2 border-b border-slate-200">
//                         <span className="text-sm text-slate-500">
//                           Punctuality Score
//                         </span>
//                         <span className="text-sm font-semibold text-green-600">
//                           {data.report.attendance.presentDays > 0
//                             ? (
//                                 (data.report.attendance.status.onTime /
//                                   data.report.attendance.presentDays) *
//                                 100
//                               ).toFixed(1)
//                             : 0}
//                           %
//                         </span>
//                       </div>
//                     </div>
//                     <div className="space-y-4">
//                       <div className="flex justify-between items-center py-2 border-b border-slate-200">
//                         <span className="text-sm text-slate-500">
//                           Late Attendance Rate
//                         </span>
//                         <span className="text-sm font-semibold text-red-600">
//                           {data.report.attendance.presentDays > 0
//                             ? (
//                                 (data.report.attendance.status.late /
//                                   data.report.attendance.presentDays) *
//                                 100
//                               ).toFixed(1)
//                             : 0}
//                           %
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center py-2 border-b border-slate-200">
//                         <span className="text-sm text-slate-500">
//                           Avg. Distance / Day
//                         </span>
//                         <span className="text-sm font-semibold text-blue-600">
//                           {data.report.attendance.presentDays > 0
//                             ? (
//                                 data.report.travel.totalDistanceKm /
//                                 data.report.attendance.presentDays
//                               ).toFixed(2)
//                             : 0}{" "}
//                           km
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-center py-2 border-b border-slate-200">
//                         <span className="text-sm text-slate-500">
//                           Days Present
//                         </span>
//                         <span className="text-sm font-semibold text-slate-900">
//                           {data.report.attendance.presentDays} days
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default EmployeeReportPage;

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  Phone,
  MapPin,
  Route,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Download,
  Filter,
  DatabaseIcon,
  PlaneIcon,
  MapIcon,
  AreaChartIcon,
  IdCard,
  IdCardIcon,
  PersonStandingIcon,
  WorkflowIcon,
  PiggyBankIcon,
  BackpackIcon,
  CalendarOff,
  Coffee,
  XCircle,
  CalendarX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/Navbar";
import * as XLSX from "xlsx";

// --- Types ---
type LeaveRequest = {
  _id: string;
  leaveFrom: string;
  leaveTo: string;
  numberOfDays: number;
  halfDaySlot: string | null; // "Morning" | "Afternoon" | null
  status: string;
};

type ReportData = {
  success: boolean;
  meta: {
    range: { start: string; end: string };
    sundayExcluded: boolean;
  };
  employee: {
    name: string;
    fatherName: string;
    role: string;
    department: string;
    location: string;
    panCard: string;
    addressProof: string;
    idCardNumber: string;
    dateOfJoining: string;
    bankAccountNumber: string;
  };
  report: {
    attendance: {
      presentDays: number;
      status: { onTime: number; late: number };
    };
    travel: { totalDistanceKm: number };
    activity: { distinctLocationsVisited: number };
  };
};

type FilterMode = "current" | "single" | "range";

const EmployeeReportPage = ({ params }: { params: { empphone: string } }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const empphone = params.empphone;

  // State for filters
  const [filterMode, setFilterMode] = useState<FilterMode>("current");
  const [startMonth, setStartMonth] = useState(
    searchParams.get("startMonth") || new Date().toISOString().slice(0, 7),
  );
  const [endMonth, setEndMonth] = useState(
    searchParams.get("endMonth") || new Date().toISOString().slice(0, 7),
  );
  const [singleMonth, setSingleMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const [data, setData] = useState<ReportData | null>(null);

  // --- New State for Leaves and Absences ---
  const [leaveStats, setLeaveStats] = useState({
    totalFormalLeaveDays: 0,
    totalHalfDays: 0,
    absencesWithoutLeave: 0,
  });
  const [totalWorkingDays, setTotalWorkingDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // --- Helper: Get Date Range Objects based on current filter ---
  const getFilterDateRange = useCallback(() => {
    let startStr = startMonth;
    let endStr = endMonth;

    if (filterMode === "current") {
      const currentMonth = new Date().toISOString().slice(0, 7);
      startStr = currentMonth;
      endStr = currentMonth;
    } else if (filterMode === "single") {
      startStr = singleMonth;
      endStr = singleMonth;
    }

    // Construct Date objects
    // Start: 1st day of start month
    const startDate = new Date(`${startStr}-01`);
    // End: Last day of end month
    const endDate = new Date(
      new Date(`${endStr}-01`).getFullYear(),
      new Date(`${endStr}-01`).getMonth() + 1,
      0,
    );

    // Reset hours for accurate comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate, startStr, endStr };
  }, [startMonth, endMonth, singleMonth, filterMode]);

  // --- Fetch Activity Report ---
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startStr, endStr } = getFilterDateRange();

      const res = await fetch(
        `/api/reports/employee-activity?phone=${empphone}&startMonth=${startStr}&endMonth=${endStr}`,
      );
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to fetch report");
      setData(result);
    } catch (err: any) {
      setError(err.message);
    }
  }, [empphone, getFilterDateRange]);

  // --- Helper: Count weekdays excluding Sundays ---
  const countWeekdaysExcludingSundays = (startDate: Date, endDate: Date) => {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // 0 = Sunday, 1-6 = Monday-Saturday
      if (dayOfWeek !== 0) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  // --- Fetch and Calculate Leave Data + Absences ---
  const fetchLeaveDataAndAbsences = useCallback(async () => {
    try {
      // 1. Fetch all notifications for this user
      const res = await fetch("/api/notification/getnotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNo: empphone }),
      });

      const result = await res.json();

      const { startDate, endDate } = getFilterDateRange();

      console.log("=== LEAVE CALCULATION DEBUG ===");
      console.log("Report Period:", {
        start: startDate.toLocaleDateString(),
        end: endDate.toLocaleDateString(),
      });

      let totalFormalLeaveDays = 0;
      let totalHalfDays = 0;

      // If we have leave data, count only approved leaves
      if (res.ok && result.data) {
        const allLeaves: LeaveRequest[] = result.data;
        console.log("Total leave requests received:", allLeaves.length);

        const approvedLeaves = allLeaves.filter((l) => l.status === "Approved");
        console.log("Approved leave requests:", approvedLeaves.length);

        // 2. Filter and count approved leaves that overlap with report period
        allLeaves.forEach((leave, index) => {
          // Only count Approved leaves
          if (leave.status !== "Approved") return;

          const leaveStart = new Date(leave.leaveFrom);
          const leaveEnd = new Date(leave.leaveTo);
          leaveStart.setHours(0, 0, 0, 0);
          leaveEnd.setHours(23, 59, 59, 999);

          // Check for Date Overlap
          const isOverlapping = leaveStart <= endDate && leaveEnd >= startDate;

          console.log(`Leave ${index + 1}:`, {
            from: leaveStart.toLocaleDateString(),
            to: leaveEnd.toLocaleDateString(),
            halfDaySlot: leave.halfDaySlot,
            isOverlapping,
          });

          if (isOverlapping) {
            // Check if it's a half-day leave
            if (leave.halfDaySlot && leave.halfDaySlot.trim() !== "") {
              totalHalfDays += 1;
              console.log(`  → Half-day leave (Total half days: ${totalHalfDays})`);
            } else {
              // Full day leave - need to calculate actual days within the report range
              const actualStart = leaveStart > startDate ? leaveStart : startDate;
              const actualEnd = leaveEnd < endDate ? leaveEnd : endDate;

              // Count weekdays (excluding Sundays) in the overlap period
              let current = new Date(actualStart);
              let leaveDaysInRange = 0;

              while (current <= actualEnd) {
                if (current.getDay() !== 0) { // Exclude Sundays
                  leaveDaysInRange++;
                }
                current.setDate(current.getDate() + 1);
              }

              totalFormalLeaveDays += leaveDaysInRange;
              console.log(
                `  → Full-day leave: ${leaveDaysInRange} days (Total formal: ${totalFormalLeaveDays})`
              );
            }
          }
        });
      }

      // 3. Calculate absences without leave
      let absencesWithoutLeave = 0;

      if (data) {
        const totalWorkingDays = countWeekdaysExcludingSundays(
          startDate,
          endDate,
        );

        // Store total working days in state
        setTotalWorkingDays(totalWorkingDays);

        const presentDays = data.report.attendance.presentDays;

        // Convert half days to full day equivalent (1 half day = 1 full day)
        const halfDaysAsFullDays = totalHalfDays * 1;

        // Absences = Total Working Days - Present Days - Approved Formal Leaves - Half Day Equivalent
        absencesWithoutLeave = Math.max(
          0,
          totalWorkingDays -
          presentDays -
          totalFormalLeaveDays -
          halfDaysAsFullDays,
        );

        // Round to 1 decimal place
        absencesWithoutLeave = Math.round(absencesWithoutLeave * 10) / 10;

        console.log("=== FINAL CALCULATION ===");
        console.log("Total Working Days (excl. Sundays):", totalWorkingDays);
        console.log("Days Present:", presentDays);
        console.log("Formal Leave Days:", totalFormalLeaveDays);
        console.log("Half Day Leaves:", totalHalfDays, `(${halfDaysAsFullDays} days)`);
        console.log(
          "Calculation:",
          `${totalWorkingDays} - ${presentDays} - ${totalFormalLeaveDays} - ${halfDaysAsFullDays} = ${absencesWithoutLeave}`
        );
        console.log("Absences Without Leave:", absencesWithoutLeave);
        console.log("===========================");
      }

      setLeaveStats({
        totalFormalLeaveDays,
        totalHalfDays,
        absencesWithoutLeave,
      });
    } catch (err) {
      console.error("Failed to fetch leave stats:", err);
      // Don't block the main report if leaves fail
      if (data) {
        const { startDate, endDate } = getFilterDateRange();
        const totalWorkingDays = countWeekdaysExcludingSundays(
          startDate,
          endDate,
        );
        const presentDays = data.report.attendance.presentDays;
        const absences = Math.max(0, totalWorkingDays - presentDays);

        setLeaveStats({
          totalFormalLeaveDays: 0,
          totalHalfDays: 0,
          absencesWithoutLeave: absences,
        });
      } else {
        setLeaveStats({
          totalFormalLeaveDays: 0,
          totalHalfDays: 0,
          absencesWithoutLeave: 0,
        });
      }
    }
  }, [empphone, getFilterDateRange, data]);

  // --- Master Effect ---
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await fetchReport();
      setLoading(false);
    };
    loadAllData();
  }, [fetchReport]);

  // Fetch leave data after main data is loaded
  useEffect(() => {
    if (data) {
      fetchLeaveDataAndAbsences();
    }
  }, [data, fetchLeaveDataAndAbsences]);

  const handleFilterUpdate = () => {
    if (filterMode === "current") {
      const currentMonth = new Date().toISOString().slice(0, 7);
      router.push(`?startMonth=${currentMonth}&endMonth=${currentMonth}`);
    } else if (filterMode === "single") {
      router.push(`?startMonth=${singleMonth}&endMonth=${singleMonth}`);
    } else {
      router.push(`?startMonth=${startMonth}&endMonth=${endMonth}`);
    }
  };

  const handleExportExcel = () => {
    if (!data) return;

    setExporting(true);
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Calculate metrics
      const lateRate =
        data.report.attendance.presentDays > 0
          ? (
            (data.report.attendance.status.late /
              data.report.attendance.presentDays) *
            100
          ).toFixed(1)
          : "0";

      const avgDistance =
        data.report.attendance.presentDays > 0
          ? (
            data.report.travel.totalDistanceKm /
            data.report.attendance.presentDays
          ).toFixed(2)
          : "0";

      const punctualityScore =
        data.report.attendance.presentDays > 0
          ? (
            (data.report.attendance.status.onTime /
              data.report.attendance.presentDays) *
            100
          ).toFixed(1)
          : "0";

      // Employee Information Sheet
      const employeeData = [
        ["EMPLOYEE ACTIVITY REPORT"],
        [""],
        ["Employee Information"],
        ["Name", data.employee.name],
        ["Role", data.employee.role],
        ["Father's Name", data.employee.fatherName],
        ["Department", data.employee.department],
        ["Phone", empphone],
        ["Location", data.employee.location],
        ["PAN Card", data.employee.panCard],
        ["Address Proof", data.employee.addressProof],
        ["ID Card Number", data.employee.idCardNumber],
        [
          "Date of Joining",
          new Date(data.employee.dateOfJoining).toLocaleDateString("en-GB"),
        ],
        ["Bank Account Number", data.employee.bankAccountNumber],
        [""],
        ["Report Period"],
        ["Start Date", new Date(data.meta.range.start).toLocaleDateString("en-GB")],
        ["End Date", new Date(data.meta.range.end).toLocaleDateString("en-GB")],
        ["Sundays Excluded", data.meta.sundayExcluded ? "Yes" : "No"],
      ];

      // Attendance Summary Sheet
      const attendanceData = [
        ["ATTENDANCE SUMMARY"],
        [""],
        ["Metric", "Value"],
        ["Total Days Present", data.report.attendance.presentDays],
        ["On-Time Days", data.report.attendance.status.onTime],
        ["Late Days", data.report.attendance.status.late],
        ["Late Attendance Rate (%)", lateRate],
        ["Punctuality Score (%)", punctualityScore],
      ];

      // Travel Summary Sheet
      const travelData = [
        ["TRAVEL SUMMARY"],
        [""],
        ["Metric", "Value"],
        ["Total Distance (km)", data.report.travel.totalDistanceKm],
        ["Average Distance per Day (km)", avgDistance],
        [
          "Distinct Locations Visited",
          data.report.activity.distinctLocationsVisited,
        ],
      ];

      // Leave and Absence Summary Sheet
      const leaveData = [
        ["LEAVE & ABSENCE SUMMARY"],
        [""],
        ["Metric", "Value"],
        ["Total Working Days (Sundays Excluded)", totalWorkingDays],
        ["Days Present", data.report.attendance.presentDays],
        ["Total Formal Leave Days (Approved)", leaveStats.totalFormalLeaveDays],
        ["Total Half Day Leaves (Approved)", leaveStats.totalHalfDays],
        ["Absences Without Leave Request", leaveStats.absencesWithoutLeave],
        [""],
        [
          "Calculation",
          `Absences = ${totalWorkingDays} (Working Days) - ${data.report.attendance.presentDays} (Present) - ${leaveStats.totalFormalLeaveDays} (Formal Leaves) - ${leaveStats.totalHalfDays * 1} (Half Days)`,
        ],
        [""],
        [
          "Note",
          "Formal leaves include only full-day approved leave requests. Half days are counted separately. Absences are days when employee was neither present nor on approved leave.",
        ],
      ];

      // Complete Summary Sheet
      const summaryData = [
        ["COMPLETE EMPLOYEE ACTIVITY REPORT"],
        [""],
        ["Report Generated", new Date().toLocaleString("en-GB")],
        [""],
        ["EMPLOYEE DETAILS"],
        ["Name", data.employee.name],
        ["Father's Name", data.employee.fatherName],
        ["Role", data.employee.role],
        ["Department", data.employee.department],
        [
          "Date of Joining",
          new Date(data.employee.dateOfJoining).toLocaleDateString("en-GB"),
        ],
        ["ID Card Number", data.employee.idCardNumber],
        ["Location", data.employee.location],
        ["PAN Card", data.employee.panCard],
        ["Bank Account Number", data.employee.bankAccountNumber],
        ["Address Proof", data.employee.addressProof],
        ["Contact", empphone],
        [""],
        ["REPORT PERIOD"],
        ["Start Date", new Date(data.meta.range.start).toLocaleDateString("en-GB")],
        ["End Date", new Date(data.meta.range.end).toLocaleDateString("en-GB")],
        ["Sundays Excluded", data.meta.sundayExcluded ? "Yes" : "No"],
        ["Total Working Days", totalWorkingDays],
        [""],
        ["ATTENDANCE METRICS"],
        ["Total Days Present", data.report.attendance.presentDays],
        ["On-Time Attendance", data.report.attendance.status.onTime],
        ["Late Attendance", data.report.attendance.status.late],
        ["Late Attendance Rate", `${lateRate}%`],
        ["Punctuality Score", `${punctualityScore}%`],
        [""],
        ["LEAVE & ABSENCE METRICS"],
        ["Formal Leave Days (Full Day)", leaveStats.totalFormalLeaveDays],
        ["Half Day Leaves", leaveStats.totalHalfDays],
        ["Absences Without Leave Request", leaveStats.absencesWithoutLeave],
        [""],
        ["TRAVEL METRICS"],
        [
          "Total Distance Traveled",
          `${data.report.travel.totalDistanceKm} km`,
        ],
        ["Average Distance per Day", `${avgDistance} km`],
        [""],
        ["ACTIVITY METRICS"],
        [
          "Distinct Locations Visited",
          data.report.activity.distinctLocationsVisited,
        ],
      ];

      // Create sheets
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      const ws2 = XLSX.utils.aoa_to_sheet(employeeData);
      const ws3 = XLSX.utils.aoa_to_sheet(attendanceData);
      const ws4 = XLSX.utils.aoa_to_sheet(travelData);
      const ws5 = XLSX.utils.aoa_to_sheet(leaveData);

      // Set column widths
      const wscols = [{ wch: 35 }, { wch: 35 }];
      ws1["!cols"] = wscols;
      ws2["!cols"] = wscols;
      ws3["!cols"] = wscols;
      ws4["!cols"] = wscols;
      ws5["!cols"] = wscols;

      // Add sheets to workbook
      XLSX.utils.book_append_sheet(wb, ws1, "Complete Summary");
      XLSX.utils.book_append_sheet(wb, ws2, "Employee Info");
      XLSX.utils.book_append_sheet(wb, ws3, "Attendance");
      XLSX.utils.book_append_sheet(wb, ws4, "Travel & Activity");
      XLSX.utils.book_append_sheet(wb, ws5, "Leaves & Absences");

      // Generate filename with proper date format
      const startDateFormatted = new Date(data.meta.range.start)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");
      const endDateFormatted = new Date(data.meta.range.end)
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

      const filename = `${data.employee.name.replace(/\s+/g, "_")}_Report_${startDateFormatted}_to_${endDateFormatted}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Excel export failed:", error);
      alert("Failed to export Excel. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-slate-50/50 pb-12 pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <Link href={`/admin`}>
              <Button
                variant="ghost"
                className="hover:bg-white shadow-sm ring-1 ring-slate-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tracking
              </Button>
            </Link>

            {/* Filter Panel */}
            <div className="bg-white p-3 rounded-xl shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  Report Period:
                </span>
              </div>

              {/* Filter Mode Buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setFilterMode("current")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterMode === "current"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  Current Month
                </button>
                <button
                  onClick={() => setFilterMode("single")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterMode === "single"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  Select Month
                </button>
                <button
                  onClick={() => setFilterMode("range")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterMode === "range"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  Date Range
                </button>
              </div>

              {/* Filter Inputs */}
              {filterMode === "single" && (
                <div className="flex items-center gap-2">
                  <input
                    type="month"
                    value={singleMonth}
                    onChange={(e) => setSingleMonth(e.target.value)}
                    className="text-sm px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              )}

              {filterMode === "range" && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="month"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="text-sm px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                  <span className="text-slate-300">to</span>
                  <input
                    type="month"
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="text-sm px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              )}

              {filterMode === "current" && (
                <p className="text-xs text-slate-500">
                  Showing data for current month
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          ) : (
            data && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Employee Details Card */}
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold mb-1">
                          {data.employee.name}
                        </h1>
                        <p className="text-sm text-slate-400 uppercase tracking-widest">
                          {data.employee.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <WorkflowIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Father Name</p>
                        <p className="text-sm font-medium">
                          {data.employee.fatherName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Department</p>
                        <p className="text-sm font-medium">
                          {data.employee.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <IdCardIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">ID Card Number</p>
                        <p className="text-sm font-medium">
                          {data.employee.idCardNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Location</p>
                        <p className="text-sm font-medium">
                          {data.employee.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AreaChartIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Address Proof</p>
                        <p className="text-sm font-medium">
                          {data.employee.addressProof}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DatabaseIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">
                          Date of Joining
                        </p>
                        <p className="text-sm font-medium">
                          {(() => {
                            const d = new Date(data.employee.dateOfJoining);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(
                              2,
                              "0",
                            );
                            const year = d.getFullYear();
                            return `${day}/${month}/${year}`;
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BackpackIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">
                          Bank Account Number
                        </p>
                        <p className="text-sm font-medium">
                          {data.employee.bankAccountNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Contact</p>
                        <p className="text-sm font-medium">{empphone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Report Period</p>
                        <p className="text-sm font-medium">
                          {(() => {
                            const d = new Date(data.meta.range.start);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(
                              2,
                              "0",
                            );
                            const year = d.getFullYear();
                            return `${day}-${month}-${year}`;
                          })()}{" "}
                          -{" "}
                          {(() => {
                            const d = new Date(data.meta.range.end);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(
                              2,
                              "0",
                            );
                            const year = d.getFullYear();
                            return `${day}-${month}-${year}`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Activity Report
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Comprehensive performance summary
                  </p>
                  <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        Sundays Excluded
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        Total Working Days: {totalWorkingDays}
                      </div>
                    </div>
                    <Button
                      onClick={handleExportExcel}
                      disabled={exporting}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                      {exporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export to Excel
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Stats Grid - 5 Cards Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  {/* Attendance */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        Attendance
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {data.report.attendance.presentDays}
                    </div>
                    <p className="text-sm text-slate-500">Days Present</p>
                    <div className="mt-4 flex gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-md font-bold">
                        {data.report.attendance.status.onTime} ON-TIME
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-700 rounded-md font-bold">
                        {data.report.attendance.status.late} LATE
                      </span>
                    </div>
                  </div>

                  {/* Travel */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                        <Route className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        Travel
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {data.report.travel.totalDistanceKm}
                    </div>
                    <p className="text-sm text-slate-500">Total Kilometers</p>
                    <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Formal Leave (Full Days) */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <CalendarOff className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        Formal Leave
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {leaveStats.totalFormalLeaveDays}
                    </div>
                    <p className="text-sm text-slate-500">
                      Full Day Leaves (Approved)
                    </p>
                  </div>

                  {/* Half Day Leave */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        Half Day Leave
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {leaveStats.totalHalfDays}
                    </div>
                    <p className="text-sm text-slate-500">
                      Half Days (Approved)
                    </p>
                  </div>

                  {/* Absences Without Leave */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-red-50 rounded-lg text-red-600">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        Unauthorized
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {leaveStats.absencesWithoutLeave}
                    </div>
                    <p className="text-sm text-slate-500">
                      Absences Without Leave
                    </p>
                  </div>
                </div>

                {/* Second Row - Locations */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        Activity
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                      {data.report.activity.distinctLocationsVisited}
                    </div>
                    <p className="text-sm text-slate-500">Distinct Locations</p>
                  </div>
                </div>

                {/* Detailed Summary */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">
                      Detailed Summary
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Total Working Days
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {totalWorkingDays} Days
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Report Start Date
                        </span>
                        <span className="text-sm font-semibold">
                          {(() => {
                            const d = new Date(data.meta.range.start);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(
                              2,
                              "0",
                            );
                            const year = d.getFullYear();
                            return `${day}-${month}-${year}`;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Report End Date
                        </span>
                        <span className="text-sm font-semibold">
                          {(() => {
                            const d = new Date(data.meta.range.end);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(
                              2,
                              "0",
                            );
                            const year = d.getFullYear();
                            return `${day}-${month}-${year}`;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Punctuality Score
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {data.report.attendance.presentDays > 0
                            ? (
                              (data.report.attendance.status.onTime /
                                data.report.attendance.presentDays) *
                              100
                            ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Formal Leaves (Full Day)
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {leaveStats.totalFormalLeaveDays} Days
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Half Day Leaves
                        </span>
                        <span className="text-sm font-semibold text-orange-600">
                          {leaveStats.totalHalfDays} Half Days
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Late Attendance Rate
                        </span>
                        <span className="text-sm font-semibold text-red-600">
                          {data.report.attendance.presentDays > 0
                            ? (
                              (data.report.attendance.status.late /
                                data.report.attendance.presentDays) *
                              100
                            ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Avg. Distance / Day
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {data.report.attendance.presentDays > 0
                            ? (
                              data.report.travel.totalDistanceKm /
                              data.report.attendance.presentDays
                            ).toFixed(2)
                            : 0}{" "}
                          km
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Days Present
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {data.report.attendance.presentDays} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-500">
                          Absences Without Leave
                        </span>
                        <span className="text-sm font-semibold text-red-600">
                          {leaveStats.absencesWithoutLeave} Days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeReportPage;
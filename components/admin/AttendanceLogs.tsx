import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Phone, Calendar, CheckCircle, AlertCircle } from "lucide-react";

type AttendanceRow = {
  phone: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
};

interface AttendanceLogsProps {
  attRows: AttendanceRow[];
  downloadCSV: () => void;
}

export default function AttendanceLogs({ attRows, downloadCSV }: AttendanceLogsProps) {
  console.log(attRows);

  return (
    <Card className="shadow-lg border-0 overflow-hidden w-full">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-2xl font-semibold">Attendance Logs</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{attRows.length} records</p>
            </div>
          </div>
          <Button
            onClick={downloadCSV}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md w-full sm:w-auto text-sm sm:text-base"
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
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <Phone className="inline w-4 h-4 mr-1" /> Phone
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <Calendar className="inline w-4 h-4 mr-1" /> Date
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Check-in
                </th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Check-out
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attRows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-4 py-2 text-gray-700 whitespace-nowrap">{row.phone}</td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700 whitespace-nowrap">{row.date}</td>
                  <td className="px-3 sm:px-4 py-2">
                    {row.status === "On-time" ? (
                      <span className="flex items-center text-green-600 whitespace-nowrap">
                        <CheckCircle className="w-4 h-4 mr-1" /> {row.status}
                      </span>
                    ) : row.status.includes("Late") ? (
                      <span className="flex items-center text-orange-600 whitespace-nowrap">
                        <AlertCircle className="w-4 h-4 mr-1" /> {row.status}
                      </span>
                    ) : (
                      <span className="text-gray-400 whitespace-nowrap">{row.status}</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700 whitespace-nowrap">{row.checkIn || "—"}</td>
                  <td className="px-3 sm:px-4 py-2 text-gray-700 whitespace-nowrap">{row.checkOut || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

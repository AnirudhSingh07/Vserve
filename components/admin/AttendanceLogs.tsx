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
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Attendance Logs</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {attRows.length} records
              </p>
            </div>
          </div>
          <Button
            onClick={downloadCSV}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV Report
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Phone className="inline w-4 h-4 mr-1" /> Phone
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Calendar className="inline w-4 h-4 mr-1" /> Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-in
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-out
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attRows.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm text-gray-700">{row.phone}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{row.date}</td>
                <td className="px-4 py-2 text-sm">
                  {row.status === "On-time" ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" /> {row.status}
                    </span>
                  ) : row.status.includes("Late") ? (
                    <span className="flex items-center text-orange-600">
                      <AlertCircle className="w-4 h-4 mr-1" /> {row.status}
                    </span>
                  ) : (
                    <span className="text-gray-400">{row.status}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">{row.checkIn || "—"}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{row.checkOut || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

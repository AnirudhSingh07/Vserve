import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import LateRequestRow from "../admin/LateRequestRow";

export default function LateRequests({ lateReqs, pendingLateReqs, updateLate }: any) {
  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Late Requests</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {pendingLateReqs.length} pending • {lateReqs.length} total
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {lateReqs.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No late requests</p>
            <p className="text-gray-400 text-sm">
              All employees are on time!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lateReqs.map((r : any) => (
              <LateRequestRow key={r.id} req={r} onResolve={updateLate} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

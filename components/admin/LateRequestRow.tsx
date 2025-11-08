"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Phone,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export type LateReq = {
  id: string;
  phone: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  remarks?: string;
  createdAt?: number;
};

export default function LateRequestRow({
  req,
  onResolve,
}: {
  req: LateReq;
  onResolve: (id: string, status: "approved" | "rejected", remarks: string) => void;
}) {
  const [remarks, setRemarks] = useState(req.remarks || "");
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="grid md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Phone
            </div>
          </div>
          <div className="text-sm font-medium text-gray-900">{req.phone}</div>
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Date
            </div>
          </div>
          <div className="text-sm font-medium text-gray-900">{req.date}</div>
        </div>

        <div className="md:col-span-3">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Reason
          </div>
          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
            {req.reason}
          </div>
        </div>

        <div className="md:col-span-5 space-y-3">
          <div>
            <Label
              htmlFor={`remarks-${req.id}`}
              className="text-xs font-semibold text-gray-500 uppercase mb-2 block"
            >
              Admin Remarks
            </Label>
            <Textarea
              id={`remarks-${req.id}`}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add your remarks here..."
              className="min-h-[60px] resize-none"
              disabled={req.status !== "pending"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => onResolve(req.id, "approved", remarks)}
              disabled={req.status !== "pending"}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onResolve(req.id, "rejected", remarks)}
              disabled={req.status !== "pending"}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <div className="ml-auto">
              {req.status === "pending" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  PENDING
                </span>
              ) : req.status === "approved" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  APPROVED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  <XCircle className="w-3.5 h-3.5" />
                  REJECTED
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

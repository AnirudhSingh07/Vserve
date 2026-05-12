import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import LeaveRequest from "@/models/leaverequest";

import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { requestId, employeeId, action, remark } = await req.json();

    console.log("leavestatus POST received:", { requestId, employeeId, action, remark });

    if (!requestId || !action) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(requestId);
    } catch (e) {
      return NextResponse.json({ error: "Invalid Request ID format" }, { status: 400 });
    }

    // Build the update object — always include status, optionally include adminRemark
    const buildUpdate = (status: string) => {
      const update: Record<string, string> = { status };
      if (remark && remark.trim()) {
        update.adminRemark = remark.trim();
      }
      return update;
    };

    if (action === "accept") {
      // 1. Update the status to 'Approved' (with optional remark)
      const updatedRequest = await LeaveRequest.findByIdAndUpdate(
        objectId,
        buildUpdate("Approved"),
        { new: true, runValidators: false }
      );

      console.log("updatedRequest result:", updatedRequest);

      if (!updatedRequest) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        message: "Leave Approved",
        data: updatedRequest,
      });
    } else if (action === "reject") {
      // 2. Update status to 'Rejected' (with optional remark)
      const rejectedRequest = await LeaveRequest.findByIdAndUpdate(
        objectId,
        buildUpdate("Rejected"),
        { new: true, runValidators: false }
      );

      console.log("rejectedRequest result:", rejectedRequest);

      if (!rejectedRequest) {
        return NextResponse.json(
          { error: "Request already deleted or not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        message: "Leave request rejected",
        data: rejectedRequest,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Leave status update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

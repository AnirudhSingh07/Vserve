import { NextResponse } from "next/server";
import mongoose from "mongoose";
import LeaveRequest from "@/models/leaverequest"; // Adjust path

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const { requestId, employeeId, action } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    if (action === "accept") {
      // 1. Update the status to 'Approved'
      // We search specifically by requestId for precision
      const updatedRequest = await LeaveRequest.findOneAndUpdate(
        { _id: requestId, employeeId: employeeId },
        { status: "Approved" },
        { new: true },
      );

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
      // 2. Delete the record if rejected
      const deletedRequest = await LeaveRequest.findOneAndDelete({
        _id: requestId,
        employeeId: employeeId,
      });

      if (!deletedRequest) {
        return NextResponse.json(
          { error: "Request already deleted or not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        message: "Leave request rejected and removed",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

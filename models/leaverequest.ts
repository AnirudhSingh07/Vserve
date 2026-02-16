import mongoose, { Schema, models, model } from "mongoose";

const LeaveRequestSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee", // References your existing Employee model
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    leaveFrom: {
      type: Date,
      required: true,
    },
    leaveTo: {
      type: Date,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    halfDaySlot: {
      type: String,
      enum: ["Morning", "Afternoon"],
      required: false,
      default: null, // Only applicable if numberOfDays is 0.5
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // You can add a status field to track approval (Pending, Approved, Rejected)
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true, // This automatically manages 'createdAt' and 'updatedAt'
  },
);

// CRITICAL: Delete the existing model from cache if it exists (Fix for Next.js)
if (mongoose.models.LeaveRequest) {
  delete mongoose.models.LeaveRequest;
}

// Prevent overwriting the model if it already exists (Next.js hot reload fix)
const LeaveRequest =
  models.LeaveRequest || model("LeaveRequest", LeaveRequestSchema);

export default LeaveRequest;

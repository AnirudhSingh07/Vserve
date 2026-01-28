import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Define the Interface
export interface IDailyDistance extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  totalKm: number;
}

// models/DailyDistance.ts
const DailyDistanceSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: String, required: true }, // Format: "2024-05-20"
  totalKm: { type: Number, default: 0 }
});
// This ensures we only have one entry per employee per day
DailyDistanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const DailyDistance: Model<Document> =
  mongoose.models.DailyDistance ||
  mongoose.model("DailyDistance", DailyDistanceSchema);

export default DailyDistance;
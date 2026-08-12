import mongoose, { Schema, models } from "mongoose";

const AttendanceSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  checkInTime: Number,
  checkInLocation: {
    lat: Number,
    lng: Number,
  },
  checkOutTime: Number,
  checkOutLocation: {
    lat: Number,
    lng: Number,
  },
  work_mode: { type: String, enum: ["Office", "Field", "—"], default: "—" },
  first_visit: {
    lat: Number,
    lng: Number,
    time: String,
  },
  last_visit: {
    lat: Number,
    lng: Number,
    time: String,
  },
  km: { type: Number, default: 0 },
  locations_cover: { type: Number, default: 0 },
}, { timestamps: true });

const Attendance =
  models.Attendance || mongoose.model("Attendance", AttendanceSchema);

export default Attendance;

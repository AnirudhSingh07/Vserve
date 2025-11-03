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
});

const Attendance =
  models.Attendance || mongoose.model("Attendance", AttendanceSchema);

export default Attendance;

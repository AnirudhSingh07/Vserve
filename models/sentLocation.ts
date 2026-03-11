import mongoose, { Schema, models } from "mongoose";

const SentLocationSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  hashalt: { type: Boolean, required: true, default: false },
  coords: {
    lat: Number,
    lng: Number,
  },
});

const SentLocation =
  models.SentLocation || mongoose.model("SentLocation", SentLocationSchema);

export default SentLocation;

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

// Per-employee day lookups (sentloc GET) and the 60 s duplicate check (sentloc POST)
SentLocationSchema.index({ employeeId: 1, date: 1 });

const SentLocation =
  models.SentLocation || mongoose.model("SentLocation", SentLocationSchema);

export default SentLocation;

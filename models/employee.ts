import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { setOptions } from "leaflet";
import { Phone } from "lucide-react";
import mongoose, { Schema, models } from "mongoose";

const EmployeeSchema = new Schema({
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  role: { type: String },
});

export default models.Employee || mongoose.model("Employee", EmployeeSchema);


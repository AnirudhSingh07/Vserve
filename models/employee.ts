import mongoose, { Schema, models } from "mongoose";

const EmployeeSchema = new Schema(
  {
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "employee" },
    panCard: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    addressProof: { type: String, required: true }, // can store file URL or base64
    idCardNumber: { type: String, required: true },
  },
  { timestamps: true }
);

const Employee = models.Employee || mongoose.model("Employee", EmployeeSchema);
export default Employee;

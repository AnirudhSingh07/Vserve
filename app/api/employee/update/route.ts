// app/api/employees/update/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Employee from "@/models/employee";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    await connectDB();

    // Parse the request body
    const bodyText = await req.text();
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { employeeId, ...updateFields } = data;

    // Validate employeeId
    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 },
      );
    }

    // Check if employee exists
    const existingEmployee = await Employee.findById(employeeId);
    if (!existingEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    // Prepare update object
    const allowedFields = [
      "name",
      "fatherName",
      "phone",
      "location",
      "department",
      "role",
      "panCard",
      "bankAccountNumber",
      "dateOfJoining",
      "addressProof",
      "idCardNumber",
    ];

    const updateData: any = {};

    // Filter and validate update fields
    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        updateData[field] = updateFields[field];
      }
    }

    // Special handling for password if provided
    if (updateFields.password) {
      if (updateFields.password.length < 4) {
        return NextResponse.json(
          { error: "Password must be at least 4 characters" },
          { status: 400 },
        );
      }
      updateData.passwordHash = await bcrypt.hash(updateFields.password, 10);
    }

    // Special handling for dateOfJoining
    if (updateData.dateOfJoining) {
      updateData.dateOfJoining = new Date(updateData.dateOfJoining);
    }

    // Validate phone uniqueness if phone is being updated
    if (updateData.phone && updateData.phone !== existingEmployee.phone) {
      const phoneExists = await Employee.findOne({
        phone: updateData.phone,
        _id: { $ne: employeeId },
      });
      if (phoneExists) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 400 },
        );
      }

      // Validate phone format
      if (!/^\d{10}$/.test(updateData.phone)) {
        return NextResponse.json(
          { error: "Enter a valid 10-digit mobile number" },
          { status: 400 },
        );
      }
    }

    // Check if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedEmployee) {
      return NextResponse.json(
        { error: "Failed to update employee" },
        { status: 500 },
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      employee: {
        id: updatedEmployee._id,
        name: updatedEmployee.name,
        fatherName: updatedEmployee.fatherName,
        phone: updatedEmployee.phone,
        role: updatedEmployee.role,
        location: updatedEmployee.location,
        department: updatedEmployee.department,
        panCard: updatedEmployee.panCard,
        bankAccountNumber: updatedEmployee.bankAccountNumber,
        dateOfJoining: updatedEmployee.dateOfJoining,
        addressProof: updatedEmployee.addressProof,
        idCardNumber: updatedEmployee.idCardNumber,
      },
    });
  } catch (err) {
    console.error("Employee update error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

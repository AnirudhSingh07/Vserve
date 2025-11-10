
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/attendance";
import Employee from "@/models/employee";
import dayjs from "dayjs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
  

    // ✅ Extract phone query param (optional)
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");


    // ✅ Fetch all attendance records and populate employee details
    const records = await Attendance.find()
      .populate("employee", "name phone fatherName idCardNumber")
      .sort({ date: -1 });



    if (!records || records.length === 0) {
      console.warn("⚠️ No attendance records found in DB");
      return NextResponse.json({
        success: true,
        message: "No attendance records found",
        data: [],
      });
    }

    // ✅ Format time/date helpers
    const formatTime = (time: any) => {
      if (!time) return "N/A";
      const d = new Date(time);
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formatDate = (date: any) => {
      if (!date) return "N/A";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    // ✅ Combine employee info with attendance details
    const data = records.map((r) => ({
      name: r.employee?.name ?? "Unknown",
      fatherName: r.employee?.fatherName ?? "N/A",
      idCardNumber: r.employee?.idCardNumber ?? "N/A",
      phone: r.employee?.phone ?? "N/A",
      date: formatDate(r.date),
      status: r.status ?? "—",
      checkInTime: formatTime(r.checkInTime),
      checkOutTime: formatTime(r.checkOutTime),
      lateApproved: r.lateApproved ?? false,
    }));



    // ✅ If phone param is provided → filter records and calculate monthly stats
    if (phone) {
      const filteredData = data.filter(
        (record) => record.phone?.toString() === phone.toString()
      );

      console.log(
        `📞 Filtered attendance for phone ${phone}: ${filteredData.length} records`
      );

      // ✅ Calculate monthly Present/Absent counts
      const startOfMonth = dayjs().startOf("month").toDate();
      const endOfMonth = dayjs().endOf("month").toDate();

      const employee = await Employee.findOne({ phone });
      if (!employee)
        return NextResponse.json({
          success: false,
          error: "Employee not found",
        });

      const monthlyRecords = await Attendance.find({
        employee: employee._id,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      // Total present = attendance records with checkInTime
      const totalPresent = monthlyRecords.filter((r) => r.checkInTime).length;

      // Total days passed in the current month
      const today = dayjs();
      const daysPassed = today.date(); // day of month

      // Total absent = days passed - total present
      const totalAbsent = daysPassed - totalPresent;

      return NextResponse.json({
        success: true,
        count: filteredData.length,
        totalPresent,
        totalAbsent,
        data: filteredData,
      });
    }

    // ✅ Return all records if no phone query provided
    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err: any) {
    console.error("❌ [API] Error fetching all attendance:", err);
    return NextResponse.json(
      { success: false, error: "Server error while fetching attendance" },
      { status: 500 }
    );
  }
}

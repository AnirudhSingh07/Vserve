// app/profile/employee/[id]/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import {
  User,
  Phone,
  Briefcase,
  CheckCircle,
  Clock,
  MapPin,
  IdCard,
  Calendar,
  Banknote,
  FileText,
  UserSquare2,
} from "lucide-react";

type Employee = {
  id: string;
  name?: string;
  fatherName?: string;
  phone?: string;
  role?: string;
  panCard?: string;
  bankAccountNumber?: string;
  dateOfJoining?: string;
  addressProof?: string;
  idCardNumber?: string;
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: `Employee ${params.id} • Profile`,
  };
}

async function fetchEmployeeById(id: string): Promise<Employee | null> {
  if (!id) return null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/viewEmployee?id=${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      }
    );

    if (res.ok) {
      const data = await res.json();
      return data.employee ?? null;
    }

    console.warn(`Employee with ID ${id} not found`);
    return null;
  } catch (err) {
    console.error("Error fetching employee:", err);
    return null;
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const employee = await fetchEmployeeById(id);

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-4">Employee not found</h2>
          <p className="text-sm text-gray-600 mb-6">
            No employee found for id: <strong>{id}</strong>
          </p>
          <Link
            href="/admin"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-16 h-16 flex items-center justify-center text-xl font-semibold">
            {(employee.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {employee.name ?? "Unnamed Employee"}
            </h1>
            <p className="text-sm text-gray-600">
              ID: #{employee.idCardNumber}
            </p>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {employee.role ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {employee.phone ?? "—"}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <Link href="/admin">
              <button className="text-sm px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">
                Back
              </button>
            </Link>
          </div>
        </div>

        {/* Main details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Father Name */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <UserSquare2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Father’s Name
                </p>
                <p className="text-gray-900 mt-1">
                  {employee.fatherName ?? "—"}
                </p>
              </div>
            </div>

            {/* PAN Card */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <IdCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  PAN Card
                </p>
                <p className="text-gray-900 mt-1">{employee.panCard ?? "—"}</p>
              </div>
            </div>

            {/* Bank Account */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Bank Account No.
                </p>
                <p className="text-gray-900 mt-1">
                  {employee.bankAccountNumber ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Second column */}
          <div className="space-y-4">
            {/* Date of Joining */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Date of Joining
                </p>
                <p className="text-gray-900 mt-1">
                  {employee.dateOfJoining
                    ? new Date(employee.dateOfJoining).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>

            {/* Address Proof */}
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-2 rounded">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Address Proof
                </p>
                <p className="text-gray-900 mt-1">
                  {employee.addressProof ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

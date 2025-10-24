"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees");
        const data = await res.json();
        if (res.ok) setEmployees(data.employees);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">All Employees</h1>

      <div className="grid gap-4 w-full max-w-4xl">
        {employees.map((emp) => (
          <Card key={emp._id} className="shadow-lg">
            <CardHeader>
              <CardTitle>{emp.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-1">
              <p><strong>Father's Name:</strong> {emp.fatherName}</p>
              <p><strong>Phone:</strong> {emp.phone}</p>
              <p><strong>Role:</strong> {emp.role}</p>
              <p><strong>PAN Card:</strong> {emp.panCard}</p>
              <p><strong>Bank Account:</strong> {emp.bankAccountNumber}</p>
              <p><strong>Date of Joining:</strong> {new Date(emp.dateOfJoining).toLocaleDateString()}</p>
              <p><strong>ID Card Number:</strong> {emp.idCardNumber}</p>
              <p>
                <strong>Address Proof:</strong>{" "}
                <a
                  href={emp.addressProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View
                </a>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

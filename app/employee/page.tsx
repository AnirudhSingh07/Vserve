"use client";

import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  name?: string;
  phone?: string;
  lastKnownCoords?: {
    lat: number;
    lng: number;
  };
  lastLocationTimestamp?: string;
  dailyDistanceKm?: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/employees", {
          cache: "no-store", // 🔒 double safety
        });

        const data = await res.json();
        console.log("all employee data is here :", data);

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch employees");
        }

        setEmployees(data.employees);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return <div className="p-6 text-lg">Loading employees...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">Error fetching employees: {error}</div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        👨‍💼 Employees ({employees.length})
      </h1>

      <div className="space-y-4">
        {employees.map((emp) => (
          <div
            key={emp._id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <p>
              <strong>ID:</strong> {emp._id}
            </p>

            <p>
              <strong>Name:</strong> {emp.name || "N/A"}
            </p>

            <p>
              <strong>Phone:</strong> {emp.phone || "N/A"}
            </p>

            <p>
              <strong>Daily Distance:</strong>{" "}
              {emp.dailyDistanceKm?.toFixed(2) ?? 0} km
            </p>

            <p>
              <strong>Last Location:</strong>{" "}
              {emp.lastKnownCoords
                ? `${emp.lastKnownCoords.lat}, ${emp.lastKnownCoords.lng}`
                : "Not available"}
            </p>

            <p>
              <strong>Last Updated:</strong>{" "}
              {emp.lastLocationTimestamp
                ? new Date(emp.lastLocationTimestamp).toLocaleString()
                : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

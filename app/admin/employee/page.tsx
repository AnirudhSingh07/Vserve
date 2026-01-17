"use client";

import EmployeeDirectory from "@/components/admin/EmployeeDirectory";
import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  id: string;
  phone: string;
  role: string;
  name?: string;
  profileCompleted?: boolean;
};

const page = () => {
  const [employees, setEmployees] = React.useState<User[]>([]);
  const router = useRouter();
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setEmployees(data.employees);
        }
      } catch (err) {
        console.log("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-10 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <EmployeeDirectory users={employees} />
          </div>
        </div>
      </main>
    </>
  );
};

export default page;

"use client";

import EmployeeDirectory from "@/components/admin/EmployeeDirectory";
import React, { useEffect } from "react";

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
    <EmployeeDirectory users={employees} />
  );
};

export default page;

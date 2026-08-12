"use client";

import AdminPanel from "@/components/admin/AdminPanel";
import NavBar from "@/components/Navbar";
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <NavBar />
      <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 pt-20 pb-10">
        <h1 className="text-2xl md:text-3xl text-center font-semibold text-gray-800 mb-6">
          Admin Panel
        </h1>
        <AdminPanel />
      </main>
    </div>
  );
}

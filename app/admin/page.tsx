"use client";

import AdminPanel from "@/components/admin/AdminPanel";
import NavBar from "@/components/Navbar";
export default function AdminPage() {
  return (
    <div>
      <NavBar />
      <main className="p-2 max-w-10xl mx-auto mt-20">
        <h1 className="text-3xl text-center text-black font-bold mb-4 text-balance ">
          Admin Panel
        </h1>
        <AdminPanel />
      </main>
    </div>
  );
}

"use client"

import AdminPanel from "@/components/admin/AdminPanel"
import NavBar from "@/components/Navbar"
export default function AdminPage() {
  return (
    <div>
    <NavBar/>
    <main className="p-4 max-w-6xl mx-auto mt-20">
      
      <h1 className="text-2xl font-semibold mb-4 text-balance">Manager / Admin Panel</h1>
      <AdminPanel />
    </main>
    </div>
  )
}

import { Users, AlertCircle } from "lucide-react";

export default function AdminHeader({ admin, users, pendingLateReqs }: any) {
  if (!admin) return null;
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {admin.name || "Admin"}! 👋
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            Role: {admin.role} • Managing your organization's workforce
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
            <Users className="w-6 h-6 mx-auto mb-1" />
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-xs text-blue-100">Employees</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-1" />
            <p className="text-2xl font-bold">{pendingLateReqs.length}</p>
            <p className="text-xs text-blue-100">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}

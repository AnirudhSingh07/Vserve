import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  // 1. If there's no token, redirect to login
  if (!token) {
    redirect("/login");
  }

  // 2. Verify and decode the token
  const decoded = verifyToken(token) as any;

  // 3. If invalid token or not an admin, redirect them away
  if (!decoded || decoded.role !== "admin") {
    // Optionally, redirect executives to their dashboard instead of login
    redirect("/dashboard");
  }

  // 4. If all checks pass, render the admin pages
  return <>{children}</>;
}

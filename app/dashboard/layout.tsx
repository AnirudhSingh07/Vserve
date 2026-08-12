import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";

export default function DashboardLayout({
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

  // 3. If invalid token, go to login
  if (!decoded) {
    redirect("/login");
  }

  // 4. If the user is an admin, they shouldn't access the executive dashboard
  if (decoded.role === "admin") {
    redirect("/admin");
  }

  // 5. If all checks pass (i.e. they are an executive), render the dashboard
  return <>{children}</>;
}

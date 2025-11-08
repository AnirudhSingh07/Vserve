"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"executive" | "manager" | "admin">(
    "executive"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.loggedIn && data.employee) {
          if (data.employee.role === "executive") router.replace("/dashboard");
          else router.replace("/admin");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };
    checkAuth();
  }, [router]);

  // ✅ Login handler
  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!/^\d{10}$/.test(phone)) {
        setError("Enter a valid 10-digit mobile number");
        setLoading(false);
        return;
      }
      if (!password || password.length < 4) {
        setError("Enter a valid password (min 4 characters)");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
        credentials: "include", // send cookies
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.employee.role === "executive") router.replace("/dashboard");
      else router.replace("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/logo.png"
              alt="Company Logo"
              width={120}
              height={80}
              className="rounded-md"
            />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Employee Login
          </CardTitle>
          <p className="text-sm text-gray-500">
            Welcome back! Please sign in to your account.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-gray-700">
              Mobile Number
            </Label>
            <Input
              id="phone"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter 10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="rounded-lg focus-visible:ring-blue-500"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg focus-visible:ring-blue-500"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role" className="text-gray-700">
              Login as
            </Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger
                id="role"
                className="rounded-lg focus-visible:ring-blue-500"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center font-medium">
              {error}
            </p>
          )}

          <Button
            className="w-full mt-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all text-white"
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-xs text-center text-gray-500 mt-3">
            Don't have an account?{" "}
            <a
              href="/register"
              className="underline text-blue-400 hover:text-blue-600"
            >
              Register
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

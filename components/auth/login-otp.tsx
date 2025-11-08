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

  // ✅ Auto-redirect if already logged in (server check)
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();
        if (data.loggedIn && data.user) {
          if (data.user.role === "executive") router.replace("/dashboard");
          else router.replace("/admin");
        }
      } catch {
        // ignore
      }
    };
    checkLogin();
  }, [router]);

  // ✅ Handle login through backend
  const handleLogin = async () => {
    setError(null);

    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (!password || password.length < 4) {
      setError("Enter a valid password (min 4 characters)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
        credentials: "include", // ✅ important for setting cookie
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // ✅ Cookie is set by the server now, no need for localStorage
      if (data.employee?.role === "executive") router.replace("/dashboard");
      else router.replace("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border max-w-md mx-auto mt-20">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Company Logo"
            width={125}
            height={80}
            className="rounded-md"
          />
        </div>
        <CardTitle className="text-center text-balance">
          Employee Login
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="phone">Mobile Number</Label>
          <Input
            id="phone"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter 10-digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="role">Login as</Label>
          <Select value={role} onValueChange={(v: any) => setRole(v)}>
            <SelectTrigger id="role" aria-label="Select role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="executive">Executive</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" disabled={loading} onClick={handleLogin}>
          {loading ? "Logging in..." : "Login"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms and acknowledge our Privacy
          Policy.
        </p>
      </CardContent>
    </Card>
  );
}

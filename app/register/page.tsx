"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    name: "",
    role: "executive",
    fatherName: "",
    panCard: "",
    bankAccountNumber: "",
    dateOfJoining: "",
    addressProof: "",
    idCardNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    // Basic validations
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    if (!formData.name || !formData.fatherName || !formData.panCard || !formData.bankAccountNumber || !formData.dateOfJoining || !formData.addressProof || !formData.idCardNumber) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border max-w-md mx-auto mt-10">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-center">
          <Image src="/images/logo.png" alt="Company Logo" width={125} height={80} className="rounded-md" />
        </div>
        <CardTitle className="text-center text-balance">Register New Employee</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="Enter full name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
        </div>

        {/* Father's Name */}
        <div className="grid gap-2">
          <Label htmlFor="fatherName">Father's Name</Label>
          <Input id="fatherName" placeholder="Enter father's name" value={formData.fatherName} onChange={(e) => handleChange("fatherName", e.target.value)} />
        </div>

        {/* Phone */}
        <div className="grid gap-2">
          <Label htmlFor="phone">Mobile Number</Label>
          <Input
            id="phone"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter 10-digit number"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
          />
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
        </div>

        {/* Role */}
        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(v: any) => handleChange("role", v)}>
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

        {/* PAN Card */}
        <div className="grid gap-2">
          <Label htmlFor="panCard">PAN Card Number</Label>
          <Input id="panCard" placeholder="Enter PAN Card" value={formData.panCard} onChange={(e) => handleChange("panCard", e.target.value)} />
        </div>

        {/* Bank Account */}
        <div className="grid gap-2">
          <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
          <Input id="bankAccountNumber" placeholder="Enter Bank Account" value={formData.bankAccountNumber} onChange={(e) => handleChange("bankAccountNumber", e.target.value)} />
        </div>

        {/* Date of Joining */}
        <div className="grid gap-2">
          <Label htmlFor="dateOfJoining">Date of Joining</Label>
          <Input id="dateOfJoining" type="date" value={formData.dateOfJoining} onChange={(e) => handleChange("dateOfJoining", e.target.value)} />
        </div>

        {/* Address Proof */}
        <div className="grid gap-2">
          <Label htmlFor="addressProof">Address Proof (URL)</Label>
          <Input id="addressProof" placeholder="Enter address proof URL" value={formData.addressProof} onChange={(e) => handleChange("addressProof", e.target.value)} />
        </div>

        {/* ID Card Number */}
        <div className="grid gap-2">
          <Label htmlFor="idCardNumber">ID Card Number</Label>
          <Input id="idCardNumber" placeholder="Enter ID Card Number" value={formData.idCardNumber} onChange={(e) => handleChange("idCardNumber", e.target.value)} />
        </div>

        <Button className="w-full" disabled={loading} onClick={handleRegister}>
          {loading ? "Registering..." : "Register"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-success">{success}</p>}

        <p className="text-xs text-muted-foreground text-center">
          After registration, you will be redirected to the login page.
        </p>
      </CardContent>
    </Card>
  );
}

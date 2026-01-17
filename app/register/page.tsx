"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    location: "",
    department: "",
    addressProof: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Step 1 for Basic Details, Step 2 for Additional Details

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
    if (
      !formData.name ||
      !formData.fatherName ||
      !formData.phone ||
      !formData.password ||
      !formData.role
    ) {
      setError("All fields in Basic Details are required");
      return;
    }

    if (step === 2) {
      // Additional Details Validations
      if (
        !formData.panCard ||
        !formData.bankAccountNumber ||
        !formData.dateOfJoining ||
        !formData.addressProof ||
        !formData.location ||
        !formData.department
      ) {
        setError("All fields in Additional Details are required");
        return;
      }
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

  const handleNext = () => {
    if (step === 1) {
      // Validate basic details before moving to step 2
      if (
        !formData.name ||
        !formData.fatherName ||
        !formData.phone ||
        !formData.password ||
        !formData.role
      ) {
        setError("Please fill all fields in Basic Details");
      } else {
        setStep(2); // Move to next step
      }
    } else {
      handleRegister(); // Submit the form when at step 2
    }
  };

  const handlePrevious = () => {
    setStep(1); // Go back to step 1
  };

  return (
    <Card className="border max-w-md mx-auto mt-10">
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
          Register New Employee
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 ">
        {/* Basic Details Form */}
        {step === 1 && (
          <>
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            {/* Father's Name */}
            <div className="grid gap-2">
              <Label htmlFor="fatherName">Father's Name</Label>
              <Input
                id="fatherName"
                placeholder="Enter father's name"
                value={formData.fatherName}
                onChange={(e) => handleChange("fatherName", e.target.value)}
              />
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
                onChange={(e) =>
                  handleChange("phone", e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
          </>
        )}

        {/* Additional Details Form */}
        {step === 2 && (
          <>
            {/* PAN Card */}
            <div className="grid gap-2">
              <Label htmlFor="panCard">PAN Card Number</Label>
              <Input
                id="panCard"
                placeholder="Enter PAN Card"
                value={formData.panCard}
                onChange={(e) => handleChange("panCard", e.target.value)}
              />
            </div>
            {/* Bank Account */}
            <div className="grid gap-2">
              <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
              <Input
                id="bankAccountNumber"
                placeholder="Enter Bank Account"
                value={formData.bankAccountNumber}
                onChange={(e) =>
                  handleChange("bankAccountNumber", e.target.value)
                }
              />
            </div>
            {/* Date of Joining */}
            <div className="grid gap-2">
              <Label htmlFor="dateOfJoining">Date of Joining</Label>
              <Input
                id="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => handleChange("dateOfJoining", e.target.value)}
              />
            </div>
            {/* Address Proof */}
            <div className="grid gap-2">
              <Label htmlFor="addressProof">Address Proof (URL)</Label>
              <Input
                id="addressProof"
                placeholder="Enter address proof URL"
                value={formData.addressProof}
                onChange={(e) => handleChange("addressProof", e.target.value)}
              />
            </div>
            {/* department */}
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <input
                type="text"
                placeholder="Enter department"
                value={formData.department}
                name="department"
                id="department"
                onChange={(e) => handleChange("department", e.target.value)}
              />
            </div>

            {/* location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleChange("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location">
                    {formData.location || "Indore"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indore">Indore</SelectItem>
                  <SelectItem value="Bhopal">Bhopal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="flex justify-between">
          {step === 2 && (
            <Button className="w-auto" onClick={handlePrevious}>
              Previous
            </Button>
          )}

          <Button className="w-auto" onClick={handleNext} disabled={loading}>
            {step === 1 ? "Next" : loading ? "Registering..." : "Register"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-success">{success}</p>}

        <p className="text-xs text-muted-foreground text-center">
          After registration, you will be redirected to the login page.
        </p>
      </CardContent>
    </Card>
  );
}

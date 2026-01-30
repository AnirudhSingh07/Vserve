// // app/admin/create-employee/page.tsx
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function CreateEmployee() {
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
    location: "Indore",
    department: "",
    addressProof: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const validateStep1 = (): boolean => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.fatherName.trim()) {
      setError("Father's name is required");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Enter a valid 10-digit mobile number");
      return false;
    }
    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.panCard.trim()) {
      setError("PAN Card number is required");
      return false;
    }
    if (!formData.bankAccountNumber.trim()) {
      setError("Bank account number is required");
      return false;
    }
    if (!formData.dateOfJoining) {
      setError("Date of joining is required");
      return false;
    }
    if (!formData.addressProof.trim()) {
      setError("Address proof URL is required");
      return false;
    }
    if (!formData.department.trim()) {
      setError("Department is required");
      return false;
    }
    if (!formData.location) {
      setError("Location is required");
      return false;
    }
    return true;
  };

  const handleCreateEmployee = async () => {
    setError(null);
    setSuccess(null);

    if (!validateStep2()) return;

    setLoading(true);

    try {
      // ✅ Use the new admin-specific route
      const res = await fetch("/api/admin/create-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Employee creation failed");
      }

      setSuccess(
        `Employee "${data.employee.name}" created successfully! You can now log in with their credentials to test.`
      );
      
      // Reset form
      setFormData({
        phone: "",
        password: "",
        name: "",
        role: "executive",
        fatherName: "",
        panCard: "",
        bankAccountNumber: "",
        dateOfJoining: "",
        location: "Indore",
        department: "",
        addressProof: "",
      });
      setStep(1);

      // Redirect to employee directory after 3 seconds
      setTimeout(() => {
        router.push("/admin/employee");
        router.refresh();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred during employee creation");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setError(null);
    
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else {
      handleCreateEmployee();
    }
  };

  const handlePrevious = () => {
    setError(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
        <Navbar/>
      <div className="max-w-2xl mt-12 mx-auto">
        {/* Back Button */}
        <Link href="/admin">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Button>
        </Link>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-3 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
       
            <CardTitle className="text-center text-2xl">
              Create New Employee
            </CardTitle>
            <p className="text-center text-sm text-blue-100">
              Step {step} of 2: {step === 1 ? "Basic Details" : "Additional Details"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Step 1: Basic Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter employee's full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fatherName" className="text-base font-semibold">
                    Father's Name *
                  </Label>
                  <Input
                    id="fatherName"
                    placeholder="Enter father's name"
                    value={formData.fatherName}
                    onChange={(e) => handleChange("fatherName", e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-base font-semibold">
                    Mobile Number *
                  </Label>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) =>
                      handleChange("phone", e.target.value.replace(/\D/g, ""))
                    }
                    className="h-11"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-base font-semibold">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password (min. 4 characters)"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-base font-semibold">
                    Role *
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Additional Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="panCard" className="text-base font-semibold">
                      PAN Card Number *
                    </Label>
                    <Input
                      id="panCard"
                      placeholder="Enter PAN Card"
                      value={formData.panCard}
                      onChange={(e) => handleChange("panCard", e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="bankAccountNumber"
                      className="text-base font-semibold"
                    >
                      Bank Account *
                    </Label>
                    <Input
                      id="bankAccountNumber"
                      placeholder="Enter bank account"
                      value={formData.bankAccountNumber}
                      onChange={(e) =>
                        handleChange("bankAccountNumber", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="dateOfJoining"
                      className="text-base font-semibold"
                    >
                      Date of Joining *
                    </Label>
                    <Input
                      id="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) =>
                        handleChange("dateOfJoining", e.target.value)
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="department" className="text-base font-semibold">
                      Department *
                    </Label>
                    <Input
                      id="department"
                      placeholder="Enter department"
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location" className="text-base font-semibold">
                    Location *
                  </Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => handleChange("location", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indore">Indore</SelectItem>
                      <SelectItem value="Bhopal">Bhopal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="addressProof" className="text-base font-semibold">
                    Address Proof (URL) *
                  </Label>
                  <Input
                    id="addressProof"
                    placeholder="Enter address proof URL"
                    value={formData.addressProof}
                    onChange={(e) => handleChange("addressProof", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            )}

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 pt-4">
              {step === 2 ? (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                  className="h-11 px-8"
                >
                  Previous
                </Button>
              ) : (
                <div></div>
              )}

              <Button
                onClick={handleNext}
                disabled={loading}
                className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {step === 1 ? "Next" : loading ? "Creating..." : "Create Employee"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              All fields marked with * are required
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
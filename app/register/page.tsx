"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
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

  const DEPARTMENTS = [
    "Sales",
    "IT",
    "Marketing",
    "HR",
    "Operations",
    "Finance",
    "Design",
    "Support",
    "Manager",
    "Team Leader",
    "Telecaller",
    "Field Executive",
    "Backend Executive",
  ];

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

  const [otherLocation, setOtherLocation] = useState("");
  const [otherDepartment, setOtherDepartment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Step 1 for Basic Details, Step 2 for Additional Details
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

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

    // Resolve "Other" selections to their custom values
    const submitData = {
      ...formData,
      location: formData.location === "Other" ? otherLocation : formData.location,
      department: formData.department === "Other" ? otherDepartment : formData.department,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
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
      if (
        !formData.name ||
        !formData.fatherName ||
        !formData.phone ||
        !formData.password ||
        !formData.role
      ) {
        setError("Please fill all fields in Basic Details");
        return; // ← add return here too so it doesn't fall through
      }
      // ✅ NEW: Confirm password check
      if (formData.password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setError(null); // clear any previous error before moving forward
      setStep(2);
    } else {
      handleRegister();
    }
  };

  const handlePrevious = () => {
    setStep(1); // Go back to step 1
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 rounded-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.jpeg"
              alt="Company Logo"
              width={120}
              height={80}
              className="rounded-md"
            />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Register New Employee
          </CardTitle>
          <p className="text-sm text-gray-500">
            {step === 1
              ? "Step 1 of 2 — Basic Details"
              : "Step 2 of 2 — Additional Details"}
          </p>
          {/* Step indicator dots */}
          <div className="flex justify-center gap-2 pt-1">
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                step === 1 ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                step === 2 ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Basic Details Form */}
          {step === 1 && (
            <>
              {/* Full Name */}
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="rounded-lg focus-visible:ring-blue-500"
                />
              </div>

              {/* Father's Name */}
              <div className="grid gap-2">
                <Label htmlFor="fatherName" className="text-gray-700">Father&apos;s Name</Label>
                <Input
                  id="fatherName"
                  placeholder="Enter father's name"
                  value={formData.fatherName}
                  onChange={(e) => handleChange("fatherName", e.target.value)}
                  className="rounded-lg focus-visible:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-gray-700">Mobile Number</Label>
                <Input
                  id="phone"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={formData.phone}
                  onChange={(e) =>
                    handleChange("phone", e.target.value.replace(/\D/g, ""))
                  }
                  className="rounded-lg focus-visible:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="rounded-lg focus-visible:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-lg focus-visible:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Additional Details Form */}
          {step === 2 && (
            <>
              {/* PAN Card */}
              <div className="grid gap-2">
                <Label htmlFor="panCard" className="text-gray-700">PAN Card Number</Label>
                <Input
                  id="panCard"
                  placeholder="Enter PAN Card"
                  value={formData.panCard}
                  onChange={(e) => handleChange("panCard", e.target.value)}
                  className="rounded-lg focus-visible:ring-blue-500"
                />
              </div>
              {/* Bank Account */}
              <div className="grid gap-2">
                <Label htmlFor="bankAccountNumber" className="text-gray-700">Bank Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  placeholder="Enter Bank Account"
                  value={formData.bankAccountNumber}
                  onChange={(e) =>
                    handleChange("bankAccountNumber", e.target.value)
                  }
                  className="rounded-lg focus-visible:ring-blue-500"
                />
              </div>
              {/* Date of Joining */}
              <div className="grid gap-2">
                <Label htmlFor="dateOfJoining" className="text-gray-700">Date of Joining</Label>
                <Input
                  id="dateOfJoining"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) => handleChange("dateOfJoining", e.target.value)}
                  className="rounded-lg focus-visible:ring-blue-500"
                />
              </div>
              {/* Address Proof */}
              <div className="grid gap-2">
                <Label htmlFor="addressProof" className="text-gray-700">Address Proof (URL)</Label>
                <Input
                  id="addressProof"
                  placeholder="Enter address proof URL"
                  value={formData.addressProof}
                  onChange={(e) => handleChange("addressProof", e.target.value)}
                  className="rounded-lg focus-visible:ring-blue-500"
                />
              </div>
              {/* department */}
              <div className="grid gap-2">
                <Label htmlFor="department" className="text-gray-700">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange("department", value)}
                >
                  <SelectTrigger id="department" className="rounded-lg focus:ring-blue-500">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formData.department === "Other" && (
                  <Input
                    id="otherDepartment"
                    placeholder="Enter your department"
                    value={otherDepartment}
                    onChange={(e) => setOtherDepartment(e.target.value)}
                    className="rounded-lg focus-visible:ring-blue-500"
                  />
                )}
              </div>

              {/* location */}
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-gray-700">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleChange("location", value)}
                >
                  <SelectTrigger className="rounded-lg focus:ring-blue-500">
                    <SelectValue placeholder="Select location">
                      {formData.location || "Indore"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indore">Indore</SelectItem>
                    <SelectItem value="Bhopal">Bhopal</SelectItem>
                    <SelectItem value="Sehore">Sehore</SelectItem>
                    <SelectItem value="Pithampur">Pithampur</SelectItem>
                    <SelectItem value="Hoshangabad">Hoshangabad</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formData.location === "Other" && (
                  <Input
                    id="otherLocation"
                    placeholder="Enter your location"
                    value={otherLocation}
                    onChange={(e) => setOtherLocation(e.target.value)}
                    className="rounded-lg focus-visible:ring-blue-500"
                  />
                )}
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 text-center font-medium">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600 text-center font-medium">
              {success}
            </p>
          )}

          <div className="flex gap-3 mt-3">
            {step === 2 && (
              <Button
                className="flex-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all text-gray-700"
                onClick={handlePrevious}
              >
                Previous
              </Button>
            )}

            <Button
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all text-white"
              onClick={handleNext}
              disabled={loading}
            >
              {step === 1 ? "Next" : loading ? "Registering..." : "Register"}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-3">
            Already have an account?{" "}
            <a
              href="/login"
              className="underline text-blue-400 hover:text-blue-600"
            >
              Login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

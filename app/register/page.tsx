"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default function Register() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"executive" | "manager" | "admin">("executive")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    setSuccess(null)

    // validation
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number")
      return
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, name, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Registration failed")

      setSuccess("Registration successful! Redirecting to login...")
      setTimeout(() => router.replace("/login"), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border max-w-md mx-auto mt-10">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-center">
          <Image src="/images/logo.png" alt="Company Logo" width={125} height={80} className="rounded-md" />
        </div>
        <CardTitle className="text-center text-balance">Register New Employee</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
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
  )
}

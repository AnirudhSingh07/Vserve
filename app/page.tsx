"use client"

import Link from "next/link"
import LoginOTP from "@/components/auth/login-otp"

export default function HomePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-3 py-5 md:px-0  bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md">
        <LoginOTP />
      </div>
    </main>
  )
}

// app/dashboard/layout.js
"use client";

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
  {/* Left: Logo + Project name */}
  <Link href="/dashboard" className="flex items-center gap-2">
    <img src="/taskflow.png" alt="TaskFlow Logo" className="h-8 w-8" />
    <span className="text-lg font-semibold text-[#690031]">Task Flow AI</span>
  </Link>

  {/* Right: Auth Buttons */}
  <div className="flex items-center">
    <SignedIn>
      <UserButton afterSignOutUrl="/" />
    </SignedIn>
    <SignedOut>
      <SignInButton />
    </SignedOut>
  </div>
</header>


      {/* Page content */}
      <main className="p-6">{children}</main>
    </div>
  );
}

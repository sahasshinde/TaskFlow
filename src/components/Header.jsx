// components/Header.jsx 
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Header() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  
  React.useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <header className="bg-white-900 text-black px-3 py-2 ">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Logo + Project Name */}
        <div className="flex items-center space-x-3">
          <Image 
            src="/taskflow.png" 
            alt="TaskFlow Logo"
            width={40}
            height={40}
            priority
          />
          <span className="text-xl font-semibold">Task Flow AI</span>
        </div>

        {/* Right: Buttons */}
        <div className="flex space-x-4">
          {isSignedIn && (
            <Link href="/dashboard">
              <Button variant="primary" className="text-black">
                Dashboard
              </Button>
            </Link>
          )}
          <Link href="/sign-in">
            <Button className="cursor-pointer ">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

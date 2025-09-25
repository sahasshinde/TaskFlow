"use client";

import { useState } from "react";
import { LayoutDashboard, CheckSquare, Mail, Calendar, Sparkles } from "lucide-react";
import OverviewSection from "@/components/OverviewSection";
import TasksSection from "@/components/TasksSection";
import CalendarSection from "@/components/CalendarSection";
import { useUser } from "@clerk/nextjs";
import EmailDashboard from "@/components/emailDashboard";

export default function Dashboard() {
  const [active, setActive] = useState("Overview");
  const { user, isSignedIn } = useUser();

  if (!isSignedIn || !user) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Tasks", icon: <CheckSquare className="h-5 w-5" /> },
    { name: "Emails", icon: <Mail className="h-5 w-5" /> },
    { name: "Calendar", icon: <Calendar className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md">
        <div className="px-6 py-4 text-2xl font-bold text-[#690031]">
          Task Flow AI
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 ${
                active === item.name
                  ? "bg-[#690031] text-white"
                  : "text-gray-700"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {active === "Overview" && <OverviewSection userId={user.id} />}
        {active === "Tasks" && <TasksSection isSignedIn={isSignedIn} />}
        {active === "Emails" && <EmailDashboard/>}
        {active === "Calendar" && <CalendarSection isSignedIn={isSignedIn} userId={user.id} />}
      </main>
      <a
        href="/agents"
        className="fixed bottom-8 right-8 z-50 bg-red-900 hover:bg-red-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 transition"
      >
        <Sparkles className="w-5 h-5" />
        Agent
      </a>
    </div>
  );
}

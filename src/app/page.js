// app/page.js
import Features from "@/components/features";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* HEADER */}
      <Header />

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-100 to-white text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-[#690031]">
          Your Personal AI Agent For Productivity
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          TaskFlow AI works with your Google Workspace — especially emails,
          calendar, and documents — to make you smarter and more in control.
        </p>
        <Link href="/sign-in">
        <Button
          style={{
            backgroundColor: "#690031",
            color: "#fff",
          }}
          className="text-xl md:text-xl rounded-full font-semibold shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer p-6"
        >
          Get Started
        </Button></Link>

        {/* KEEP YOUR IMAGES BELOW CTA */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-16">
          <Image
            src="/img1.png"
            alt="First preview"
            width={400}
            height={300}
            className="rounded-xl shadow-2xl object-cover"
          />
          <Image
            src="/img2.png"
            alt="Second preview"
            width={400}
            height={300}
            className="rounded-xl shadow-2xl object-cover"
          />
        </div>
      </section>

       {/* Feature section */}
       <Features/>

      {/* INTEGRATIONS */}
      <section className="py-24 px-6 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Seamless Google Integrations
          </h2>
          <p className="text-gray-600 mt-3">
            Connect Gmail, Calendar and Tasks to get the full experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10  max-w-9xl mx-auto">
          <div className="p-6 bg-red-50 rounded-xl shadow-md">
            <h4 className="font-semibold text-lg text-[#690031]">📧 Gmail</h4>
            <p className="text-gray-600 mt-2">
              Automatically turn important emails into tasks.
            </p>
          </div>
          <div className="p-6 bg-red-50 rounded-xl shadow-md">
            <h4 className="font-semibold text-lg text-[#690031]">📅 Google Calendar</h4>
            <p className="text-gray-600 mt-2">
              Sync tasks and events seamlessly into your schedule.
            </p>
          </div>
          
          <div className="p-6 bg-red-50 rounded-xl shadow-md">
            <h4 className="font-semibold text-lg text-[#690031]">✅ Google Tasks</h4>
            <p className="text-gray-600 mt-2">
              Stay aligned with your Google productivity tools.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 text-center bg-gradient-to-r from-red-400 via-red-300 to-red-200 text-[#690031]">
  <h2 className="text-4xl font-bold mb-6">
    Start Supercharging Your Productivity
  </h2>
  <p className="mb-8 text-lg max-w-xl mx-auto">
    Join thousands of users who trust TaskFlow AI to organize their emails,
    tasks, and schedules with AI-powered assistance.
  </p>
  <Link href="/sign-in">
  <Button
    className="text-lg px-8 py-4 rounded-full font-semibold shadow-lg"
    style={{ backgroundColor: "#690031", color: "white" }}
  >
    Get Started Now
  </Button></Link>
</section>


      {/* FOOTER */}
      <footer className="bg-[#690031] text-white py-10 mt-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-bold">Task Flow AI</h2>
            <p className="text-sm mt-1">
              From Email to Calendar — automate your day.
            </p>
          </div>
          <p className="text-xs mt-2 md:mt-0">
            © 2025 TaskFlow AI. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

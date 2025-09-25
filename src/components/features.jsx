"use client";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Calendar, Mail, CheckCircle, Trash2 } from "lucide-react";

const features = [
  {
    title: "Smart Task Extraction",
    description:
      "Task Flow AI transforms your prompts into tasks instantly. Just tell Tasky what needs to be done, and watch your to-do list build itself intelligently.",
    icon: <Bot className="w-8 h-8 text-indigo-600" />,
    demo: "tasks",
  },
  {
    title: "Google Calendar Integration",
    description:
      "Let Task Flow AI  handle your schedule. It automatically places tasks into your Google Calendar — perfectly timed, with zero effort from you.",
    icon: <Calendar className="w-8 h-8 text-indigo-600" />,
    demo: "calendar",
  },
  {
    title: "Email Summarization",
    description:
      "Task Flow AI scans your inbox, summarizes long emails, and extracts action items so you can focus on what matters most.",
    icon: <Mail className="w-8 h-8 text-indigo-600" />,
    demo: "email",
  },
];

export default function Features() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-t from-red-100 to-white">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_#e0e7ff,_transparent_40%)]" />

      <h3 className="text-4xl font-extrabold text-center mb-20 text-gray-900">
        How Task Flow AI Works for You
      </h3>

      <div className="space-y-40">
        {features.map((feature, idx) => (
          <FeatureRow key={idx} feature={feature} reverse={idx % 2 !== 0} />
        ))}
      </div>
    </section>
  );
}

function FeatureRow({ feature, reverse }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-12 items-center ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Left: Text */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? 60 : -60 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="space-y-5 text-left"
      >
        <div className="flex items-center gap-3">
          {feature.icon}
          <h4 className="text-3xl font-semibold text-gray-900">
            {feature.title}
          </h4>
        </div>
        <p className="text-lg text-gray-600 leading-relaxed max-w-md">
          {feature.description}
        </p>
      </motion.div>

      {/* Right: Demo */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -60 : 60 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <DemoWindow type={feature.demo} />
      </motion.div>
    </div>
  );
}

function DemoWindow({ type }) {
  return (
    <Card className="rounded-xl shadow-2xl overflow-hidden w-full max-w-md mx-auto border border-gray-200 py-0">
      {/* Fake browser header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b">
        <div className="flex gap-1">
          <span className="w-3 h-3 rounded-full bg-red-400"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
          <span className="w-3 h-3 rounded-full bg-green-400"></span>
        </div>
        <div className="flex-1 text-center">
          <span className="px-3 py-1 text-xs rounded bg-white border text-gray-500">
            task flow.ai/demo
          </span>
        </div>
      </div>

      {/* Browser content */}
      <CardContent className="p-6 bg-white">
        {type === "tasks" && <TaskDemo />}
        {type === "calendar" && <CalendarDemo />}
        {type === "email" && <EmailDemo />}
      </CardContent>
    </Card>
  );
}

/* ---------------- DEMOS ---------------- */
function TaskDemo() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.6 } },
      }}
      className="space-y-3"
    >
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700"
      >
        User: “I have to complete DBMS assignment, make notes of AI and revision
        of Statistics”
      </motion.div>
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-700"
      >
        AI: “Sure! Added 3 tasks to your list.”
      </motion.div>
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="space-y-2"
      >
        {[
          "Finish DBMS assignment",
          "Prepare AI notes",
          "Revise Statistics",
        ].map((task, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-white shadow-sm border rounded-lg px-3 py-2"
          >
            <span className="text-sm">{task}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </Button>
              <Button size="sm" variant="ghost">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function CalendarDemo() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.6 } } }}
      className="space-y-3"
    >
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700"
      >
        User: “Schedule my DBMS revision.”
      </motion.div>
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-700"
      >
        AI: “Added DBMS Revision to calendar at 6pm.”
      </motion.div>
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="bg-white shadow-sm border rounded-lg p-3 text-sm"
      >
        📅 DBMS Revision — Today 6:00 PM
      </motion.div>
    </motion.div>
  );
}

function EmailDemo() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.6 } } }}
      className="space-y-3"
    >
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700"
      >
        User: “Summarize unread emails.”
      </motion.div>
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-700"
      >
        AI: “Here are the top 2 summaries.”
      </motion.div>
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="bg-white shadow-sm border rounded-lg p-3 text-sm"
      >
        ✉ Project Update: Deadline extended to next week.
      </motion.div>
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="bg-white shadow-sm border rounded-lg p-3 text-sm"
      >
        ✉ Meeting tomorrow at 10am.
      </motion.div>
    </motion.div>
  );
}
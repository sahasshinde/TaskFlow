"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  EyeOff,
  Star,
  ExternalLink,
  Calendar,
  Inbox,
  Archive,
  Trash2,
  Search,
  MoreVertical,
} from "lucide-react";
import { EmailModal } from "./emailModal";
import { Input } from "./ui/input";


export default function EmailDashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    sender: null,
    dateFrom: "",
    dateTo: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchEmails() {
      try {
        const res = await fetch("/api/emails/lastweek");
        const data = await res.json();
        if (data.success) {
          const sorted = data.emails.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setEmails(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch emails:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmails();
  }, []);

  // Stats
  const totalEmails = emails.length;
  const unreadEmails = emails.filter((e) =>
    e.labelIds?.includes("UNREAD")
  ).length;
  const readEmails = totalEmails - unreadEmails;
  const starredEmails = emails.filter((e) => e.starred).length;
  const importantEmails = emails.filter((e) =>
    e.labelIds?.includes("IMPORTANT")
  ).length;

  // Top senders
  const senderCount = emails.reduce((acc, email) => {
    const sender = email.from || "Unknown";
    acc[sender] = (acc[sender] || 0) + 1;
    return acc;
  }, {});
  const topSenders = Object.entries(senderCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Unified filtering
  const filteredEmails = emails.filter((email) => {
    // Status filter
    if (filters.status === "unread" && !email.labelIds?.includes("UNREAD"))
      return false;
    if (filters.status === "read" && email.labelIds?.includes("UNREAD"))
      return false;
    if (
      filters.status === "important" &&
      !email.labelIds?.includes("IMPORTANT")
    )
      return false;

    // Sender filter
    if (filters.sender && email.from !== filters.sender) return false;

    // Date filter
    const emailDate = new Date(email.date);
    if (filters.dateFrom && emailDate < new Date(filters.dateFrom))
      return false;
    if (filters.dateTo && emailDate > new Date(filters.dateTo)) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !email.subject?.toLowerCase().includes(query) &&
        !email.from?.toLowerCase().includes(query)
      )
        return false;
    }

    return true;
  });

  const paginatedEmails = filteredEmails.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Handlers
  const handleSummaryClick = (status) => {
    setFilters({ ...filters, status, sender: null });
    setPage(1);
  };

  const handleSenderClick = (sender) => {
    setFilters({ ...filters, sender });
    setPage(1);
  };

  const handleFilterButtonClick = (status) => {
    setFilters({ ...filters, status, sender: null });
    setPage(1);
  };

  const handleDateChange = (from, to) => {
    setFilters({ ...filters, dateFrom: from, dateTo: to });
    setPage(1);
  };

  const resetDateFilter = () => {
    setFilters({ ...filters, dateFrom: "", dateTo: "" });
    setPage(1);
  };
  // Unified email action handler
  const handleEmailAction = async (emailId, action) => {
    try {
      const res = await fetch("/api/emails/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId, action }),
      });
      const data = await res.json();

      if (!data.success) throw new Error("Action failed");

      setEmails((prev) =>
        prev
          .map((e) =>
            e.id === emailId
              ? action === "read"
                ? { ...e, labelIds: e.labelIds?.filter((l) => l !== "UNREAD") }
                : action === "unread"
                ? { ...e, labelIds: [...(e.labelIds || []), "UNREAD"] }
                : e // archive/delete will remove from UI below
              : e
          )
          .filter(
            (e) => !["delete", "archive"].includes(action) || e.id !== emailId
          )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="  min-h-screen">
      {/* Summary + Top Senders */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Summary Cards (60%) */}
        <div className="w-full lg:w-3/5 grid grid-cols-2 gap-4">
          {[
            {
              title: "Read",
              value: readEmails,
              icon: <Eye className="w-5 h-5 text-green-600" />,
              type: "read",
            },
            {
              title: "Unread",
              value: unreadEmails,
              icon: <EyeOff className="w-5 h-5 text-red-600" />,
              type: "unread",
            },
            {
              title: "Starred",
              value: starredEmails,
              icon: <Star className="w-5 h-5 text-yellow-500" />,
              type: "starred",
            },
            {
              title: "Important",
              value: importantEmails,
              icon: <Inbox className="w-5 h-5 text-blue-600" />,
              type: "important",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              onClick={() => handleSummaryClick(stat.type)}
              className="cursor-pointer"
            >
              <Card
                className={`shadow rounded-xl border border-slate-200 dark:border-slate-700 transition ${
                  filters.status === stat.type
                    ? "bg-slate-100 dark:bg-slate-800"
                    : ""
                }`}
              >
                <CardHeader className="flex items-center gap-3 pb-2">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {stat.icon}
                  </div>
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Top Senders (40%) */}
        <div className="w-full lg:w-2/5">
          <Card className="shadow rounded-xl border border-slate-200 dark:border-slate-700 h-full">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                👥 Top Senders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-80 overflow-y-auto">
              {topSenders.map(([sender, count], i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center pb-2 border-b last:border-none dark:border-slate-700 cursor-pointer px-2 rounded ${
                    filters.sender === sender
                      ? "bg-slate-100 dark:bg-slate-800 font-semibold"
                      : ""
                  }`}
                  onClick={() => handleSenderClick(sender)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-4">
                      #{i + 1}
                    </span>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm flex-shrink-0">
                      {sender?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="truncate max-w-[120px] text-sm text-slate-800 dark:text-slate-200">
                      {sender}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    {count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search & Email List */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by sender or subject..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card className="shadow-lg rounded-2xl border border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 gap-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              📬 Recent Emails
            </CardTitle>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {["all", "unread", "important"].map((f) => (
                <Button
                  key={f}
                  variant={filters.status === f ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleFilterButtonClick(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
              <div className="flex gap-2 items-center">
                <Calendar className="w-4 h-4" />
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    handleDateChange(e.target.value, filters.dateTo)
                  }
                />
                <span className="text-sm">to</span>
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm"
                  value={filters.dateTo}
                  onChange={(e) =>
                    handleDateChange(filters.dateFrom, e.target.value)
                  }
                />
                <Button size="sm" variant="outline" onClick={resetDateFilter}>
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="animate-pulse text-gray-500">Loading emails...</p>
            ) : paginatedEmails.length === 0 ? (
              <p className="text-gray-500 text-sm">No emails found.</p>
            ) : (
              <>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedEmails.map((email) => {
                    const isUnread = email.labelIds?.includes("UNREAD");
                    return (
                      <motion.li
                        key={email.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between py-3 px-3 rounded-lg cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800 mb-2"
                        onClick={() => setSelectedEmail(email)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                            {email.from?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex flex-col">
                            <p
                              className={`truncate max-w-[400px] ${
                                isUnread
                                  ? "font-semibold text-slate-900 dark:text-slate-100"
                                  : "font-normal text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {email.from}
                            </p>
                            <p
                              className={`truncate max-w-[400px] text-sm ${
                                isUnread
                                  ? "font-semibold text-slate-800 dark:text-slate-200"
                                  : "font-normal text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {email.subject}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreVertical className="w-5 h-5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {/* Mark Read/Unread */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmailAction(
                                    email.id,
                                    isUnread ? "read" : "unread"
                                  );
                                }}
                                className="flex items-center gap-2"
                              >
                                {isUnread ? (
                                  <EyeOff className="w-4 h-4 text-red-500" />
                                ) : (
                                  <Eye className="w-4 h-4 text-green-500" />
                                )}
                                {isUnread ? "Mark as Read" : "Mark as Unread"}
                              </DropdownMenuItem>

                              {/* Archive */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmailAction(email.id, "archive");
                                }}
                                className="flex items-center gap-2"
                              >
                                <Archive className="w-4 h-4 text-blue-500" />
                                Archive
                              </DropdownMenuItem>

                              {/* Delete */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmailAction(email.id, "delete");
                                }}
                                className="flex items-center gap-2 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>

                              {/* Open in Gmail */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `https://mail.google.com/mail/u/0/#inbox/${email.id}`,
                                    "_blank"
                                  );
                                }}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4 text-slate-500" />
                                Open in Gmail
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>

                {/* Pagination */}
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * pageSize >= filteredEmails.length}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Modal */}
      {selectedEmail && (
        <EmailModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onEmailRead={(emailId) => {
            // Update local email state
            setEmails((prev) =>
              prev.map((e) =>
                e.id === emailId
                  ? {
                      ...e,
                      labelIds: e.labelIds?.filter((l) => l !== "UNREAD") || [],
                    }
                  : e
              )
            );
          }}
        />
      )}
    </div>
  );
}
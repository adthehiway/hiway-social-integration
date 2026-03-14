"use client";
import { ChevronLeft, ChevronRight, Search, Plus, Clock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const views = ["Daily view", "Weekly view", "Monthly view"];

const accounts = [
  { name: "Hiway", platform: "linkedin", color: "bg-blue-500" },
  { name: "Hiway", platform: "x", color: "bg-white" },
  { name: "On The Hiway", platform: "facebook", color: "bg-blue-600" },
  { name: "Hiway", platform: "instagram", color: "bg-pink-500" },
];

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weekDates = ["9 Mar", "10 Mar", "11 Mar", "12 Mar", "13 Mar", "14 Mar", "15 Mar"];

const scheduledPosts: Record<string, Array<{ time: string; title: string; account: string; platform: string }>> = {
  "10 Mar": [
    { time: "09:07", title: "If you couldn't make it to the Entertainment...", account: "Hiway", platform: "linkedin" },
    { time: "17:10", title: "We're excited to announce our new partnership with...", account: "Hiway", platform: "linkedin" },
  ],
  "12 Mar": [
    { time: "09:25", title: "Content doesn't sit in one place. It's shared, talked...", account: "Hiway", platform: "linkedin" },
  ],
  "14 Mar": [
    { time: "16:55", title: "We've partnered with the producers of Kick Out the...", account: "Hiway", platform: "linkedin" },
  ],
};

export default function CalendarPage() {
  const [activeView, setActiveView] = useState("Weekly view");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">9 Mar - 15 Mar</h1>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition">
              <ChevronLeft size={18} className="text-text-secondary" />
            </button>
            <button className="px-3 py-1.5 rounded-md bg-white/10 text-sm font-medium">Today</button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition">
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition">
              <Clock size={16} className="text-text-muted" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-bg-input border border-border">
            <Search size={14} className="text-text-muted" />
            <input className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-32" placeholder="Search posts" />
          </div>
          <select className="px-3 py-2 rounded-md bg-bg-input border border-border text-sm text-text-secondary outline-none">
            <option>All posts</option>
            <option>Scheduled</option>
            <option>Published</option>
          </select>
          <select className="px-3 py-2 rounded-md bg-bg-input border border-border text-sm text-text-secondary outline-none">
            <option>All types</option>
            <option>Text</option>
            <option>Link</option>
            <option>Video</option>
          </select>
          <select className="px-3 py-2 rounded-md bg-bg-input border border-border text-sm text-text-secondary outline-none">
            <option>All members</option>
          </select>
          <div className="flex rounded-md border border-border overflow-hidden">
            {views.map((v) => (
              <button key={v} onClick={() => setActiveView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  activeView === v ? "bg-white/10 text-text-primary" : "text-text-muted hover:text-text-secondary"
                }`}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex rounded-xl border border-border overflow-hidden bg-bg-card">
        {/* Accounts sidebar */}
        <div className="w-36 shrink-0 border-r border-border">
          <div className="h-10 border-b border-border" />
          <div className="p-2">
            <div className="flex items-center gap-2 h-8 px-2 rounded-md bg-bg-input border border-border mb-3">
              <Search size={12} className="text-text-muted" />
              <input className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none flex-1" placeholder="Search" />
            </div>
            <div className="space-y-1">
              {accounts.map((a, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-[#00a0a0] flex items-center justify-center relative">
                    <span className="text-[10px] font-bold text-white">H</span>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${a.color} border-2 border-bg-frame`} />
                  </div>
                  <span className="text-sm text-text-secondary truncate">{a.name}</span>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-2 mt-4 px-3 py-2 rounded-md border border-border text-sm text-text-secondary hover:border-border-hover transition w-full">
              <Plus size={14} /> Add account
            </button>
          </div>
        </div>

        {/* Week grid */}
        <div className="flex-1 min-w-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((day, i) => (
              <div key={day} className={`px-3 py-2.5 text-center border-r border-border last:border-r-0 ${weekDates[i] === "14 Mar" ? "bg-accent/10" : ""}`}>
                <div className="text-xs font-medium text-text-muted">{day}</div>
                <div className={`text-sm font-semibold mt-0.5 ${weekDates[i] === "14 Mar" ? "text-accent" : "text-text-secondary"}`}>{weekDates[i]}</div>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="grid grid-cols-7 min-h-[500px]">
            {weekDates.map((date, i) => (
              <div key={date} className={`border-r border-border last:border-r-0 p-2 ${date === "14 Mar" ? "bg-accent/5" : ""}`}>
                {scheduledPosts[date]?.map((post, j) => (
                  <div key={j} className="mb-2 p-2 rounded-lg bg-white/5 border border-border hover:border-border-hover transition cursor-pointer group">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs text-accent">●</span>
                      <span className="text-xs font-medium text-text-secondary">{post.account}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <Clock size={10} className="text-text-muted" />
                      <span className="text-[11px] text-text-muted">{post.time}</span>
                    </div>
                    {j === 0 && date === "10 Mar" && (
                      <div className="w-full h-14 rounded bg-white/[0.03] mb-1.5" />
                    )}
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{post.title}</p>
                    <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition">
                      <span className="text-[10px] text-accent cursor-pointer">View →</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

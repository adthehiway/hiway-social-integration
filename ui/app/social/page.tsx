"use client";
import Link from "next/link";
import { Plus, ChevronRight, Ellipsis, Info } from "lucide-react";
import { useState } from "react";

const periods = ["Last 7 days", "Last 28 days", "Last 90 days"];

const kpis = [
  { label: "Followers", value: "337", change: "+ 12", changeColor: "text-success", sparkColor: "bg-accent" },
  { label: "Reach", value: "104", change: "+ 10.64 %", changeColor: "text-success", sparkColor: "bg-accent" },
  { label: "Reach Rate", value: "10.29%", change: "- 26.24 %", changeColor: "text-error", sparkColor: "bg-accent" },
  { label: "Video Views", value: "0", change: null, changeColor: "", sparkColor: "bg-text-muted" },
  { label: "Engagements", value: "23", change: "+ 64.29 %", changeColor: "text-success", sparkColor: "bg-accent" },
  { label: "Engagement Rate", value: "22.12%", change: "+ 48.56 %", changeColor: "text-success", sparkColor: "bg-accent" },
];

const topCountries = [
  { country: "United Kingdom", value: 68 },
  { country: "United States", value: 42 },
  { country: "India", value: 35 },
  { country: "Nigeria", value: 22 },
  { country: "Pakistan", value: 18 },
  { country: "United Arab Emirates", value: 15 },
  { country: "Spain", value: 12 },
  { country: "Canada", value: 10 },
  { country: "France", value: 8 },
  { country: "South Africa", value: 6 },
];

const posts = [
  { title: "Content doesn't sit in one place. It's shared, talked about...", type: "Text", reach: 18, reachRate: "5.34%", rateUp: true, videoViews: "-", reactions: 4, comments: 0, shares: 0, engRate: "50%", engUp: true, date: "Thu, 12 Mar 2026, 09:25" },
  { title: "We're excited to announce our new partnership with Elevate Creative...", type: "Link", reach: 34, reachRate: "10.09%", rateUp: true, videoViews: "-", reactions: 5, comments: 0, shares: 0, engRate: "14.71%", engUp: true, date: "Tue, 10 Mar 2026, 17:10" },
  { title: "If you couldn't make it to the Entertainment Finance Forum...", type: "Link", reach: 52, reachRate: "15.43%", rateUp: true, videoViews: "-", reactions: 5, comments: 0, shares: 1, engRate: "17.31%", engUp: true, date: "Tue, 10 Mar 2026, 09:07" },
];

const hashtags = [
  { tag: "#creatoreconomy", reach: 52 },
  { tag: "#entertainmentindustry", reach: 52 },
  { tag: "#film", reach: 52 },
  { tag: "#filmfinance", reach: 52 },
  { tag: "#financiers", reach: 52 },
];

const tabs = ["Overview", "Post Insights", "Hashtag Analysis", "Competitor Analysis"];

export default function SocialDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [activePeriod, setActivePeriod] = useState("Last 7 days");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Social Insights</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm text-text-secondary hover:border-border-hover transition">
            Sync Insights
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm text-text-secondary hover:border-border-hover transition">
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 rounded-md bg-bg-input border border-border text-sm text-text-secondary outline-none">
            <option>All members</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button key={p} onClick={() => setActivePeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activePeriod === p
                  ? "bg-accent-bg border border-accent text-accent"
                  : "border border-border text-text-muted hover:text-text-secondary"
              }`}>{p}</button>
          ))}
          <button className="px-3 py-1.5 rounded-md text-xs font-medium border border-border text-text-muted">Reset</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl bg-bg-card border border-border p-4 space-y-2">
            <div className="flex items-center gap-1">
              <span className="text-sm text-text-secondary">{k.label}</span>
              <Info size={14} className="text-text-muted" />
            </div>
            <div className="text-2xl font-bold">{k.value}</div>
            {k.change && (
              <span className={`text-xs font-medium ${k.changeColor}`}>{k.change}</span>
            )}
            {/* Mini sparkline placeholder */}
            <div className="flex items-end gap-0.5 h-6">
              {[3, 5, 4, 7, 6, 8, 5].map((h, i) => (
                <div key={i} className={`w-full rounded-sm ${k.sparkColor} opacity-60`} style={{ height: `${h * 3}px` }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Top Countries */}
      <div className="rounded-xl bg-bg-card border border-border p-5 space-y-4">
        <div className="flex items-center gap-1">
          <h2 className="text-base font-semibold">Top Countries</h2>
          <Info size={14} className="text-text-muted" />
        </div>
        <div className="space-y-2">
          {topCountries.map((c) => (
            <div key={c.country} className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-36 shrink-0">{c.country}</span>
              <div className="flex-1 h-5 rounded bg-white/[0.03]">
                <div className="h-full rounded bg-accent/60" style={{ width: `${(c.value / 70) * 100}%` }} />
              </div>
              <span className="text-xs text-text-muted w-8 text-right">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Post Insights */}
      <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Post Insights</h2>
            <p className="text-xs text-text-muted mt-0.5">Most recent posts</p>
          </div>
          <Link href="#" className="px-4 py-2 rounded-md border border-border text-sm text-text-secondary hover:border-border-hover transition">
            View all posts
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border text-left">
              <th className="px-5 py-2.5 text-xs font-semibold text-text-muted">RECENT POSTS</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-text-muted text-center">REACH</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-text-muted text-center">VIDEO VIEWS</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-text-muted text-center">REACTIONS</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-text-muted text-center">COMMENTS</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-text-muted text-center">SHARES</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p, i) => (
              <tr key={i} className="border-t border-border hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-11 rounded bg-white/5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs text-accent">●</span>
                        <span className="text-sm font-medium">Hiway</span>
                      </div>
                      <p className="text-xs text-text-secondary max-w-xs truncate">{p.title}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">{p.date}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-text-secondary">{p.reach}</td>
                <td className="px-3 py-3 text-center text-text-muted">{p.videoViews}</td>
                <td className="px-3 py-3 text-center text-text-secondary">{p.reactions}</td>
                <td className="px-3 py-3 text-center text-text-muted">{p.comments}</td>
                <td className="px-3 py-3 text-center text-text-muted">{p.shares}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hashtag Analysis */}
      <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Hashtag Analysis</h2>
            <p className="text-xs text-text-muted mt-0.5">Highest performing hashtags</p>
          </div>
          <Link href="#" className="px-4 py-2 rounded-md border border-border text-sm text-text-secondary hover:border-border-hover transition">
            Show More
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border">
              <th className="px-5 py-2.5 text-xs font-semibold text-text-muted text-left">HASHTAG</th>
              <th className="px-3 py-2.5 text-xs font-semibold text-text-muted text-center">REACH</th>
            </tr>
          </thead>
          <tbody>
            {hashtags.map((h) => (
              <tr key={h.tag} className="border-t border-border hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 text-accent">{h.tag}</td>
                <td className="px-3 py-3 text-center text-text-secondary">{h.reach}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import { X, Check } from "lucide-react";

const pendingPosts = [
  {
    title: "Interview with Coach",
    submittedBy: "John D.",
    timeAgo: "2 hours ago",
    caption: "Exclusive interview with the head coach about the upcoming season strategy and team changes.",
    platforms: ["X", "FB"],
  },
  {
    title: "Training Camp Montage",
    submittedBy: "Sarah M.",
    timeAgo: "5 hours ago",
    caption: "Behind the scenes at training camp — the team is working harder than ever. New season, new energy!",
    platforms: ["X", "IG", "TT"],
  },
  {
    title: "Fan Meet & Greet Recap",
    submittedBy: "Mike R.",
    timeAgo: "1 day ago",
    caption: "What an amazing turnout at the fan meet & greet! Thank you to everyone who came out.",
    platforms: ["IG", "YT"],
  },
];

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Queue</h1>
          <p className="text-sm text-text-secondary mt-1">Review and approve posts before publishing</p>
        </div>
        <span className="px-4 py-2 rounded-md bg-warning-bg border border-warning/20 text-warning text-sm font-semibold">
          8 pending
        </span>
      </div>

      <div className="space-y-3">
        {pendingPosts.map((post) => (
          <div key={post.title} className="rounded-xl bg-bg-card border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-10 rounded-md bg-white/[0.03] shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold">{post.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                    <span>Submitted by {post.submittedBy}</span>
                    <span>·</span>
                    <span>{post.timeAgo}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-error text-error text-[13px] font-medium hover:bg-error-bg transition">
                  <X size={14} /> Reject
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-success text-white text-[13px] font-semibold hover:opacity-90 transition">
                  <Check size={14} /> Approve
                </button>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-1 space-y-2">
                <div className="text-xs font-semibold text-text-muted">Caption</div>
                <p className="text-[13px] text-text-secondary leading-relaxed">{post.caption}</p>
              </div>
              <div className="w-48 space-y-2">
                <div className="text-xs font-semibold text-text-muted">Platforms</div>
                <div className="flex gap-1.5">
                  {post.platforms.map((p) => (
                    <span key={p} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/5 text-text-secondary">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

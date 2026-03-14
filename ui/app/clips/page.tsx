"use client";
import { Search, Calendar, Send, Repeat } from "lucide-react";
import Link from "next/link";

const clips = [
  { id: "1", title: "Game Highlights Reel", duration: "0:32", date: "Mar 14", res: "1080p", status: "posted", platforms: ["X", "IG", "YT"] },
  { id: "2", title: "Interview with Coach", duration: "1:15", date: "Mar 13", res: "1080p", status: "scheduled", platforms: ["X", "FB"] },
  { id: "3", title: "Training Camp Montage", duration: "2:08", date: "Mar 12", res: "1080p", status: null, platforms: [] },
  { id: "4", title: "Pre-game Warmup", duration: "0:22", date: "Mar 11", res: "1080p", status: null, platforms: [] },
  { id: "5", title: "Fan Day Highlights", duration: "0:45", date: "Mar 10", res: "720p", status: null, platforms: [] },
  { id: "6", title: "Season Recap Clip", duration: "0:58", date: "Mar 8", res: "1080p", status: "posted", platforms: ["X", "IG"] },
];

const filters = ["All Clips", "Recent", "Scheduled", "Posted", "Not Posted"];

function StatusBadge({ status }: { status: string | null }) {
  if (status === "posted") return <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-success-bg border border-success/20 text-success">Posted</span>;
  if (status === "scheduled") return <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-warning-bg border border-warning/20 text-warning">Scheduled</span>;
  return null;
}

export default function ClipsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Clips</h1>
          <p className="text-sm text-text-secondary mt-1">Your clipped video content ready for social distribution</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-64 h-10 px-3 rounded-md bg-bg-input border border-border">
            <Search size={16} className="text-text-muted" />
            <input className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none flex-1" placeholder="Search clips..." />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {filters.map((f, i) => (
          <button key={f} className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
            i === 0 ? "bg-accent-bg border border-accent text-accent" : "border border-border text-text-muted hover:text-text-secondary hover:border-border-hover"
          }`}>{f}</button>
        ))}
        <span className="text-[13px] text-text-muted ml-2">24 clips</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips.map((clip) => (
          <div key={clip.id} className="rounded-xl bg-bg-card border border-border overflow-hidden hover:border-border-hover transition-all group">
            <div className="relative h-36 bg-white/[0.03]">
              <div className="absolute bottom-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded bg-black/70 text-white">{clip.duration}</div>
              <StatusBadge status={clip.status} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 space-y-2">
              <h3 className="text-sm font-semibold">{clip.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span>{clip.date}</span><span>·</span><span>{clip.res}</span>
              </div>
              {clip.platforms.length > 0 && (
                <div className="flex gap-1">
                  {clip.platforms.map((p) => (
                    <span key={p} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent-bg text-accent">{p}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 px-4 pb-3">
              {clip.status === "posted" ? (
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-border text-xs font-medium text-text-muted hover:text-text-secondary transition">
                  <Repeat size={14} /> Repost
                </button>
              ) : clip.status === "scheduled" ? (
                <Link href="/social/create" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-accent text-accent-fg text-xs font-semibold hover:opacity-90 transition">
                  <Calendar size={14} /> Reschedule
                </Link>
              ) : (
                <>
                  <Link href="/social/create" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-accent text-accent-fg text-xs font-semibold hover:opacity-90 transition">
                    <Calendar size={14} /> Schedule
                  </Link>
                  <Link href="/social/create" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-accent text-accent text-xs font-medium hover:bg-accent-bg transition">
                    <Send size={14} /> Post Now
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

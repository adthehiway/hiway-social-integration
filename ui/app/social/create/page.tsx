"use client";
import { Link as LinkIcon, Check, Sparkles, Calendar, Shield, Send, Play } from "lucide-react";

const platforms = [
  { name: "X / Twitter", selected: true },
  { name: "Instagram", selected: true },
  { name: "YouTube", selected: false },
  { name: "TikTok", selected: false },
  { name: "Facebook", selected: false },
];

const hashtags = ["#GameHighlights", "#Sports", "#Hiway"];

export default function CreatePost() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Post</h1>
        <p className="text-sm text-text-secondary mt-1">Distribute a video clip to social platforms</p>
      </div>

      <div className="flex gap-6">
        {/* Left column */}
        <div className="flex-1 space-y-4">
          {/* Video URL */}
          <div className="rounded-xl bg-bg-card border border-border p-5 space-y-3">
            <label className="text-sm font-semibold">Video URL</label>
            <div className="flex items-center gap-2 h-10 px-3 rounded-md bg-bg-input border border-border">
              <LinkIcon size={16} className="text-text-muted" />
              <input className="bg-transparent text-sm text-text-secondary outline-none flex-1" defaultValue="https://cdn.hiway.com/clips/highlights.mp4" />
            </div>
          </div>

          {/* Platforms */}
          <div className="rounded-xl bg-bg-card border border-border p-5 space-y-3">
            <label className="text-sm font-semibold">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button key={p.name} className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                  p.selected
                    ? "bg-accent-bg border border-accent text-accent"
                    : "border border-border text-text-muted hover:border-border-hover"
                }`}>
                  {p.selected && <Check size={14} />}
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="rounded-xl bg-bg-card border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Caption</label>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-gradient-to-br from-purple to-[#5E6AD2] hover:opacity-90 transition">
                <Sparkles size={14} /> AI Generate
              </button>
            </div>
            <textarea
              className="w-full h-24 p-3 rounded-md bg-bg-input border border-border text-sm text-text-primary placeholder:text-text-muted outline-none resize-none focus:border-accent transition"
              defaultValue="Check out this incredible play from last night's game! The energy was unreal."
            />
            <div className="flex gap-1.5">
              {hashtags.map((h) => (
                <span key={h} className="text-xs px-2.5 py-1 rounded-full bg-bg-input border border-border text-accent">{h}</span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="rounded-xl bg-bg-card border border-border p-5 flex items-center justify-between">
            <div className="flex gap-3">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent-bg border border-accent text-accent text-[13px] font-medium">
                <Calendar size={16} /> Schedule
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-text-muted text-[13px] font-medium hover:border-border-hover transition">
                <Shield size={16} /> Require Approval
              </button>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-accent text-accent-fg text-sm font-semibold hover:opacity-90 transition">
              <Send size={16} /> Publish Now
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="w-[340px] shrink-0 space-y-4">
          <div className="rounded-xl bg-bg-card border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold">Preview</h3>
            <div className="w-full h-44 rounded-lg bg-white/[0.03] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Play size={24} className="text-text-primary" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Game Highlights Reel</h4>
              <p className="text-xs text-text-muted mt-1">0:32 · MP4 · 1080p</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-muted">Posting to:</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-accent-bg text-accent">X</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-accent-bg text-accent">IG</span>
            </div>
          </div>

          <div className="rounded-xl bg-bg-card border border-border p-5 space-y-3">
            <h3 className="text-sm font-semibold">Schedule</h3>
            <div className="flex items-center gap-2 h-10 px-3 rounded-md bg-bg-input border border-border">
              <Calendar size={16} className="text-text-muted" />
              <span className="text-sm text-text-secondary">Mar 15, 2026 · 10:00 AM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">or</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent-bg border border-accent text-accent text-xs font-medium">
                <Sparkles size={14} /> Auto-Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

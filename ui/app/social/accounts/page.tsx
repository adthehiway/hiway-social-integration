"use client";
import { Plus, Plug, Instagram, Youtube } from "lucide-react";

const connected = [
  {
    name: "X / Twitter",
    handle: "@hiwaysports",
    icon: "𝕏",
    color: "from-[rgba(0,180,180,0.12)] to-[rgba(0,100,120,0.06)]",
    border: "border-[rgba(0,180,180,0.15)]",
    handleColor: "text-accent",
    stats: [
      { label: "Posts", value: "45" },
      { label: "Followers", value: "12.4K" },
      { label: "Success", value: "89%", color: "text-success" },
    ],
  },
  {
    name: "Instagram",
    handle: "@hiwaysports",
    icon: "IG",
    color: "from-[rgba(120,80,220,0.12)] to-[rgba(80,40,160,0.06)]",
    border: "border-[rgba(120,80,220,0.15)]",
    handleColor: "text-purple",
    stats: [
      { label: "Posts", value: "32" },
      { label: "Followers", value: "8.7K" },
      { label: "Success", value: "94%", color: "text-success" },
    ],
  },
  {
    name: "YouTube",
    handle: "Hiway Sports Official",
    icon: "YT",
    color: "from-[rgba(239,68,68,0.12)] to-[rgba(239,68,68,0.06)]",
    border: "border-[rgba(239,68,68,0.15)]",
    handleColor: "text-error",
    stats: [
      { label: "Posts", value: "21" },
      { label: "Subscribers", value: "3.2K" },
    ],
  },
];

const notConnected = [
  { name: "TikTok", icon: "TT" },
  { name: "Facebook", icon: "fb" },
];

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connected Accounts</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your social media platform connections</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-fg rounded-md text-sm font-medium hover:opacity-90 transition">
          <Plus size={16} /> Connect Platform
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {connected.map((acc) => (
          <div key={acc.name} className={`rounded-xl bg-gradient-to-br ${acc.color} border ${acc.border} p-5 space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[10px] bg-white/5 flex items-center justify-center text-lg font-bold">
                  {acc.icon}
                </div>
                <div>
                  <div className="text-[15px] font-semibold">{acc.name}</div>
                  <div className={`text-[13px] ${acc.handleColor}`}>{acc.handle}</div>
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success-bg border border-success/20 text-success text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-success" /> Connected
              </span>
            </div>
            <div className="flex gap-6">
              {acc.stats.map((s) => (
                <div key={s.label}>
                  <div className={`text-xl font-bold ${s.color || ""}`}>{s.value}</div>
                  <div className="text-xs text-text-muted">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button className="px-3 py-1.5 rounded-md border border-error text-error text-xs font-medium hover:bg-error-bg transition">
                Disconnect
              </button>
            </div>
          </div>
        ))}

        {notConnected.map((acc) => (
          <div key={acc.name} className="rounded-xl bg-bg-card border border-dashed border-white/8 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[10px] bg-white/[0.03] flex items-center justify-center text-lg font-bold text-text-muted">
                  {acc.icon}
                </div>
                <div>
                  <div className="text-[15px] font-semibold">{acc.name}</div>
                  <div className="text-[13px] text-text-muted">Not connected</div>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-accent text-accent text-[13px] font-medium hover:bg-accent-bg transition">
                <Plug size={14} /> Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

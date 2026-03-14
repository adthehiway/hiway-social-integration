"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartColumn, Upload, Video, Link2, Scissors, Share2, Send,
  ShieldCheck, Users, CalendarDays, BarChart3,
} from "lucide-react";

const contentNav = [
  { label: "Dashboard", icon: ChartColumn, href: "/" },
  { label: "Upload", icon: Upload, href: "#" },
  { label: "Content Library", icon: Video, href: "#" },
  { label: "SmartLinks", icon: Link2, href: "#" },
];

const socialNav = [
  { label: "My Clips", icon: Scissors, href: "/clips" },
  { label: "Insights", icon: BarChart3, href: "/social" },
  { label: "Calendar", icon: CalendarDays, href: "/social/calendar" },
  { label: "Create Post", icon: Send, href: "/social/create" },
  { label: "Approvals", icon: ShieldCheck, href: "/social/approvals" },
  { label: "Accounts", icon: Users, href: "/social/accounts" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/social") return pathname === "/social";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-60 shrink-0 flex flex-col gap-1 p-4 overflow-y-auto">
      {/* Company */}
      <div className="flex items-center gap-2.5 px-1 py-2 mb-2">
        <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-b from-accent to-[#00a0a0] flex items-center justify-center">
          <span className="text-white font-bold text-base">H</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-text-primary">Hiway Sports</div>
          <div className="text-[10px] font-semibold text-text-secondary">Admin</div>
        </div>
      </div>

      {/* Content section */}
      <div className="px-2 pt-3 pb-1 text-[10px] font-bold text-text-muted tracking-[1.5px]">CONTENT</div>
      {contentNav.map((item) => (
        <Link key={item.label} href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${
            isActive(item.href) && item.href !== "#"
              ? "bg-white/10 border border-white/10 text-text-primary"
              : "text-text-muted hover:text-text-secondary hover:bg-white/5"
          }`}>
          <item.icon size={20} />
          {item.label}
        </Link>
      ))}

      {/* Social section */}
      <div className="px-2 pt-4 pb-1 text-[10px] font-bold text-text-muted tracking-[1.5px]">SOCIAL</div>
      {socialNav.map((item) => (
        <Link key={item.label} href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${
            isActive(item.href)
              ? "bg-white/10 border border-white/10 text-text-primary"
              : "text-text-muted hover:text-text-secondary hover:bg-white/5"
          }`}>
          <item.icon size={20} />
          {item.label}
        </Link>
      ))}
    </aside>
  );
}

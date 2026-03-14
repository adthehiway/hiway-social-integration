"use client";
import { usePathname } from "next/navigation";
import { LifeBuoy, Moon } from "lucide-react";

const tabs = [
  { label: "Content", prefix: "/" },
  { label: "Marketing", prefix: "/marketing" },
  { label: "Analytics", prefix: "/analytics" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border">
      <nav className="flex gap-1 p-1 rounded-xl">
        {tabs.map((tab) => {
          const active = tab.prefix === "/" ? true : pathname.startsWith(tab.prefix);
          return (
            <button key={tab.label} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              active && tab.prefix === "/"
                ? "bg-white/8 border border-white/10 text-text-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            }`}>
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="flex gap-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
          <LifeBuoy size={18} className="text-text-muted" />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
          <Moon size={18} className="text-text-muted" />
        </button>
      </div>
    </header>
  );
}

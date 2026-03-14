import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/sidebar";
import Header from "./components/header";

export const metadata: Metadata = {
  title: "Hiway Social Integration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen p-3">
        <div
          className="flex h-[calc(100vh-24px)] rounded-3xl border border-border overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

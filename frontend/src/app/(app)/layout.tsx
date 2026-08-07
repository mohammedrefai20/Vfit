"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Dumbbell, Library, TrendingUp, History,
  Settings, Info, LogOut, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import PageBackground from "@/components/PageBackground";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workout Plan", href: "/workouts", icon: Dumbbell },
  { label: "Exercise Library", href: "/exercises", icon: Library },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Workout Versions", href: "/workouts/versions", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "About", href: "/about", icon: Info },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    const saved = localStorage.getItem("vfit_sidebar_open");
    if (saved !== null) setSidebarOpen(saved === "true");
  }, []);

  function toggleSidebar() {
    setSidebarOpen((open) => {
      localStorage.setItem("vfit_sidebar_open", String(!open));
      return !open;
    });
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-text-muted">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-64 border-r border-border p-6 hidden md:flex flex-col fixed h-screen z-30 bg-bg"
          >
            <div className="flex items-center justify-between mb-10">
              <span className="font-display font-bold text-xl">V Fit</span>
              <button onClick={toggleSidebar} className="text-text-muted hover:text-text-primary transition p-1">
                <PanelLeftClose size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                      active ? "bg-primary/10 text-primary font-medium" : "text-text-muted hover:bg-white/5"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="flex items-center justify-between px-3 py-2 mb-1">
              <span className="text-text-muted text-sm">Theme</span>
              <ThemeToggle />
            </div>

            <button
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:bg-white/5 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="hidden md:flex fixed top-6 left-6 z-30 items-center justify-center w-10 h-10 rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary transition"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}
      <PageBackground image="https://images.pexels.com/photos/5327571/pexels-photo-5327571.jpeg" />
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 256 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="min-h-screen px-6 md:px-10 py-8"
      >
        <div className={`mx-auto transition-all duration-300 ${sidebarOpen ? "max-w-5xl" : "max-w-6xl text-[1.03rem]"}`}>
          {children}
        </div>
      </motion.main>
    </div>
  );
}
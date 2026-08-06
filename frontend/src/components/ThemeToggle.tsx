"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/5 transition">
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
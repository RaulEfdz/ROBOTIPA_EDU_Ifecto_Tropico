"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Evita la renderización en el servidor

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full dark:bg-yellow-200 bg-emerald-200 transition-colors duration-200"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-yellow-500 transition-transform duration-900 ease-in-out hover:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 text-emerald-500 transition-transform duration-900 ease-in-out hover:-rotate-90" />
      )}
    </button>
  );
}

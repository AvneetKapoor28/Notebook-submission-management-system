"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    // Read from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const root = document.documentElement;
    if (
      newTheme === "dark" ||
      (newTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-1">
      {(["light", "dark", "system"] as const).map((t) => {
        const Icon = {
          light: Sun,
          dark: Moon,
          system: Laptop,
        }[t];
        const isActive = theme === t;
        return (
          <button
            key={t}
            onClick={() => changeTheme(t)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-md py-1 px-1.5 text-[10px] font-medium transition-all focus:outline-none cursor-pointer",
              isActive
                ? "bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-border/40 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={`Switch to ${t} theme`}
          >
            <Icon className="size-3" />
            <span className="capitalize">{t}</span>
          </button>
        );
      })}
    </div>
  );
}

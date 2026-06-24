"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  AlertTriangle,
  BarChart3,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

type ClassItem = {
  id: string;
  name: string;
  studentCount: number;
  activeStudentCount: number;
  topicCount: number;
  latestCheckDate: string | null;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/classes", label: "Classes", icon: BookOpen },
  { href: "/defaulters", label: "Defaulters", icon: AlertTriangle },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppShell({
  children,
  classes = [],
}: {
  children: React.ReactNode;
  classes?: ClassItem[];
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground animate-in fade-in duration-200">
      {/* Mobile menu trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 rounded-md border border-border bg-card p-1.5 shadow-sm lg:hidden focus:outline-none focus:ring-1 focus:ring-ring"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {/* Sidebar background overlay on mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-45 flex w-60 flex-col border-r border-sidebar-border bg-sidebar px-3 py-5 transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Workspace Title */}
        <div className="mb-6 px-3">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-base font-semibold tracking-tight"
          >
            <span className="text-xl">📚</span>
            <span className="font-heading text-lg">{APP_NAME}</span>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            Classroom notebook tracking
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80 mb-2">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <hr className="my-5 border-sidebar-border" />

        {/* Classes Workspace Section */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">
              My Classes
            </p>
            <Link
              href="/classes"
              className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
            >
              Manage
            </Link>
          </div>
          <div className="space-y-0.5">
            {classes.length > 0 ? (
              classes.map((cls) => {
                const href = `/classes/${cls.id}`;
                const isActive = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={cls.id}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded px-3 py-1 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs">🏫</span>
                      <span className="truncate">{cls.name}</span>
                    </div>
                    {isActive && <ChevronRight className="size-3.5 opacity-60" />}
                  </Link>
                );
              })
            ) : (
              <p className="px-3 py-1.5 text-xs text-muted-foreground/75 italic">
                No classes setup yet
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto border-t border-sidebar-border pt-4 px-3 flex flex-col gap-3">
          <ThemeToggle />
          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Session</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Pane */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-screen lg:pl-60">
        {/* Dynamic page contents */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12 xl:px-14 mt-12 lg:mt-0">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

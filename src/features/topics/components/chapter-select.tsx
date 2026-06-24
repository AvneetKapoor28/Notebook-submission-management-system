"use client";

import * as React from "react";
import { ChevronDown, Plus, BookOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ChapterSelectProps {
  existingChapters: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function ChapterSelect({
  existingChapters,
  value,
  onChange,
  placeholder = "Select or type chapter...",
  id,
}: ChapterSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredChapters = existingChapters.filter((ch) =>
    ch.toLowerCase().includes((value || "").toLowerCase())
  );

  const showCreateOption =
    value &&
    value.trim().length > 0 &&
    !existingChapters.some(
      (ch) => ch.toLowerCase() === value.trim().toLowerCase()
    );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-10 h-10 shadow-sm border-border/80 focus:border-primary/50 transition-colors"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border/80 bg-white/95 backdrop-blur-md p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-100 max-h-60 overflow-y-auto scrollbar-thin">
          {filteredChapters.length > 0 ? (
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                Existing Chapters
              </div>
              {filteredChapters.map((chapter) => {
                const isSelected =
                  value.trim().toLowerCase() === chapter.toLowerCase();
                return (
                  <button
                    key={chapter}
                    type="button"
                    onClick={() => {
                      onChange(chapter);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer outline-none",
                      isSelected
                        ? "bg-neutral-100/80 font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-3.5 text-neutral-400" />
                      <span>{chapter}</span>
                    </div>
                    {isSelected && <Check className="size-3.5 text-foreground" />}
                  </button>
                );
              })}
            </div>
          ) : (
            !showCreateOption && (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center italic">
                No chapters found. Type to create a new one.
              </div>
            )
          )}

          {showCreateOption && (
            <>
              {filteredChapters.length > 0 && (
                <div className="my-1 border-t border-border/40" />
              )}
              <button
                type="button"
                onClick={() => {
                  onChange(value.trim());
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left px-2.5 py-2 text-xs text-emerald-800 hover:text-emerald-900 bg-emerald-50/50 hover:bg-emerald-50 rounded-lg border border-emerald-100/40 transition-colors cursor-pointer outline-none"
              >
                <Plus className="size-3.5 text-emerald-600" />
                <span className="font-medium">
                  Create new chapter: <strong className="font-semibold">"{value.trim()}"</strong>
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

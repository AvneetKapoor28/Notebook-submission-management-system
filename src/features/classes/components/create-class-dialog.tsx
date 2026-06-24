"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClassForm } from "./class-form";

export function CreateClassDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-medium shadow-sm transition-all duration-200"
      >
        <Plus className="size-4" />
        <span>New Class</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with subtle glassmorphism */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-card border border-border/80 shadow-2xl rounded-xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="mb-6 space-y-1.5">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                Set up a new class workspace
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create a teaching group, set the academic year, and initialize your student roster.
              </p>
            </div>

            {/* Form */}
            <ClassForm onSuccess={() => setIsOpen(false)} layout="dialog" />
          </div>
        </div>
      )}
    </>
  );
}

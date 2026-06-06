"use client";

import React from "react";

export type WizardStep = "upload" | "interview" | "generate" | "result";

const STEPS: { id: WizardStep; label: string; n: number }[] = [
  { id: "upload", label: "Upload", n: 1 },
  { id: "interview", label: "Интервью", n: 2 },
  { id: "generate", label: "Генерация", n: 3 },
  { id: "result", label: "Результат", n: 4 },
];

export function StepIndicator({ current }: { current: WizardStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Прогресс" className="mb-8">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-accent text-ink"
                      : isDone
                        ? "bg-accent/20 text-accent"
                        : "bg-edge text-slate-400",
                  ].join(" ")}
                >
                  {isDone ? "✓" : step.n}
                </span>
                <span
                  className={[
                    "hidden text-sm font-medium sm:inline",
                    isActive ? "text-slate-100" : "text-slate-500",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <span
                  className={[
                    "h-px flex-1 transition-colors",
                    idx < currentIndex ? "bg-accent/40" : "bg-edge",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

"use client";

import React, { useState } from "react";
import { renderMarkdown } from "@/lib/markdown";

export function ResultStep({
  markdown,
  onRestart,
}: {
  markdown: string;
  onRestart: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (insecure context); silently ignore.
    }
  };

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "horizon-resume.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasPlaceholders = /\[Insert Metric[^\]]*\]/.test(markdown);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm leading-relaxed text-slate-300">
        Готово. Это черновик вашего Senior IC-резюме под локальный рынок.
        {hasPlaceholders && (
          <>
            {" "}
            <span className="metric-placeholder">[Insert Metric ...]</span> - это места,
            где ИИ намеренно не выдумывал цифры. Подставьте реальные значения сами,
            чтобы избежать галлюцинаций.
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-xl border border-edge bg-panel px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:border-accent/60"
        >
          {copied ? "Скопировано ✓" : "Скопировать Markdown"}
        </button>
        <button
          type="button"
          onClick={download}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
        >
          Скачать .md
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="ml-auto rounded-xl px-4 py-2.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          Начать заново
        </button>
      </div>

      <div className="rounded-2xl border border-edge bg-ink/40 px-6 py-5">
        {renderMarkdown(markdown)}
      </div>
    </div>
  );
}

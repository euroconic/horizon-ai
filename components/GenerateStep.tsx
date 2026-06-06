"use client";

import React from "react";

export function GenerateStep() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-edge border-t-accent" />
      <div className="max-w-md space-y-2">
        <p className="text-lg font-medium text-slate-100">Собираем ваше резюме</p>
        <p className="text-sm leading-relaxed text-slate-400">
          Ваш глубокий опыт требует чуть больше времени для анализа ИИ...
        </p>
      </div>
    </div>
  );
}

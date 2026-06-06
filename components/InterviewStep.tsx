"use client";

import React, { useState } from "react";
import type { QAItem } from "@/lib/types";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/types";

export function InterviewStep({
  history,
  question,
  loading,
  onAnswer,
  onSkip,
}: {
  history: QAItem[];
  question: string | null;
  loading: boolean;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
}) {
  const [answer, setAnswer] = useState("");

  // history.length answered so far; current is the next one.
  const questionNumber = Math.min(history.length + 1, MAX_INTERVIEW_QUESTIONS);
  const canSend = !loading && answer.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    onAnswer(answer.trim());
    setAnswer("");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-edge bg-ink/40 px-4 py-3 text-sm leading-relaxed text-slate-300">
        Пара уточняющих вопросов в формате STAR (Ситуация - Задача - Действие - Результат).
        Это поможет добавить в резюме конкретные результаты вместо общих фраз.
      </div>

      {/* Chat transcript */}
      <div className="space-y-3">
        {history.map((qa, idx) => (
          <div key={idx} className="space-y-2">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-panel px-4 py-2.5 text-sm text-slate-200">
              {qa.question}
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-accent/15 px-4 py-2.5 text-sm text-slate-100">
              {qa.answer}
            </div>
          </div>
        ))}

        {question && !loading && (
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-panel px-4 py-2.5 text-sm text-slate-200">
            {question}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-edge border-t-accent" />
            Думаем над следующим вопросом...
          </div>
        )}
      </div>

      {question && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Ваш ответ</label>
            <span className="text-xs text-slate-500">
              Вопрос {questionNumber} из {MAX_INTERVIEW_QUESTIONS}
            </span>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            rows={4}
            disabled={loading}
            placeholder="Опишите ситуацию, что вы сделали и какой получился результат..."
            className="w-full resize-y rounded-xl border border-edge bg-ink/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSkip}
              disabled={loading}
              className="text-sm text-slate-400 transition-colors hover:text-slate-200 disabled:opacity-40"
            >
              Пропустить интервью
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ответить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

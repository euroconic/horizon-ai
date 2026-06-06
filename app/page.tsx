"use client";

import React, { useCallback, useState } from "react";
import type {
  ResumeProfile,
  QAItem,
  ParseResponse,
  InterviewResponse,
  GenerateResponse,
  ApiError,
} from "@/lib/types";
import { StepIndicator, type WizardStep } from "@/components/StepIndicator";
import { ErrorBanner } from "@/components/ErrorBanner";
import { UploadStep, type UploadSubmit } from "@/components/UploadStep";
import { InterviewStep } from "@/components/InterviewStep";
import { GenerateStep } from "@/components/GenerateStep";
import { ResultStep } from "@/components/ResultStep";

const STEP_TITLES: Record<WizardStep, string> = {
  upload: "Загрузите резюме",
  interview: "STAR-интервью",
  generate: "Генерация резюме",
  result: "Ваше новое резюме",
};

// Best-effort error extraction from an API response.
async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as ApiError;
    if (data?.error) return data.error;
  } catch {
    /* fall through */
  }
  return `Ошибка сервера (${res.status}). Попробуйте ещё раз.`;
}

export default function HorizonWizard() {
  const [step, setStep] = useState<WizardStep>("upload");
  const [error, setError] = useState<string | null>(null);

  // Collected wizard state.
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [country, setCountry] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [history, setHistory] = useState<QAItem[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState("");

  // Per-step loading flags.
  const [parseLoading, setParseLoading] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);

  const reset = () => {
    setStep("upload");
    setError(null);
    setProfile(null);
    setCountry("");
    setTargetRole("");
    setHistory([]);
    setQuestion(null);
    setMarkdown("");
    setParseLoading(false);
    setInterviewLoading(false);
  };

  // ---- STEP 3: generate ----
  const runGenerate = useCallback(
    async (
      activeProfile: ResumeProfile,
      qa: QAItem[],
      activeCountry: string,
      activeRole: string
    ) => {
      setStep("generate");
      setError(null);
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: activeProfile,
            qa,
            country: activeCountry,
            target_role: activeRole,
          }),
        });
        if (!res.ok) throw new Error(await readError(res));
        const data = (await res.json()) as GenerateResponse;
        setMarkdown(data.markdown);
        setStep("result");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось сгенерировать резюме.");
        setStep("interview");
      }
    },
    []
  );

  // ---- STEP 2: interview turn ----
  // Fetch the next question given the running history. If the API says done,
  // jump straight to generation.
  const fetchNextQuestion = useCallback(
    async (activeProfile: ResumeProfile, runningHistory: QAItem[]) => {
      setInterviewLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: activeProfile, history: runningHistory }),
        });
        if (!res.ok) throw new Error(await readError(res));
        const data = (await res.json()) as InterviewResponse;
        if (data.done || !data.question) {
          setQuestion(null);
          await runGenerate(activeProfile, runningHistory, country, targetRole);
        } else {
          setQuestion(data.question);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось получить вопрос.");
      } finally {
        setInterviewLoading(false);
      }
    },
    [country, targetRole, runGenerate]
  );

  // ---- STEP 1: parse ----
  const handleParse = async ({ file, text, country: c, targetRole: role }: UploadSubmit) => {
    setParseLoading(true);
    setError(null);
    try {
      let res: Response;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        res = await fetch("/api/parse", { method: "POST", body: form });
      } else {
        res = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }
      if (!res.ok) throw new Error(await readError(res));
      const data = (await res.json()) as ParseResponse;

      setProfile(data.profile);
      setCountry(c);
      setTargetRole(role);
      setHistory([]);
      setQuestion(null);
      setStep("interview");
      // Kick off the first interview question.
      await fetchNextQuestion(data.profile, []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось разобрать резюме.");
    } finally {
      setParseLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!profile || !question) return;
    const nextHistory: QAItem[] = [...history, { question, answer }];
    setHistory(nextHistory);
    setQuestion(null);
    await fetchNextQuestion(profile, nextHistory);
  };

  const handleSkip = async () => {
    if (!profile) return;
    setQuestion(null);
    await runGenerate(profile, history, country, targetRole);
  };

  return (
    <main className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-50">Horizon AI</h1>
          <p className="mt-2 text-sm text-slate-400">
            Бережная перепаковка зрелого опыта под рынки США, ЕС и ОАЭ
          </p>
        </header>

        <StepIndicator current={step} />

        <section className="rounded-2xl border border-edge bg-panel p-6 shadow-xl shadow-black/20 sm:p-8">
          <h2 className="mb-5 text-xl font-semibold text-slate-100">{STEP_TITLES[step]}</h2>

          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {step === "upload" && <UploadStep loading={parseLoading} onSubmit={handleParse} />}

          {step === "interview" && (
            <InterviewStep
              history={history}
              question={question}
              loading={interviewLoading}
              onAnswer={handleAnswer}
              onSkip={handleSkip}
            />
          )}

          {step === "generate" && <GenerateStep />}

          {step === "result" && <ResultStep markdown={markdown} onRestart={reset} />}
        </section>

        <footer className="mt-6 text-center text-xs text-slate-600">
          Ваш опыт ценен. Мы не удаляем его, мы переводим его на язык локального рынка.
        </footer>
      </div>
    </main>
  );
}

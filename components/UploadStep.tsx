"use client";

import React, { useRef, useState } from "react";
import { TARGET_COUNTRIES } from "@/lib/types";

export interface UploadSubmit {
  file: File | null;
  text: string;
  country: string;
  targetRole: string;
}

export function UploadStep({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (data: UploadSubmit) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [useText, setUseText] = useState(false);
  const [text, setText] = useState("");
  const [country, setCountry] = useState<string>(TARGET_COUNTRIES[0]);
  const [targetRole, setTargetRole] = useState("Senior Product Manager");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = ".pdf,.docx";

  const isValidFile = (f: File) =>
    /\.(pdf|docx)$/i.test(f.name);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && isValidFile(dropped)) {
      setFile(dropped);
      setUseText(false);
    }
  };

  const canSubmit =
    !loading && (useText ? text.trim().length > 0 : file !== null) && targetRole.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm leading-relaxed text-slate-300">
        Ваш опыт ценен. Мы не удаляем его, мы переводим его на язык локального рынка.
        Если вы боитесь, что вас сочтут «слишком зрелым» (overqualified) - это нормально.
        Horizon аккуратно перепакует ваш управленческий опыт в сильное Senior IC-резюме.
      </div>

      {!useText ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={[
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
            dragActive ? "border-accent bg-accent/10" : "border-edge bg-ink/40 hover:border-accent/60",
          ].join(" ")}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && isValidFile(f)) setFile(f);
            }}
          />
          {file ? (
            <div className="space-y-1">
              <p className="font-medium text-slate-100">{file.name}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="text-xs text-accent hover:underline"
              >
                Выбрать другой файл
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-slate-200">Перетащите резюме сюда или нажмите, чтобы выбрать</p>
              <p className="text-xs text-slate-500">Поддерживаются .pdf и .docx</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Вставьте текст резюме
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Скопируйте сюда текст вашего резюме на русском..."
            className="w-full resize-y rounded-xl border border-edge bg-ink/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setUseText((v) => !v);
        }}
        className="text-sm text-accent hover:underline"
      >
        {useText ? "← Загрузить файл" : "Нет файла? Вставить текст"}
      </button>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Целевой рынок
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl border border-edge bg-ink/60 px-3 py-2.5 text-sm text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {TARGET_COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-panel">
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Целевая роль
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Senior Product Manager"
            className="w-full rounded-xl border border-edge bg-ink/60 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => onSubmit({ file: useText ? null : file, text, country, targetRole })}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <Spinner /> Распаковываем опыт...
          </>
        ) : (
          "Распаковать опыт"
        )}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/40 border-t-ink" />
  );
}

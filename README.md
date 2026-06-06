# Horizon AI — MVP 1.0

Бережная перепаковка резюме зрелых специалистов (40+) из СНГ под рынки США / Европы / ОАЭ. Решает проблему **overqualification** через контролируемый де-левелинг и кросс-культурную адаптацию стиля.

Quick & Dirty MVP по мотивам PRD (`Horizon_AI_Guring_Style_PRD_MVP.pdf`). Стек PRD был no-code (Bubble + Make + Supabase); здесь это реальное работающее веб-приложение на **Next.js 15 + Claude API**, реализующее ядро ценности.

## Что внутри

Воронка-визард из 4 шагов:

1. **Upload** — загрузка резюме `.pdf` / `.docx` (или вставка текста) + выбор целевой страны и роли.
2. **STAR-интервью** — Claude задаёт до 3 уточняющих вопросов на русском, чтобы вытащить потерянные измеримые результаты.
3. **Генерация** — Downleveling Engine трансформирует профиль топ-менеджера в Senior Individual Contributor под целевой рынок.
4. **Результат** — англоязычное резюме в Markdown. Незаполненные метрики `[Insert Metric ...]` подсвечены жёлтым (Hallucination Buffer из PRD — ИИ не выдумывает цифры).

## Архитектура

| Слой | Файлы |
|---|---|
| Промпты (Модули 1-3 PRD) | `lib/prompts.ts` |
| Claude-клиент + JSON-парсинг | `lib/anthropic.ts` |
| Извлечение текста PDF/DOCX | `lib/extract.ts` |
| Контракты данных | `lib/types.ts` |
| API: парсинг → JSON | `app/api/parse/route.ts` |
| API: STAR-вопрос | `app/api/interview/route.ts` |
| API: де-левелинг → резюме | `app/api/generate/route.ts` |
| Визард UI | `app/page.tsx` + `components/*` |

Поток данных: `PDF/DOCX → extractText → Claude (PARSE_SYSTEM) → JSON-профиль → STAR-интервью → Downleveling Engine → Markdown-резюме`.

## Запуск

```bash
# 1. Ключ
#    Вставь ANTHROPIC_API_KEY в .env.local

# 2. Зависимости (уже установлены)
npm install

# 3. Dev
npm run dev
# http://localhost:3000
```

Модель по умолчанию: `claude-3-5-sonnet-latest` (см. `lib/prompts.ts`).

## Сознательные сокращения (Q&D)

- Голосовое интервью (Whisper / Web Audio из PRD) заменено на текстовый чат.
- Нет БД — сессия живёт в state визарда (Supabase из PRD не нужен для демо).
- Нет авторизации, нет экспорта в PDF (только Markdown copy / download).
- Парсинг файлов — server-side, синхронно, без очередей.

## Следующие шаги к проду

1. Стриминг генерации (сейчас один блокирующий вызов до 30 сек).
2. Экспорт в `.pdf` с форматированием целевой страны.
3. Persist сессий (Supabase) + редактирование JSON-профиля перед генерацией.
4. Голосовой STAR-интервьюер.

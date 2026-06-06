// Minimal markdown -> React renderer for Horizon AI generated resumes.
// Intentionally NOT a full CommonMark parser - just enough to render a resume:
// #/##/### headings, **bold**, bullet lists (- / *), and paragraphs.
// Also highlights unresolved [Insert Metric ...] placeholders (PRD Hallucination
// Buffer rule) by wrapping them in <span class="metric-placeholder">.

import React from "react";

const METRIC_RE = /\[Insert Metric[^\]]*\]/g;

// Inline formatting: split on **bold** and metric placeholders, return React nodes.
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];

  // First pass: split out **bold** segments while preserving order.
  // We tokenize on ** ... ** then within each plain segment handle metrics.
  const boldRe = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  const pushPlain = (chunk: string, key: string) => {
    if (!chunk) return;
    // Split plain chunk by metric placeholders.
    let mLast = 0;
    let m: RegExpExecArray | null;
    let j = 0;
    METRIC_RE.lastIndex = 0;
    while ((m = METRIC_RE.exec(chunk)) !== null) {
      if (m.index > mLast) {
        nodes.push(chunk.slice(mLast, m.index));
      }
      nodes.push(
        <span key={`${key}-m${j}`} className="metric-placeholder">
          {m[0]}
        </span>
      );
      mLast = m.index + m[0].length;
      j += 1;
    }
    if (mLast < chunk.length) {
      nodes.push(chunk.slice(mLast));
    }
  };

  while ((match = boldRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pushPlain(text.slice(lastIndex, match.index), `${keyPrefix}-p${i}`);
    }
    nodes.push(
      <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-slate-50">
        {renderInline(match[1], `${keyPrefix}-bi${i}`)}
      </strong>
    );
    lastIndex = match.index + match[0].length;
    i += 1;
  }
  if (lastIndex < text.length) {
    pushPlain(text.slice(lastIndex), `${keyPrefix}-p${i}`);
  }

  return nodes;
}

export function renderMarkdown(markdown: string): React.ReactNode {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];

  let listBuffer: string[] = [];
  let paragraphBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const items = listBuffer;
    blocks.push(
      <ul key={`ul-${key++}`} className="my-3 ml-5 list-disc space-y-1.5 text-slate-200">
        {items.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {renderInline(item, `li-${key}-${idx}`)}
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ");
    blocks.push(
      <p key={`p-${key++}`} className="my-2 leading-relaxed text-slate-200">
        {renderInline(text, `p-${key}`)}
      </p>
    );
    paragraphBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushList();
      flushParagraph();
      continue;
    }

    // Horizontal rule.
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      flushParagraph();
      blocks.push(<hr key={`hr-${key++}`} className="my-4 border-edge" />);
      continue;
    }

    // Headings.
    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushList();
      flushParagraph();
      const level = heading[1].length;
      const content = heading[2];
      if (level === 1) {
        blocks.push(
          <h1 key={`h-${key++}`} className="mt-2 mb-1 text-2xl font-bold text-slate-50">
            {renderInline(content, `h1-${key}`)}
          </h1>
        );
      } else if (level === 2) {
        blocks.push(
          <h2
            key={`h-${key++}`}
            className="mt-5 mb-2 border-b border-edge pb-1 text-lg font-semibold uppercase tracking-wide text-accent"
          >
            {renderInline(content, `h2-${key}`)}
          </h2>
        );
      } else {
        blocks.push(
          <h3 key={`h-${key++}`} className="mt-4 mb-1 text-base font-semibold text-slate-100">
            {renderInline(content, `h3-${key}`)}
          </h3>
        );
      }
      continue;
    }

    // Bullet list item.
    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flushParagraph();
      listBuffer.push(bullet[1]);
      continue;
    }

    // Plain paragraph line.
    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushList();
  flushParagraph();

  return <div className="markdown-body">{blocks}</div>;
}

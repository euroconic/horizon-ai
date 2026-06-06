// Server-only text extraction from uploaded resume files (PDF / DOCX).
// pdf-parse and mammoth are CommonJS; they are kept out of the bundle via
// serverExternalPackages in next.config.js.

export async function extractText(
  buffer: Buffer,
  filename: string,
  mime: string
): Promise<string> {
  const name = filename.toLowerCase();
  const isPdf = mime === "application/pdf" || name.endsWith(".pdf");
  const isDocx =
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx");

  if (isPdf) {
    // Lazy require to avoid pdf-parse's debug-mode top-level file read.
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return clean(data.text);
  }

  if (isDocx) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return clean(value);
  }

  // Fallback: treat as plain text (.txt or unknown).
  return clean(buffer.toString("utf-8"));
}

function clean(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

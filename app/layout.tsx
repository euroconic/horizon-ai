import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Horizon AI - Career Repackaging",
  description:
    "Бережная перепаковка резюме зрелых специалистов из СНГ под рынки Европы, США и ОАЭ.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
